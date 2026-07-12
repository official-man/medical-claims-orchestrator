import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, RotateCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { SAMPLE_SUMMARIES } from '../data/samples';
import { SampleSummary, InsuranceProvider } from '../types';

interface UploadPanelProps {
  selectedProvider: InsuranceProvider;
  documentText: string;
  setDocumentText: (text: string) => void;
  isAnalyzing: boolean;
  onRunAudit: (fileBase64?: string, mimeType?: string, selectedSampleId?: string) => void;
}

export default function UploadPanel({
  selectedProvider,
  documentText,
  setDocumentText,
  isAnalyzing,
  onRunAudit
}: UploadPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep track of base64 and mime type of uploaded file to pass up
  const [attachedFile, setAttachedFile] = useState<{ base64: string; mimeType: string } | null>(null);
  const [loadedSampleId, setLoadedSampleId] = useState<string | null>(null);

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Convert uploaded file to base64 and extract text if simple text file, or pass as attachment for multimodal OCR
  const processFile = (file: File) => {
    setFileError(null);
    setUploadedFileName(file.name);
    setLoadedSampleId(null); // Reset loaded sample ID if they upload a file

    const validMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];
    if (!validMimeTypes.includes(file.type) && !file.name.endsWith('.txt')) {
      setFileError('Unsupported file type. Please upload a PDF, PNG, JPEG, or TXT file.');
      return;
    }

    const reader = new FileReader();

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setDocumentText(text);
        setAttachedFile(null); // No need for base64 if it's plain text
      };
      reader.readAsText(file);
    } else {
      // PDF or Image
      reader.onload = (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        setAttachedFile({
          base64: base64Data,
          mimeType: file.type
        });

        // Set preview placeholder text
        setDocumentText(`[Multimodal Document Uploaded: ${file.name}]
File type: ${file.type}
Size: ${(file.size / 1024).toFixed(1)} KB

AI OCR is integrated. Click 'Start AI Audit' below to run real-time OCR extraction, clinical reasoning, and financial audit with Gemini 3.5 Flash.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleLoadSample = (sample: SampleSummary) => {
    setDocumentText(sample.content);
    setUploadedFileName(null);
    setAttachedFile(null);
    setFileError(null);
    setLoadedSampleId(sample.id);
  };

  const handleClear = () => {
    setDocumentText('');
    setUploadedFileName(null);
    setAttachedFile(null);
    setFileError(null);
    setLoadedSampleId(null);
  };

  const handleAuditClick = () => {
    if (attachedFile) {
      onRunAudit(attachedFile.base64, attachedFile.mimeType, undefined);
    } else if (loadedSampleId) {
      onRunAudit(undefined, undefined, loadedSampleId);
    } else {
      onRunAudit();
    }
  };

  // Filter samples that belong to the current provider or show them all labeled
  const filteredSamples = SAMPLE_SUMMARIES.filter(s => s.providerId === selectedProvider.id);
  const otherSamples = SAMPLE_SUMMARIES.filter(s => s.providerId !== selectedProvider.id);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h2 className="font-sans font-bold text-slate-800 text-sm sm:text-base">Claim Intake & Summary</h2>
        </div>
        {documentText && (
          <button
            onClick={handleClear}
            className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* PDF or Image Scan Upload */}
        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Upload Discharge Summary or Claims Invoice
          </label>
          <div
            id="drop-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/40'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.png,.jpeg,.jpg,.txt"
            />
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-full border border-slate-100 shadow-sm">
                <Upload className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700">Drag & drop files here</span>
                <span className="text-xs text-slate-500"> or </span>
                <span className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">browse</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Supports PDF, scanned PNG/JPEG (OCR ready), or TXT (Max 10MB)
              </p>
            </div>
          </div>
          {uploadedFileName && (
            <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs text-slate-700 animate-in fade-in duration-100">
              <div className="flex items-center space-x-2 truncate">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="truncate font-medium">{uploadedFileName}</span>
              </div>
              {attachedFile && (
                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-600">
                  Multimodal Payload Ready
                </span>
              )}
            </div>
          )}
          {fileError && (
            <div className="mt-2.5 p-2.5 bg-rose-50 rounded-lg border border-rose-200 flex items-start space-x-2 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        {/* Step 3: Editable Text Area for Summary Preview */}
        <div className="flex flex-col flex-1 min-h-[220px]">
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Discharge Summary Text Preview & Editor
          </label>
          <div className="flex-1 relative flex flex-col border border-slate-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500 focus-within:border-emerald-500">
            <textarea
              id="document-preview-textarea"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste or type unstructured clinical notes, discharge summaries, or hospital bills here..."
              className="w-full flex-1 p-3.5 text-xs text-slate-800 font-sans resize-none focus:outline-none min-h-[180px] leading-relaxed"
            />
            {documentText && (
              <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 text-[9px] font-mono text-slate-400 text-right">
                {documentText.split(/\s+/).filter(Boolean).length} words | {documentText.length} characters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audit Trigger */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3">
        <button
          id="run-audit-button"
          disabled={!documentText || isAnalyzing}
          onClick={handleAuditClick}
          className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-sm shadow-sm transition-all focus:outline-none ${
            !documentText
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : isAnalyzing
              ? 'bg-slate-800 text-slate-300'
              : 'bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-850 hover:to-slate-750 active:scale-[0.99] hover:shadow'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Analyzing Claim Limits...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span>Start AI Claim Audit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
