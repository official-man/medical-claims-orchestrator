export interface InsuranceProvider {
  id: string;
  name: string;
  logoColor: string; // Tailwind color class e.g., 'bg-emerald-500'
  shortName: string;
  policyDetails: {
    sumInsured: string;
    roomRentCapping: string;
    icuCapping: string;
    copayment: string;
    exclusions: string;
    waitingPeriod: string;
  };
}

export interface BillingItem {
  id: string;
  category: string; // e.g., 'Room Rent', 'ICU', 'Medicines', 'Consultation', 'Consumables', 'Lab Tests'
  claimedAmount: number;
  approvedAmount: number;
  disallowedAmount: number;
  reason: string;
  status: 'approved' | 'partially_approved' | 'disallowed';
}

export interface PolicyRuleEvaluation {
  ruleName: string;
  status: 'passed' | 'failed' | 'warning';
  details: string;
}

export interface AuditResult {
  patientDetails: {
    name: string;
    age: number;
    gender: string;
    admissionDate: string;
    dischargeDate: string;
    lengthOfStay: string;
    hospitalName: string;
    diagnosis: string;
    primarySymptom: string;
    treatmentType: string; // Surgical / Medical / Day Care
  };
  metrics: {
    totalClaimed: number;
    totalApproved: number;
    totalDisallowed: number;
    outOfPocketLiability: number;
    copaymentApplied: number;
    deductionsApplied: number;
  };
  billingAudit: BillingItem[];
  ruleEvaluations: PolicyRuleEvaluation[];
  clinicalAssessment: {
    necessityOfHospitalization: string; // Clinical reasoning why it was necessary/unnecessary
    treatmentAppropriateness: string;
    dischargeStability: string;
  };
  auditSummary: string; // Overall executive summary of the audit decision
  rawMarkdown: string; // Optional raw markdown report from the model
}

export interface SampleSummary {
  id: string;
  title: string;
  providerId: string;
  diagnosis: string;
  claimedAmount: number;
  gender: string;
  age: number;
  content: string;
}
