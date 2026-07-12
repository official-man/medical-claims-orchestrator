---
description: End-to-end medical claim processing pipeline.
---

When the user types `/process_claim <claim_id>`, orchestrate:
1. As @vision, run the ocr-vision skill on the uploaded documents for <claim_id>.
2. As @icd10, run icd10-coder on production_artifacts/claim_raw.json.
3. As @policy-rag, run rulebook-rag using icd10_mapped.json and the selected insurer.
4. Return coverage_decision.md plus any flags needing human review.
