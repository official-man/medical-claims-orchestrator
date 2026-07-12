#!/usr/bin/env python3
"""
ocr_vision_parse.py — OCR-Vision Skill: Step 1 of the /process_claim pipeline.

Accepts one or more file paths as CLI arguments. Processes each file sequentially
via Gemini, then merges all extracted ClaimAudit objects into a single unified
JSON output written to production_artifacts/claim_raw.json.

Usage:
  python3 ocr_vision_parse.py <file1> [<file2> <file3> ...]
  python3 ocr_vision_parse.py  (defaults to sample_unstructured_discharge.txt)
"""

import sys
import os
import json
from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
from google.genai import types

# ── Path resolution ─────────────────────────────────────────────────────────
REPO_ROOT     = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
DEFAULT_INPUT = os.path.join(REPO_ROOT, "production_artifacts", "sample_unstructured_discharge.txt")
OUTPUT_FILE   = os.path.join(REPO_ROOT, "production_artifacts", "claim_raw.json")

# ── Pydantic Schemas ────────────────────────────────────────────────────────

class DocumentRefs(BaseModel):
    mrd_no: Optional[str] = Field(description="Medical Record Department number")
    admission_no: Optional[str] = Field(description="Admission number")
    hospital: Optional[str] = Field(description="Name of the hospital")
    pre_auth_ref: Optional[str] = Field(description="Pre-authorization reference number")
    source_file: str = Field(description="Path to the source file", default="production_artifacts/sample_unstructured_discharge.txt")
    parsed_at_utc: str = Field(description="Timestamp in UTC")

class Patient(BaseModel):
    name: Optional[str] = Field(description="Patient's full name")
    age: Optional[int] = Field(description="Patient's age")
    sex: Optional[str] = Field(description="Patient's gender")
    address: Optional[str] = Field(description="Patient's address")
    contact: Optional[str] = Field(description="Patient's contact information")
    insurer: Optional[str] = Field(description="Name of the insurance provider")
    policy_no: Optional[str] = Field(description="Insurance policy number")

class Encounter(BaseModel):
    admitting_physician: Optional[str] = Field(description="Name of the admitting physician")
    admitting_diagnosis: Optional[str] = Field(description="Admitting diagnosis")
    final_diagnosis: Optional[str] = Field(description="Final diagnosis")
    date_of_admission: Optional[str] = Field(description="Date of admission")
    date_of_discharge: Optional[str] = Field(description="Date of discharge")
    total_stay_days: Optional[int] = Field(description="Total number of days stayed in the hospital")
    room_type: Optional[str] = Field(description="Type of room or ward (e.g. Deluxe Room, ICU)")
    doctor_notes: Optional[str] = Field(description="Doctor's clinical notes, summary, and history")

class LineItem(BaseModel):
    description: str = Field(description="Description of the billed item or service")
    unit_rate_inr: Optional[int] = Field(description="Rate per unit in INR")
    quantity: Optional[str] = Field(description="Quantity of the item (e.g. 1, 2 days, etc)")
    amount_inr: int = Field(description="Total amount for the line item in INR")

class Totals(BaseModel):
    sub_total_room_rent_inr: int = Field(description="Total room rent charges in INR")
    sub_total_pharmacy_labs_inr: int = Field(description="Total pharmacy and lab charges in INR")
    grand_total_billed_inr: int = Field(description="Grand total billed amount in INR")

class ClaimAudit(BaseModel):
    document_refs: DocumentRefs
    patient: Patient
    encounter: Encounter
    line_items: List[LineItem]
    totals: Totals

# ── Per-file extraction ─────────────────────────────────────────────────────

