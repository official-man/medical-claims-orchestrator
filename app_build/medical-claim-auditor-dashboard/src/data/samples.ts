import { InsuranceProvider, SampleSummary } from '../types';

export const INSURANCE_PROVIDERS: InsuranceProvider[] = [
  {
    id: 'star-gold',
    name: 'Star Health Gold Plus',
    shortName: 'Star Health',
    logoColor: 'bg-blue-600',
    policyDetails: {
      sumInsured: '₹5,00,000 ($6,000)',
      roomRentCapping: 'Single Private A/C Room capped at ₹5,000/day. Proportionate deductions apply to other charges if exceeded.',
      icuCapping: 'Capped at ₹10,000/day.',
      copayment: '10% co-payment applicable for insured patients aged 60 and above.',
      exclusions: 'Consumables, toiletries, gloves, PPE kits, and cosmetic procedures are strictly non-payable.',
      waitingPeriod: '24-month waiting period for pre-existing conditions like Diabetes & Hypertension.',
    }
  },
  {
    id: 'hdfc-ergo',
    name: 'HDFC Ergo Optima Secure',
    shortName: 'HDFC Ergo',
    logoColor: 'bg-emerald-600',
    policyDetails: {
      sumInsured: '₹10,00,000 ($12,000)',
      roomRentCapping: 'No limit. Actual room rent covered (up to Single Private room).',
      icuCapping: 'No limit. Actual ICU room charges covered.',
      copayment: '0% co-payment (No copayment applicable).',
      exclusions: 'Excludes luxury cosmetic items and vitamins unless prescribed as active treatment. Consumables covered up to ₹5,000.',
      waitingPeriod: '36-month waiting period for pre-existing conditions unless continuous coverage exists.',
    }
  },
  {
    id: 'niva-bupa',
    name: 'Niva Bupa ReAssure 2.0',
    shortName: 'Niva Bupa',
    logoColor: 'bg-amber-600',
    policyDetails: {
      sumInsured: '₹7,50,000 ($9,000)',
      roomRentCapping: 'Capped at 1% of Sum Insured (₹7,500/day) for normal rooms.',
      icuCapping: 'Capped at 2% of Sum Insured (₹15,000/day) for ICU.',
      copayment: '0% co-payment.',
      exclusions: 'Consumables, administrative charges, registration fees, and non-prescribed diagnostic tests are excluded.',
      waitingPeriod: '24-month waiting period for pre-existing diseases.',
    }
  },
  {
    id: 'care-secure',
    name: 'Care Health Secure Plan',
    shortName: 'Care Health',
    logoColor: 'bg-rose-600',
    policyDetails: {
      sumInsured: '₹4,00,000 ($4,800)',
      roomRentCapping: 'Strict 1% of Sum Insured (₹4,000/day) capping. If exceeded, dynamic proportionate penalty applies to all associated hospital bills (surgeons, medicines, diagnostics).',
      icuCapping: 'Strict 2% of Sum Insured (₹8,000/day) capping.',
      copayment: '20% compulsory co-payment on all claims if patient is older than 65 years.',
      exclusions: 'All external braces, dietary supplements, PPEs, and service fees are excluded.',
      waitingPeriod: '48-month waiting period for pre-existing diseases.',
    }
  }
];

