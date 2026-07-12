---
name: icd10-coder
description: Maps natural language medical text to official ICD-10 coding sets.
---

## Objective
Read production_artifacts/claim_raw.json and assign standard billing codes.

## Execution
- Identify terms like "Acute Myocardial Infarction" and output the matching billing code.
- Write structural reasoning for each code into production_artifacts/icd10_mapped.json.
