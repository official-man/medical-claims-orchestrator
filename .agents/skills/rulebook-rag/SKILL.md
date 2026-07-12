---
name: rulebook-rag
description: Applies a chosen insurer's policy rulebook to a coded claim.
---

## Inputs
- icd10_mapped.json
- insurer_id (e.g., "star_health"), product_code from the UI.

## Instructions
- Cross-reference the mapped JSON codes against the raw text or index of the specified insurer rulebook file in the rulebooks/ folder.
- Highlight any anomalies, policy limits exceeded, or excluded treatments.