def extract_from_file(client: genai.Client, input_file: str) -> dict:
    """Run Gemini extraction on a single file, return raw dict."""
    print(f"[ocr-vision]  → Processing: {os.path.basename(input_file)}")

    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")

    prompt = """
You are an expert medical coder and billing auditor. Parse the following unstructured discharge summary and hospital bill into a precise JSON structure.

Ensure:
- You calculate totals if they are missing but derivable from line items.
- Stay days are calculated correctly.
- Dates are formatted consistently.
- Categorize line items accurately. Sub-total room rents and pharmacy/lab totals must be accurate.
- If no policy number is found, return null/None.
"""

    ext = os.path.splitext(input_file)[1].lower()
    contents = []

    if ext in ['.txt', '.json', '.md', '']:
        with open(input_file, "r", encoding="utf-8") as f:
            raw_text = f.read()
        prompt += f"\n\nDischarge Text / Bill:\n{raw_text}"
        contents.append(prompt)
    else:
        # Binary file (PDF / Image) → upload via Gemini File API
        print(f"[ocr-vision]    Uploading to Gemini File API...")
        uploaded_file = client.files.upload(file=input_file)
        contents = [uploaded_file, prompt]

    response = client.models.generate_content(
        model='gemini-3.5-flash',
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ClaimAudit,
            temperature=0.1
        )
    )

    if not response.text:
        raise ValueError(f"Gemini returned empty response for file: {input_file}")

    return json.loads(response.text)


# ── Merge logic ─────────────────────────────────────────────────────────────

def merge_claims(results: List[dict], source_files: List[str]) -> dict:
    """
    Merge multiple ClaimAudit dicts into one unified result.

    Strategy:
    - Patient / Encounter / DocumentRefs  → taken from the FIRST document
      (usually the discharge summary, which has the richest patient data).
    - line_items                          → concatenated from ALL documents
      (deduplicated by description to avoid double-counting).
    - totals                              → summed across all documents so the
      grand total reflects the entire multi-document claim.
    """
    if len(results) == 1:
        return results[0]

    print(f"[ocr-vision] Merging {len(results)} extracted documents...")

    base = results[0]

    # Collect all line items, deduplicate by description
    seen_descriptions = set()
    merged_line_items = []
    for r in results:
        for item in r.get("line_items", []):
            desc = item.get("description", "").strip().lower()
            if desc and desc not in seen_descriptions:
                seen_descriptions.add(desc)
                merged_line_items.append(item)

    # Sum totals
    room_rent_total   = sum(r.get("totals", {}).get("sub_total_room_rent_inr", 0) for r in results)
    pharmacy_total    = sum(r.get("totals", {}).get("sub_total_pharmacy_labs_inr", 0) for r in results)
    grand_total       = sum(r.get("totals", {}).get("grand_total_billed_inr", 0) for r in results)

    merged = {
        **base,
        "line_items": merged_line_items,
        "totals": {
            "sub_total_room_rent_inr":   room_rent_total,
            "sub_total_pharmacy_labs_inr": pharmacy_total,
            "grand_total_billed_inr":    grand_total,
        },
    }

    # Note all source files in document_refs
    merged["document_refs"]["source_file"] = " | ".join(source_files)
    return merged


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    # sys.argv[1:] are all the file paths passed by Node.js (may be 0, 1, or many)
    input_files = sys.argv[1:] if len(sys.argv) > 1 else [DEFAULT_INPUT]

    print(f"[ocr-vision] {len(input_files)} file(s) to process.")
    print(f"[ocr-vision] Initializing Gemini client...")
    client = genai.Client()

    all_results = []
    for fpath in input_files:
        result = extract_from_file(client, fpath)
        all_results.append(result)

    # Merge all extracted claims into one
    merged = merge_claims(all_results, input_files)

    # Enrich metadata
    merged["document_refs"]["parsed_at_utc"] = datetime.now().isoformat() + "Z"

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)

    print(f"[ocr-vision] ✅ claim_raw.json written to: {OUTPUT_FILE}")

    patient_name = merged.get('patient', {}).get('name')
    diagnosis    = merged.get('encounter', {}).get('final_diagnosis')
    grand_total  = merged.get('totals', {}).get('grand_total_billed_inr')
    n_items      = len(merged.get('line_items', []))

    print(f"             Patient   : {patient_name or 'Unknown'}")
    print(f"             Diagnosis : {diagnosis or 'Not parsed'}")
    print(f"             Line Items: {n_items}")
    if grand_total is not None:
        print(f"             Total Bill: ₹{grand_total:,}")
    else:
        print("             Total Bill: (not parsed)")

if __name__ == "__main__":
    main()
