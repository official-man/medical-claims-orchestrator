---
name: ocr-vision
description: Extracts structured medical-claim data from PDFs/images into JSON.
---

## Objective
Read source files in rulebooks/ and user uploads, run OCR + layout analysis, and emit production_artifacts/claim_raw.json with fields: patient, encounter, line_items, totals, document_refs.

## Execution
- Target the file arrays in your incoming directory.
- Extract total billed amounts, itemized room fees, and doctor notes.
- Do not attempt ICD-10 mapping or policy logic here.
