import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, FileText, AlertCircle, TrendingDown,
  Info, Sparkles, CheckCircle2, XCircle, ChevronRight, Copy, Check, Download, 
  HelpCircle, RefreshCw, Heart, Calendar, Clock, DollarSign, Send
} from 'lucide-react';
import { AuditResult, InsuranceProvider } from '../types';

interface AuditResultsPanelProps {
  auditResult: AuditResult | null;
  selectedProvider: InsuranceProvider;
  isAnalyzing: boolean;
  source?: string; // 'python_pipeline' | 'gemini-3.5-flash'
}

export default function AuditResultsPanel({
  auditResult,
  selectedProvider,
  isAnalyzing,
  source
}: AuditResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<'decision' | 'billing' | 'rules' | 'raw'>('decision');
  const [isCopied, setIsCopied] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');

  // Formatting helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleCopyJSON = () => {
    if (!auditResult) return;
    // Always copies the exact JSON block held in state
    navigator.clipboard.writeText(JSON.stringify(auditResult, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    if (!auditResult) return;
    // Serialize the exact auditResult object stored in state — no transformation
    const jsonStr = JSON.stringify(auditResult, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const patientName = auditResult.patientDetails?.name
      ? auditResult.patientDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      : 'patient';
    const providerName = selectedProvider?.shortName
      ? selectedProvider.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      : 'provider';
    link.href = url;
    link.download = `claim_audit_${patientName}_${providerName}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAuditTrail = () => {
    if (!auditResult) return;
    const { patientDetails, metrics, billingAudit, ruleEvaluations, clinicalAssessment, auditSummary, rawMarkdown } = auditResult;

    // Prefer the raw markdown from state (set by Python pipeline's coverage_decision.md).
    // Fall back to a reconstructed template when rawMarkdown is not available (Gemini / mock path).
    const mdContent = rawMarkdown && rawMarkdown.trim().length > 0
      ? rawMarkdown
      : `# MEDAUDIT - CLINICAL & POLICY INSURANCE AUDIT REPORT
**Generated on**: ${new Date().toLocaleDateString()}
**Carrier Plan**: ${selectedProvider.name} (${selectedProvider.shortName})

---

## 📋 PATIENT DEMOGRAPHICS & CASE OVERVIEW
- **Patient Name**: ${patientDetails?.name || 'N/A'}
- **Age / Gender**: ${patientDetails?.age || 'N/A'} Years / ${patientDetails?.gender || 'N/A'}
- **Primary Diagnosis**: ${patientDetails?.diagnosis || 'N/A'}
- **Length of Stay**: ${patientDetails?.lengthOfStay || 'N/A'}
- **Admission Dates**: ${patientDetails?.admissionDate || 'N/A'} to ${patientDetails?.dischargeDate || 'N/A'}

---

## 🤖 CO-PILOT CLINICAL ANALYSIS & EXECUTIVE SUMMARY
### Executive Decision Summary
${auditSummary || 'N/A'}

### Necessity of Hospitalization
${clinicalAssessment?.necessityOfHospitalization || 'N/A'}

### Therapeutic & Treatment Appropriateness
${clinicalAssessment?.treatmentAppropriateness || 'N/A'}

---

## 📊 FINANCIAL AUDIT METRICS SUMMARY
- **Total Claimed Amount**: ${formatCurrency(metrics?.totalClaimed || 0)}
- **Approved Expense**: ${formatCurrency(metrics?.totalApproved || 0)}
- **Disallowed Deductions**: ${formatCurrency(metrics?.deductionsApplied || 0)}
- **Co-payment Applied**: ${formatCurrency(metrics?.copaymentApplied || 0)}
- **Patient Out-Of-Pocket Liability**: ${formatCurrency(metrics?.outOfPocketLiability || 0)}

---

## 🧾 ITEMIZED EXPENSE BILLING AUDIT LEDGER
| Category | Claimed Amount | Approved Amount | Deducted Amount | Audit Evaluation / Reason |
| :--- | :---: | :---: | :---: | :--- |
${(billingAudit || []).map(item => `| ${item.category} | ${formatCurrency(item.claimedAmount)} | ${formatCurrency(item.approvedAmount)} | ${item.disallowedAmount > 0 ? `-${formatCurrency(item.disallowedAmount)}` : '₹0'} | ${item.reason} |`).join('\n')}

---

## ⚖️ CARRIER POLICY RULES EVALUATION TRAIL
${(ruleEvaluations || []).map(rule => `### ${rule.ruleName}
- **Status**: ${String(rule.status || '').toUpperCase()}
- **Details**: ${rule.details || 'N/A'}`).join('\n\n')}

---
*Confidential Medical Document • HIPAA & TLS Protected Transit Audit Trail • MediAudit System*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const patientName = patientDetails?.name
      ? patientDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      : 'patient';
    const providerName = selectedProvider?.shortName
      ? selectedProvider.shortName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
      : 'provider';
    link.href = url;
    link.download = `claim_audit_trail_${patientName}_${providerName}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportToInsurer = async () => {
    if (!auditResult) return;
    setExportStatus('exporting');
    try {
      const res = await fetch('/api/export-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditResult),
      });
      if (!res.ok) {
        throw new Error('Export failed');
      }
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  // Helper to get status color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'passed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            PASSED / COMPLIANT
          </span>
        );
      case 'partially_approved':
      case 'warning':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
            ADJUSTED / CLAUSE APPLY
          </span>
        );
      case 'disallowed':
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 text-rose-700 border border-rose-200">
            DEDUCTED / NON-PAYABLE
          </span>
        );
      default:
        return null;
    }
  };

  // 1. Initial State / Not analyzed yet
  if (!auditResult && !isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[450px] bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center text-slate-400 mb-4">
          <ShieldCheck className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="font-sans font-bold text-slate-800 text-base mb-1">Awaiting Claims Submission</h3>
        <p className="text-slate-500 text-xs max-w-sm leading-relaxed mb-4">
          Provide an unstructured clinical discharge summary or select one of the high-fidelity templates on the left, then trigger the auditing run.
        </p>
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
          <span>REAL-TIME CO-PAYMENT & ROOM CAPPING AUDITING</span>
        </div>
      </div>
    );
  }

  // 2. Loading / Analyzing State — old result is guaranteed null at this point
  // because App.tsx sets auditResult(null) AND increments auditRunKey BEFORE
  // setting isAnalyzing(true), so this panel is a fresh remount with no stale data.
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[450px] bg-slate-900 rounded-2xl border border-slate-800 p-8 text-center text-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <RefreshCw className="h-7 w-7 text-emerald-400 animate-spin" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-emerald-500"></span>
          </span>
        </div>
        <h3 className="font-sans font-bold text-white text-base mb-1">Claim Audit In Progress</h3>
        {/* Explicit "cleared" confirmation so users know stale data is gone */}
        <div className="flex items-center space-x-1.5 mb-3">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-400 tracking-wider">PREVIOUS REPORT CLEARED — FRESH RUN STARTED</span>
        </div>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed mb-6">
          Gemini 3.5 Flash is extracting patient demographics, running clinical checks, and calculating exact room capping adjustments...
        </p>
        
        {/* Loading Pipeline Checklist */}
        <div className="w-full max-w-xs bg-slate-850 rounded-xl p-3.5 text-left border border-slate-800 font-mono text-[11px] space-y-2.5">
          <div className="flex items-center justify-between text-emerald-400">
            <span>[1/4] Running Document OCR & Extraction</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-emerald-400">
            <span>[2/4] Parsing Bed Rent & ICU Categories</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between text-slate-300 animate-pulse">
            <span>[3/4] Validating Exclusions & Copays</span>
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>[4/4] Writing Final Financial Ledger</span>
            <span className="inline-block w-2 h-2 rounded-full bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  if (!auditResult) return null;

  const { patientDetails, metrics, billingAudit, ruleEvaluations, clinicalAssessment, auditSummary } = auditResult;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
      
      {/* Header & Tabs */}
      <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-sans font-bold text-sm sm:text-base text-white">Coverage Decision Engine</h2>
              {/* Source badge — shows which tier produced this result */}
              {source === 'python_pipeline' && (
                <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full tracking-wider">PIPELINE</span>
              )}
              {source === 'gemini-3.5-flash' && (
                <span className="text-[9px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full tracking-wider">GEMINI AI</span>
              )}
              {source && source.startsWith('local_') && (
                <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full tracking-wider">MOCK</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              CARRIER: {selectedProvider.name}
            </div>
          </div>
        </div>
        
        {/* Export / Copy Options */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyJSON}
            className="p-2 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Copy Raw Audit Response"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownloadJSON}
            className="p-2 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Download JSON Summary"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleExportAuditTrail}
            className="p-2 hover:bg-slate-850 rounded-lg text-slate-400 hover:text-white transition-colors flex items-center space-x-1.5"
            title="Export Audit Trail (.md)"
          >
            <FileText className="h-4 w-4 text-emerald-400" />
            <span className="text-[11px] font-mono font-bold tracking-tight text-slate-300">Export Trail</span>
          </button>
          <button
            onClick={handleExportToInsurer}
            disabled={exportStatus === 'exporting'}
            className="p-2 ml-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
            title="Export to Insurer Gateway"
          >
            {exportStatus === 'exporting' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : exportStatus === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="text-[11px] font-mono font-bold tracking-tight">Export to Insurer</span>
          </button>
        </div>
      </div>

      {/* Toast Notification for Export */}
      {exportStatus === 'success' && (
        <div className="absolute top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 z-50 animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-sm font-bold">Claim Sent Successfully</span>
            <span className="text-xs text-emerald-600">Packet delivered to insurer gateway.</span>
          </div>
        </div>
      )}
      {exportStatus === 'error' && (
        <div className="absolute top-4 right-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl shadow-lg flex items-center space-x-3 z-50 animate-in slide-in-from-top-2">
          <XCircle className="h-5 w-5 text-rose-500" />
          <div className="flex flex-col">
            <span className="text-sm font-bold">Export Failed</span>
            <span className="text-xs text-rose-600">Could not reach the insurer gateway.</span>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
        <button
          onClick={() => setActiveTab('decision')}
          className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
            activeTab === 'decision'
              ? 'border-slate-900 text-slate-900 bg-white font-bold shadow-sm'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          Audit Ledger
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
            activeTab === 'billing'
              ? 'border-slate-900 text-slate-900 bg-white font-bold shadow-sm'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          Itemized Bill
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
            activeTab === 'rules'
              ? 'border-slate-900 text-slate-900 bg-white font-bold shadow-sm'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          Policy Rules
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
            activeTab === 'raw'
              ? 'border-slate-900 text-slate-900 bg-white font-bold shadow-sm'
              : 'border-transparent hover:text-slate-900 hover:bg-slate-100/50'
          }`}
        >
          Raw JSON Summary
        </button>
      </div>

      {/* Content scroll block */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {activeTab === 'decision' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Split Grid: Metrics approved (GREEN) and liability (RED) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Approved Amount */}
              <div id="approved-amount-card" className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute -right-3 -bottom-3 text-emerald-200/40">
                  <ShieldCheck className="w-16 h-16" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-emerald-800 tracking-wider font-bold">APPROVED CLAIM EXPENSE</span>
                  <div className="text-2xl sm:text-3xl font-sans font-black text-emerald-700 mt-1">
                    {formatCurrency(metrics.totalApproved)}
                  </div>
                </div>
                <div className="text-[11px] text-emerald-800 font-medium mt-3 bg-emerald-100/50 border border-emerald-100 py-1 px-2.5 rounded-lg inline-block w-fit">
                  Approved to Hospital Account
                </div>
              </div>

              {/* Liability Amount */}
              <div id="liability-amount-card" className="bg-rose-50 rounded-2xl p-4 border border-rose-100 flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div className="absolute -right-3 -bottom-3 text-rose-200/40">
                  <ShieldAlert className="w-16 h-16" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-rose-800 tracking-wider font-bold">OUT-OF-POCKET LIABILITY</span>
                  <div className="text-2xl sm:text-3xl font-sans font-black text-rose-700 mt-1">
                    {formatCurrency(metrics.outOfPocketLiability)}
                  </div>
                </div>
                <div className="text-[11px] text-rose-800 font-medium mt-3 bg-rose-100/50 border border-rose-100 py-1 px-2.5 rounded-lg inline-block w-fit">
                  Patient co-pay & deductions
                </div>
              </div>
            </div>

            {/* Minor stats horizontal bar */}
            <div className="grid grid-cols-3 gap-2 text-center p-3.5 bg-slate-50 rounded-xl border border-slate-150">
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Total Claimed</div>
                <div className="text-xs sm:text-sm font-sans font-bold text-slate-700 mt-0.5">{formatCurrency(metrics.totalClaimed)}</div>
              </div>
              <div className="border-x border-slate-200">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Policy Deductions</div>
                <div className="text-xs sm:text-sm font-sans font-bold text-slate-700 mt-0.5">{formatCurrency(metrics.deductionsApplied)}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Co-pay Applied</div>
                <div className="text-xs sm:text-sm font-sans font-bold text-slate-700 mt-0.5">{formatCurrency(metrics.copaymentApplied)}</div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 shadow-sm">
              <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-mono tracking-wider uppercase font-bold">AI AUDIT DECISION ANALYSIS</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{auditSummary}</p>
            </div>

            {/* Patient Demographics & Admission details */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-3 py-2 border-b border-slate-150 bg-slate-50 text-xs font-bold font-sans text-slate-700">
                Patient Demographics
              </div>
              <div className="p-3.5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-mono uppercase">Full Name</span>
                  <span className="font-semibold text-slate-800 mt-0.5">{patientDetails.name}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-mono uppercase">Age / Gender</span>
                  <span className="font-semibold text-slate-800 mt-0.5">{patientDetails.age} Years / {patientDetails.gender}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-mono uppercase">Length of Stay</span>
                  <span className="font-semibold text-slate-800 mt-0.5">{patientDetails.lengthOfStay}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 text-[10px] font-mono uppercase">Admission Range</span>
                  <span className="font-semibold text-slate-800 mt-0.5">{patientDetails.admissionDate} to {patientDetails.dischargeDate}</span>
                </div>
                <div className="flex flex-col col-span-2">
                  <span className="text-slate-400 text-[10px] font-mono uppercase">Primary Diagnosis & Care</span>
                  <span className="font-semibold text-emerald-750 mt-0.5">{patientDetails.diagnosis}</span>
                </div>
              </div>
            </div>

            {/* Clinical Assessment Section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-3 py-2 border-b border-slate-150 bg-slate-50 text-xs font-bold font-sans text-slate-700">
                Clinical Necessity & Evaluation
              </div>
              <div className="p-3.5 space-y-3 text-xs leading-relaxed">
                <div className="flex items-start space-x-2">
                  <Heart className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-750">Necessity of Admittance: </span>
                    <span className="text-slate-600">{clinicalAssessment.necessityOfHospitalization}</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-750">Therapeutic Appropriateness: </span>
                    <span className="text-slate-600">{clinicalAssessment.treatmentAppropriateness}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>ITEMIZED EXPENSES SUMMARY</span>
              <span>Values in INR (₹)</span>
            </div>

            {/* Responsive Billing Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-mono text-slate-500 tracking-wider">
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Claimed</th>
                      <th className="p-3 text-right">Approved</th>
                      <th className="p-3 text-right text-rose-700">Deducted</th>
                      <th className="p-3">Audit Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billingAudit.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-800">
                          <div className="flex flex-col">
                            <span>{item.category}</span>
                            <span className="mt-0.5 shrink-0">{getStatusBadge(item.status)}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium text-slate-700 font-mono">
                          {formatCurrency(item.claimedAmount)}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-700 font-mono">
                          {formatCurrency(item.approvedAmount)}
                        </td>
                        <td className={`p-3 text-right font-mono font-bold ${item.disallowedAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                          {item.disallowedAmount > 0 ? `-${formatCurrency(item.disallowedAmount)}` : '₹0'}
                        </td>
                        <td className="p-3 text-slate-600 text-[11px] leading-relaxed max-w-xs">
                          {item.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-start space-x-2.5 text-[11px] text-slate-500">
              <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
              <span>
                Note: Standard proportionate deductions will apply to surgeon, consultant, and OT charges if room rent categories are violated, in accordance with Section 4.2 of IRDAI medical insurance guidelines.
              </span>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
              <span>POLICY COMPLIANCE EVALUATION</span>
              <span>CARRIER: {selectedProvider.shortName}</span>
            </div>

            <div className="space-y-3">
              {ruleEvaluations.map((rule, idx) => (
                <div 
                  key={idx} 
                  className={`border rounded-xl p-3.5 flex items-start space-x-3 shadow-sm ${
                    rule.status === 'passed' 
                      ? 'border-emerald-100 bg-emerald-50/20' 
                      : rule.status === 'warning'
                      ? 'border-amber-100 bg-amber-50/20'
                      : 'border-rose-100 bg-rose-50/20'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {rule.status === 'passed' && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    {rule.status === 'warning' && <AlertCircle className="h-5 w-5 text-amber-500" />}
                    {rule.status === 'failed' && <XCircle className="h-5 w-5 text-rose-500" />}
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-slate-850 flex items-center space-x-2">
                      <span>{rule.ruleName}</span>
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">{rule.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-3 animate-in fade-in duration-150 flex-1 flex flex-col h-full min-h-[350px]">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>RAW AUDIT STRUCTURE (JSON)</span>
              <button
                onClick={handleCopyJSON}
                className="flex items-center space-x-1 hover:text-slate-800 transition-colors bg-slate-100 px-2 py-1 rounded"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="flex-1 bg-slate-900 text-emerald-400 p-4 rounded-xl border border-slate-800 text-[10px] font-mono leading-relaxed overflow-auto max-h-[400px]">
              {JSON.stringify(auditResult, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