export const SAMPLE_SUMMARIES: SampleSummary[] = [
  {
    id: 'appendicitis',
    title: 'Acute Appendicitis (Rajesh Sharma - ₹1,42,000)',
    providerId: 'star-gold',
    diagnosis: 'Acute Appendicitis (Open Appendectomy)',
    claimedAmount: 142000,
    gender: 'Male',
    age: 34,
    content: `DISCHARGE SUMMARY

HOSPITAL: Sacred Heart Multispeciality Hospital, Mumbai
PATIENT NAME: Mr. Rajesh Sharma
AGE: 34 Years | GENDER: Male
DATE OF ADMISSION: 12-Jun-2026
DATE OF DISCHARGE: 15-Jun-2026 (Total Stay: 3 Days)
DIAGNOSIS: Acute Appendicitis with localized peritonitis

CLINICAL HISTORY:
The patient presented with complaints of sudden-onset, severe right lower quadrant abdominal pain radiating from the umbilicus, associated with high-grade fever (101°F), nausea, and two episodes of vomiting over the last 12 hours. Abdominal examination showed severe tenderness and guarding at McBurney's point. Rebound tenderness positive.

DIAGNOSTIC INVESTIGATIONS:
- Complete Blood Count (CBC): Total Leucocyte Count (TLC) elevated at 14,500 cells/mm3 (Neutrophils 84%).
- Ultrasonography (USG) of Abdomen: Showed non-compressible, aperistaltic blind-ended tubular structure measuring 8.2 mm in diameter in the right iliac fossa with surrounding fluid collection, consistent with acute appendicitis.
- Serum Creatinine: 0.9 mg/dL.
- ECG: Within normal limits.

LINE OF TREATMENT:
The patient was taken up for emergency open appendectomy under General Anesthesia on 12-Jun-2026. Intraoperatively, the appendix was found to be highly inflamed, swollen, and turgid with localized purulent fluid in the pelvis. Appendectomy was performed successfully. Specimen sent for histopathological examination. Post-operative period was uneventful. Initiated on IV antibiotics (Ceftriaxone 1g BD, Metronidazole 500mg TDS), analgesics, and IV fluids. Patient tolerated oral feeds on day 2. Wound check done on day 3, found healthy. Patient discharged in a stable condition with oral medications.

PRESCRIBED HOME MEDICATIONS:
- Tab Cefuroxime 500mg BD x 5 days
- Tab Pantoprazole 40mg OD x 5 days
- Tab Aceclofenac 100mg + Paracetamol 325mg BD x 3 days

HOSPITALIZATION BILL SUMMARY (CLAIMED AMOUNT):
1. Room Rent (Single Deluxe AC Room): 3 Days @ ₹7,500/day = ₹22,500
2. Nursing & Service Charges: 3 Days @ ₹2,000/day = ₹6,000
3. OT Charges & Anesthesia: ₹35,000
4. Surgeon & Consultant Fees: ₹40,000
5. Investigations & Lab: ₹15,500
6. Pharmacy & Consumables (including surgical gloves, sutures, syringes, PPE, surgical drape): ₹23,000
TOTAL CLAIMED AMOUNT: ₹1,42,000

AUDIT ASSISTANCE NOTE:
Please check against Star Health Gold Plus policy.
- Room Rent Cap is ₹5,000/day. Rajesh stayed in Deluxe Room at ₹7,500/day (₹2,500/day excess).
- Consumables like gloves, syringes, and PPE in the pharmacy bill should be audited (estimate ₹8,500 non-payable).
- Calculate proportionate deduction since room rent limit was breached.
`
  },
  {
    id: 'angioplasty',
    title: 'Coronary Angioplasty (Michael Vance - ₹4,85,000)',
    providerId: 'hdfc-ergo',
    diagnosis: 'Coronary Artery Disease (CAD - Single Vessel)',
    claimedAmount: 485000,
    gender: 'Male',
    age: 62,
    content: `DISCHARGE SUMMARY

HOSPITAL: Metro Heart & Vascular Institute, Delhi NCR
PATIENT NAME: Mr. Michael Vance
AGE: 62 Years | GENDER: Male
DATE OF ADMISSION: 20-Jun-2026
DATE OF DISCHARGE: 22-Jun-2026 (Total Stay: 2 Days)
DIAGNOSIS: Coronary Artery Disease, Acute Coronary Syndrome (NSTEMI)

CLINICAL HISTORY:
A 62-year-old male with a history of mild hypertension was admitted with chest tightness, diaphoresis, and shortness of breath radiating to the left arm for 3 hours. ECG revealed ST-segment depressions in anterior leads V2-V4. Cardiac Troponin I was positive (2.4 ng/mL). The patient was immediately shifted to the Coronary Care Unit (CCU) and started on dual antiplatelet therapy (Aspirin 300mg + Clopidogrel 300mg), Low Molecular Weight Heparin (LMWH) 0.6ml Subcutaneously, and statins.

PROCEDURE DETAILS:
Emergency Coronary Angiography was performed on 20-Jun-2026 via right radial approach. It revealed 90% severe stenosis in the mid-Left Anterior Descending (LAD) artery. Other vessels were normal.
The patient underwent Percutaneous Transluminal Coronary Angioplasty (PTCA) with deploying of a Drug-Eluting Stent (DES) (Everolimus-eluting 3.0 x 24mm) to mid LAD. The procedure was successful with TIMI-3 flow achieved. Post-procedure CCU monitoring was uneventful. Vital signs remained stable. No groin or radial hematoma.

DIAGNOSTIC INVESTIGATIONS:
- Coronary Angiography: Single vessel CAD, 90% LAD stenosis.
- Echocardiography (2D Echo): LVEF 48%, mild hypokinesia of anterior wall.
- Serum Electrolytes: Na+ 138 mEq/L, K+ 4.1 mEq/L.
- Serum Creatinine: 1.1 mg/dL.

LINE OF TREATMENT:
Surgical/Invasive Cardiac intervention. Supported by active medication (Tab Ticagrelor 90mg BD, Tab Aspirin 75mg OD, Tab Rosuvastatin 40mg OD, Tab Metoprolol 25mg OD). The patient responded well. Vitals on discharge: BP 120/75 mmHg, HR 68/min, SpO2 98% on room air.

HOSPITALIZATION BILL SUMMARY (CLAIMED AMOUNT):
1. ICU/CCU Room Rent: 2 Days @ ₹18,000/day = ₹36,000
2. Cath Lab & Angioplasty Procedure Charges: ₹1,50,000
3. Drug-Eluting Stent Cost: ₹1,20,000
4. Cardiologist & Anesthetist Professional Fees: ₹95,000
5. Diagnostics, ECG & Echo: ₹24,000
6. Pharmacy & Consumables (contrast dye, catheters, guide wires, syringes, gloves): ₹60,000
TOTAL CLAIMED AMOUNT: ₹4,85,000

AUDIT ASSISTANCE NOTE:
Please check against HDFC Ergo Optima Secure policy:
- No Room Rent capping. ICU charges are covered in full.
- No co-payment applies.
- Consumables are covered up to ₹5,000. Catheters and guide wires are procedure-specific, but gloves/syringes should be classified. All medical stent expenses are payable.
`
  },
  {
    id: 'pneumonia-senior',
    title: 'Severe Pneumonia (Leela Devi - ₹1,15,000)',
    providerId: 'care-secure',
    diagnosis: 'Severe Community-Acquired Pneumonia (Type-II Respiratory Failure)',
    claimedAmount: 115000,
    gender: 'Female',
    age: 68,
    content: `DISCHARGE SUMMARY

HOSPITAL: Apex Pulmonary & General Hospital, Bangalore
PATIENT NAME: Mrs. Leela Devi
AGE: 68 Years | GENDER: Female
DATE OF ADMISSION: 25-Jun-2026
DATE of DISCHARGE: 29-Jun-2026 (Total Stay: 4 Days)
DIAGNOSIS: Severe Community-Acquired Pneumonia, Type-II Respiratory Failure, COPD Exacerbation

CLINICAL HISTORY:
The patient, a 68-year-old female, presented in the ER with acute onset dyspnea, productive cough with yellowish sputum, and high-grade fluctuating fever for 5 days. She was extremely lethargic and disoriented. Pulse rate: 112 bpm, BP: 105/65 mmHg, respiratory rate: 28/min, SpO2: 84% on room air. ABG showed respiratory acidosis (pH 7.28, pCO2 62 mmHg, pO2 55 mmHg). Known case of Chronic Obstructive Pulmonary Disease (COPD) since 4 years.

LINE OF TREATMENT:
The patient was immediately admitted to the ICU and put on Non-Invasive Ventilation (BiPAP support) for 36 hours. Initiated on IV antibiotics (Piperacillin-Tazobactam 4.5g TDS, Tab Azithromycin 500mg OD), nebulized bronchodilators (Duolin + Budecort QDS), IV steroids (Hydrocortisone 100mg BD), and thromboprophylaxis. The patient responded excellently to treatment, and was weaned off BiPAP on Day 3, maintained on low-flow nasal oxygen (2L/min). Transferred to Ward on Day 3. Fully stable with normal ABG on Day 4. Discharged.

DIAGNOSTIC INVESTIGATIONS:
- Chest X-Ray: Bilateral consolidation and infiltrates in mid & lower zones.
- CBC: WBC elevated at 16,200 cells/mm3 with Left Shift.
- Sputum Culture: Growth of Streptococcus pneumoniae, sensitive to Piperacillin-Tazobactam.
- HbA1c: 7.8% (Indicates uncontrolled diabetic state).

HOSPITALIZATION BILL SUMMARY (CLAIMED AMOUNT):
1. ICU Bed Rent with BiPAP: 2 Days @ ₹12,000/day = ₹24,000
2. General Ward Semi-Private Room Rent: 2 Days @ ₹6,000/day = ₹12,000
3. Nursing, Monitor & Service Fees: ₹10,000
4. ICU Medical Officer & Pulmonary Specialist visits: ₹22,000
5. Lab Tests & Radiology (X-rays, Arterial Blood Gas, Sputum, CBC): ₹16,000
6. Medicines, Nebulizer Kits, BiPAP Mask & Consumables: ₹31,000
TOTAL CLAIMED AMOUNT: ₹1,15,000

AUDIT ASSISTANCE NOTE:
Please check against Care Health Secure policy:
- Sum Insured is ₹4,00,000.
- Normal Room Rent Cap is 1% of Sum Insured = ₹4,000/day. general Ward room charged at ₹6,000/day (breached by ₹2,000/day).
- ICU bed rent limit is 2% = ₹8,000/day. ICU charged at ₹12,000/day (breached by ₹4,000/day).
- Patient is 68 years old. Under Care Health Secure, a 20% compulsory co-payment applies for patients >65 years. This co-payment is applied on the *final eligible approved claim amount*.
- Consumables like nebulizer kits and mask may be excluded or scrutinized.
`
  }
];
