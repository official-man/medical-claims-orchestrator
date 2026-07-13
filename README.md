<div align="center">

# 🏥 Medical Claims Orchestrator

**Multimodal AI-powered insurance claim auditing — from scanned documents to instant financial decisions.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Gemini](https://img.shields.io/badge/Gemini-3.5%20Flash-4285F4?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)

</div>

---

## 🔴 The Problem

Health insurance claim processing in India is almost entirely manual. A typical IPD (In-Patient Department) claim for a 5-day hospital stay generates:

- A handwritten or scanned **Discharge Summary** (often blurry, multi-page)
- A detailed **Hospital Invoice** with 30–80 line items across categories
- **Pharmacy receipts**, **Lab reports**, and **OT records**

A single claim adjuster must cross-reference all of these documents against the insurer's policy rulebook — checking room-rent caps, ICU sub-limits, consumables exclusions, co-payment clauses, and pre-existing disease waiting periods — **manually**, for hundreds of claims per day.

This process is:
- ⏱ **Slow** — average turnaround is 2–7 business days
- ❌ **Error-prone** — room-rent capping miscalculations are the #1 source of audit disputes
- 💸 **Expensive** — each adjuster handles 80–120 claims/month; fraud leakage averages 8–12% of payouts
- 😤 **Painful for patients** — delay in reimbursement causes financial distress at the worst possible time

---

## ✅ The Solution

**Medical Claims Orchestrator** is a three-stage AI pipeline that turns a pile of scanned medical documents into a complete, auditable insurance decision in under 60 seconds.

```
📄 Scanned PDF / Image                      💳 Structured Audit Decision
   Discharge Summary          ─────────►       Approved: ₹4,12,000
   Hospital Invoice                            OOP Liability: ₹68,000
   Pharmacy Receipts                           Room Rent Capped: ₹45,000
                                               Decision: PARTIAL APPROVAL
```

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   React Frontend (TypeScript)                    │
│  Drop Zone ──► File Queue ──► Start Audit ──► Results Dashboard │
└──────────────────────┬──────────────────────────────────────────┘
                       │  POST /api/audit  { files: [...base64] }
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Express Server (TypeScript)                      │
│  Receives base64 files ──► Saves to production_artifacts/       │
└──────┬──────────────────────────────────────────────────────┬───┘
       │                                                      │
       ▼  TIER 1: Python Pipeline              TIER 2: Gemini Direct
┌──────────────────────┐                  ┌──────────────────────────┐
│  Step 1: OCR Vision  │  Gemini 3.5      │  Gemini 3.5 Flash        │
│  ocr_vision_parse.py │  Flash multi-    │  Single-pass audit with  │
│  ──────────────────  │  modal + Pydantic│  policy context injected │
│  → claim_raw.json    │  schema          │  as structured prompt    │
└──────┬───────────────┘                  └──────────────────────────┘
       │
       ▼
┌──────────────────────┐
│  Step 2: ICD-10 Coder│  Dictionary-based diagnosis code extraction
│  icd10_map.py        │
│  ──────────────────  │
│  → icd10_mapped.json │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Step 3: Policy RAG  │  Rulebook-grounded financial audit:
│  rulebook_rag.py     │  room caps, ICU limits, co-pay, exclusions
│  ──────────────────  │
│  → coverage_decision │
│    .md               │
└──────────────────────┘
```

### Key Features

| Feature | Details |
|---|---|
| 🔍 **Multimodal OCR** | Upload scanned PDFs or JPEG/PNG images — Gemini 3.5 Flash extracts all clinical and billing data with a strict Pydantic schema |
| 📋 **ICD-10 Auto-coding** | Diagnosis text is matched against the ICD-10 database to flag covered vs excluded conditions per policy |
| ⚖️ **Policy RAG Auditing** | Room-rent capping, ICU sub-limits, consumables exclusions, and co-payment calculations are applied directly from the insurer's rulebook |
| 📁 **Multi-file Support** | Upload a discharge summary + invoice + pharmacy receipts simultaneously — results are merged into one unified audit |
| 🚀 **Export to Insurer** | One-click JSON claim packet export to the insurance gateway with delivery confirmation toast |
| 📊 **Audit Ledger** | Full itemized breakdown of approved/disallowed amounts with policy clause references |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + TypeScript + Tailwind CSS v4 |
| **Backend** | Node.js + Express 4 + TypeScript (tsx) |
| **AI / OCR** | Google Gemini 3.5 Flash (multimodal) via `@google/genai` SDK |
| **Structured Extraction** | Pydantic v2 schemas enforced via `response_schema` |
| **ICD-10 Coding** | Python — dictionary-matched diagnosis extraction |
| **Policy Auditing** | Python RAG — Star Health Gold Elite rulebook (`.txt`) + arithmetic engine |
| **HTTP Client** | Axios (for insurer gateway export) |
| **Dev Server** | Vite 6 (HMR) + tsx for TypeScript server hot-reload |

### Insurer Rulebook — Star Health Gold Elite

The current pipeline is pre-configured for the **Star Health Gold Elite** plan (`SH-GOLD-2024`):

- **Sum Insured:** ₹10,00,000
- **Room Rent Limits:** General Ward ₹2,000 · Semi-Private ₹3,500 · Deluxe ₹5,000 · ICU ₹7,500 (per day)
- **Covered Diagnoses:** Acute Myocardial Infarction (I21.9, Clause 4.1), Appendectomy (K35.8, Clause 4.2)
- **Exclusions:** Cosmetic procedures (Clause 5.1), Pre-existing diseases within 24-month waiting period (Clause 5.2)

Additional insurer rulebooks can be added as `.txt` files in `rulebooks/` and registered in `server.ts`.

---

## 🚀 How to Run

### Prerequisites

```bash
# Python 3.12+
python3 --version

# Node.js 20+
node --version

# Install Python dependencies
pip install google-genai pydantic --break-system-packages
```

### 1. Clone & Install

```bash
git clone https://github.com/official-man/medical-claims-orchestrator.git
cd medical-claims-orchestrator/app_build/medical-claim-auditor-dashboard
npm install
```

### 2. Configure Environment

Create a `.env` file in `app_build/medical-claim-auditor-dashboard/`:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

Get your key at [Google AI Studio](https://aistudio.google.com/apikey).

### 3. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Run an Audit

1. **Upload** a scanned discharge summary (PDF or image) using the drag-and-drop zone
2. **Select** an insurance provider from the top navbar
3. Click **"Start AI Claim Audit"** — the 3-stage pipeline runs automatically
4. Review the **Audit Ledger**, **Policy Rules**, and **Patient Demographics** in the results panel
5. Click **"Export to Insurer"** to dispatch the audit packet to the insurance gateway

---

## 📁 Project Structure

```
medical-claims-orchestrator/
├── .agents/
│   └── skills/
│       ├── ocr-vision/
│       │   └── scripts/ocr_vision_parse.py    # Stage 1: Gemini multimodal OCR
│       ├── icd10-coder/
│       │   └── scripts/icd10_map.py           # Stage 2: ICD-10 diagnosis coding
│       └── rulebook-rag/
│           └── scripts/rulebook_rag.py        # Stage 3: Policy rulebook auditing
├── app_build/
│   └── medical-claim-auditor-dashboard/
│       ├── server.ts                          # Express API server + /api/export-claim
│       └── src/
│           ├── App.tsx                        # Root app + state management
│           └── components/
│               ├── UploadPanel.tsx            # File upload + text editor
│               └── AuditResultsPanel.tsx      # Audit results, ledger, export button
├── production_artifacts/                      # Generated pipeline outputs (git-ignored)
│   ├── claim_raw.json
│   ├── icd10_mapped.json
│   └── coverage_decision.md
├── rulebooks/
│   └── star_health_gold.txt                  # Star Health Gold Elite policy text
└── README.md
```

---

## 🔌 API Reference

### `POST /api/audit`
Runs the full 3-stage claim audit pipeline.

**Request body:**
```json
{
  "providerId": "star-gold",
  "files": [{ "name": "discharge.pdf", "base64": "...", "mimeType": "application/pdf" }],
  "discharge_text": "Optional plain-text fallback"
}
```

**Response:**
```json
{
  "source": "python_pipeline",
  "result": {
    "patientDetails": { "name": "Ch. Samuel", "age": 54 },
    "metrics": { "totalApproved": 412000, "outOfPocketLiability": 68000 },
    "billingAudit": [...],
    "ruleEvaluations": [...],
    "auditSummary": "..."
  }
}
```

### `POST /api/export-claim`
Dispatches the finalized audit packet to the insurance gateway via Axios.

**Request body:** The full `AuditResult` object from `/api/audit`.

**Response:**
```json
{
  "success": true,
  "gatewayRef": "GW-20260712-A3F9",
  "deliveredAt": "2026-07-12T12:48:00.000Z",
  "gatewayResponse": { "status": "RECEIVED" }
}
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">
Built with ❤️ for faster, fairer medical insurance in India.
</div>
