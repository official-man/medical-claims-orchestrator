#!/usr/bin/env python3
"""
ocr_vision_parse.py — OCR-Vision Skill: Step 1 of the /process_claim pipeline.

Uses Gemini 1.5 Pro to parse unstructured discharge summary text or multimodal files
into a clean, structured JSON using a strict Pydantic schema.
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
REPO_ROOT       = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../"))
DEFAULT_INPUT   = os.path.join(REPO_ROOT, "production_artifacts", "sample_unstructured_discharge.txt")
OUTPUT_FILE     = os.path.join(REPO_ROOT, "production_artifacts", "claim_raw.json")

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

# ── Main Logic ──────────────────────────────────────────────────────────────

def main():
    # If a file path is provided via CLI args, use it. Otherwise, default text file.
    input_file = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_INPUT
    
    print(f"[ocr-vision] Reading: {input_file}")
    if not os.path.exists(input_file):
        raise FileNotFoundError(f"Input file not found: {input_file}")

    print("[ocr-vision] Initializing Gemini client...")
    client = genai.Client()
    
    prompt = """
You are an expert medical coder and billing auditor. Parse the following unstructured discharge summary and hospital bill into a precise JSON structure.

Ensure:
- You calculate totals if they are missing but derivable from line items.
- Stay days are calculated correctly.
- Dates are formatted consistently.
- Categorize line items accurately. Sub-total room rents and pharmacy/lab totals must be accurate.
- If no policy number is found, return null/None.
"""

    # Check if input is a text file or an image/pdf
    ext = os.path.splitext(input_file)[1].lower()
    
    contents = []
    
    if ext in ['.txt', '.json', '.md', '']:
        with open(input_file, "r", encoding="utf-8") as f:
            raw_text = f.read()
        prompt += f"\n\nDischarge Text / Bill:\n{raw_text}"
        contents.append(prompt)
    else:
        # Multimodal upload using Gemini File API
        print(f"[ocr-vision] Uploading file to Gemini API: {input_file}")
        uploaded_file = client.files.upload(file=input_file)
        contents = [uploaded_file, prompt]

    print("[ocr-vision] Generating structured output with Gemini 1.5 Pro...")
    
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
        raise ValueError("Failed to generate content with Gemini API")

    claim_data = json.loads(response.text)
    
    # Enrich meta info
    claim_data["document_refs"]["parsed_at_utc"] = datetime.now().isoformat() + "Z"
    claim_data["document_refs"]["source_file"] = input_file

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(claim_data, f, indent=2, ensure_ascii=False)

    print(f"[ocr-vision] ✅ claim_raw.json written to: {OUTPUT_FILE}")
    
    patient_name = claim_data.get('patient', {}).get('name')
    diagnosis = claim_data.get('encounter', {}).get('final_diagnosis')
    grand_total = claim_data.get('totals', {}).get('grand_total_billed_inr')

    print(f"             Patient : {patient_name or 'Unknown'}")
    print(f"             Diagnosis: {diagnosis or 'Not parsed'}")
    if grand_total is not None:
        print(f"             Total Bill: ₹{grand_total:,}")
    else:
        print("             Total Bill: (not parsed)")

if __name__ == "__main__":
    main()
