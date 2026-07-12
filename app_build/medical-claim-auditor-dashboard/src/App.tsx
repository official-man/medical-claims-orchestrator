import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, FileText, Activity, Layers, AlertCircle, FileSpreadsheet, 
  Settings, HelpCircle, Heart, CheckCircle, Brain, Sparkles, Plus
} from 'lucide-react';

import Navbar from './components/Navbar';
import UploadPanel, { AttachedFile } from './components/UploadPanel';
import AuditResultsPanel from './components/AuditResultsPanel';

import { INSURANCE_PROVIDERS, SAMPLE_SUMMARIES } from './data/samples';
import { InsuranceProvider, AuditResult } from './types';

export default function App() {
  const [providers] = useState<InsuranceProvider[]>(INSURANCE_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<InsuranceProvider>(INSURANCE_PROVIDERS[0]);
  const [documentText, setDocumentText] = useState<string>('');
  
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [auditSource, setAuditSource] = useState<string | undefined>(undefined);

  // When selected provider changes, let's load the corresponding recommended sample summary
  // to make the experience instantly interactive!
  useEffect(() => {
    const recommendedSample = SAMPLE_SUMMARIES.find(s => s.providerId === selectedProvider.id);
    if (recommendedSample) {
      setDocumentText(recommendedSample.content);
      // Clear previous result to prompt fresh analysis
      setAuditResult(null);
      setErrorMsg(null);
    }
  }, [selectedProvider]);

  const handleSelectProvider = (provider: InsuranceProvider) => {
    setSelectedProvider(provider);
  };

  // Run claims audit calling Express API route /api/audit
  // files[] is the array of AttachedFile objects (base64 + mimeType) from UploadPanel.
  // An empty array means text-only mode — the editor content is still sent.
  const handleRunAudit = async (files?: AttachedFile[], sampleId?: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setAuditResult(null);
    setAuditSource(undefined);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          providerData: selectedProvider,
          documentText: documentText,
          discharge_text: documentText,   // editor text for text-direct pipeline
          // NEW: send the full files array so the backend can loop over each one
          files: files ?? [],
          sampleId: sampleId,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      // Capture which tier handled this request (python_pipeline | gemini-3.5-flash)
      if (data.source) setAuditSource(data.source);

      if (data.result) {
        setAuditResult(data.result);
      } else {
        throw new Error('Audit API returned empty result.');
      }

    } catch (err: any) {
      console.error('Frontend Audit Error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred during the claims audit process.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500/10 selection:text-emerald-700">
      {/* Top Navbar */}
      <Navbar 
        providers={providers} 
        selectedProvider={selectedProvider} 
        onSelectProvider={handleSelectProvider} 
      />

      {/* Main workspace layout */}
      <main className="flex-1 max-w-full w-full p-4 sm:p-6 lg:p-8 flex flex-col space-y-4">
        
        {/* Visual intro / welcome banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 sm:p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Subtle accent blob */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 hidden sm:block">
              <Brain className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full">
                  AI CO-PILOT ACTIVE
                </span>
                <span className="text-slate-400 text-xs font-mono">•</span>
                <span className="text-slate-300 text-xs font-mono">GEMINI 3.5 FLASH</span>
              </div>
              <h1 className="text-lg sm:text-xl font-sans font-black tracking-tight mt-1">
                Medical claims Auditor workspace
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Empowering claim adjusters with instant multimodal clinical auditing. Parse medical text files, invoices, or PDF records to check eligibility and roommate-ICU sub-limits automatically.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-750 p-3 rounded-xl shrink-0 text-xs font-mono max-w-xs">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Carrier Limits Loaded</div>
            <div className="flex justify-between space-x-4 mb-0.5">
              <span className="text-slate-500">Plan Name:</span>
              <span className="text-slate-200 font-semibold truncate">{selectedProvider.shortName}</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-slate-500">Sum Insured:</span>
              <span className="text-emerald-400 font-semibold">{selectedProvider.policyDetails.sumInsured}</span>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-800 flex items-start space-x-3 shadow-sm"
            >
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Auditing Failure:</span> {errorMsg}
                <div className="mt-2">
                  <button 
                    onClick={() => handleRunAudit()}
                    className="bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold px-3 py-1.5 rounded-md transition-all mr-2"
                  >
                    Retry Audit
                  </button>
                  <button 
                    onClick={() => setErrorMsg(null)}
                    className="text-rose-700 hover:text-rose-900 underline font-medium"
                  >
                    Dismiss Warning
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace split screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
          {/* Left Panel - Intake, previews, editors */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-[500px]">
            <UploadPanel
              selectedProvider={selectedProvider}
              documentText={documentText}
              setDocumentText={setDocumentText}
              isAnalyzing={isAnalyzing}
              onRunAudit={handleRunAudit}
            />
          </div>

          {/* Right Panel - Audit ledger, itemized tables, policy outcomes */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            <AuditResultsPanel
              auditResult={auditResult}
              selectedProvider={selectedProvider}
              isAnalyzing={isAnalyzing}
              source={auditSource}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-full w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-2">
          <div className="flex items-center space-x-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-500" />
            <span>Secure Medical Auditing Portal • HIPAA Compliant TLS Encryption</span>
          </div>
          <div>
            <span>System Time: 2026-07-03 UTC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
