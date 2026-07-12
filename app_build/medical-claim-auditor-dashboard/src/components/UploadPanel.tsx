import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, RotateCcw, Loader2, Sparkles, AlertCircle, X } from 'lucide-react';
import { SAMPLE_SUMMARIES } from '../data/samples';
import { SampleSummary, InsuranceProvider } from '../types';

// ── Each uploaded file is stored as base64 + its MIME type ──────────────────
export interface AttachedFile {
  name: string;
  base64: string;
  mimeType: string;
  sizeKb: number;
}

interface UploadPanelProps {
  selectedProvider: InsuranceProvider;
  documentText: string;
  setDocumentText: (text: string) => void;
  isAnalyzing: boolean;
  // onRunAudit now receives an array of AttachedFile objects (may be empty)
  onRunAudit: (files?: AttachedFile[], selectedSampleId?: string) => void;
}

export default function UploadPanel({
  selectedProvider,
  documentText,
  setDocumentText,
  isAnalyzing,
  onRunAudit
}: UploadPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Multi-file state: array of processed attachments ────────────────────
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [loadedSampleId, setLoadedSampleId] = useState<string | null>(null);

  const VALID_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain'];

  // ── processFiles — converts a FileList into AttachedFile[] entries ───────
  // For plain-text files, the content goes into the editor textarea.
  // For PDF/Image files, they are base64-encoded and stored in attachedFiles[].
  const processFiles = (fileList: FileList) => {
    setFileError(null);
    setLoadedSampleId(null);

    const newAttachments: AttachedFile[] = [];
    let textContent = '';
    let invalidFound = false;

    // Use a promise array so we can wait for all FileReaders to finish
    const readerPromises = Array.from(fileList).map((file) => {
      return new Promise<void>((resolve) => {
        if (!VALID_MIME_TYPES.includes(file.type) && !file.name.endsWith('.txt')) {
          invalidFound = true;
          resolve();
          return;
        }

        const reader = new FileReader();

        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
          // TXT → dump into the text editor
          reader.onload = (e) => {
            textContent += (textContent ? '\n\n---\n\n' : '') + (e.target?.result as string);
            resolve();
          };
          reader.readAsText(file);
        } else {
          // PDF / Image → base64 encode and keep in attachedFiles[]
          reader.onload = (e) => {
            const base64Data = (e.target?.result as string).split(',')[1];
            newAttachments.push({
              name: file.name,
              base64: base64Data,
              mimeType: file.type,
              sizeKb: parseFloat((file.size / 1024).toFixed(1)),
            });
            resolve();
          };
          reader.readAsDataURL(file);
        }
      });
    });

    Promise.all(readerPromises).then(() => {
      if (invalidFound) {
        setFileError('One or more files have unsupported types. Please upload PDF, PNG, JPEG, or TXT files only.');
      }

      // Merge new text into editor
      if (textContent) {
        setDocumentText(textContent);
      }

      // Merge new binary attachments into state (deduplicate by name)
      if (newAttachments.length > 0) {
        setAttachedFiles((prev) => {
          const existingNames = new Set(prev.map((f) => f.name));
          const fresh = newAttachments.filter((f) => !existingNames.has(f.name));
          const merged = [...prev, ...fresh];

          // Update text preview area to reflect all attached files
          const names = merged.map((f) => f.name).join(', ');
          setDocumentText(
            `[${merged.length} Multimodal Document(s) Uploaded: ${names}]\n\n` +
            `AI OCR is integrated. Click 'Start AI Audit' to run real-time extraction and financial audit with Gemini.`
          );
          return merged;
        });
      }
    });
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input so the same file can be re-added if cleared
      e.target.value = '';
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  // ── Remove a single attachment ────────────────────────────────────────────
  const removeFile = (fileName: string) => {
    setAttachedFiles((prev) => {
      const updated = prev.filter((f) => f.name !== fileName);
      if (updated.length === 0) {
        // If no binary files remain and editor still shows the placeholder, clear it
        setDocumentText('');
      } else {
        const names = updated.map((f) => f.name).join(', ');
        setDocumentText(
          `[${updated.length} Multimodal Document(s) Uploaded: ${names}]\n\n` +
          `AI OCR is integrated. Click 'Start AI Audit' to run real-time extraction and financial audit with Gemini.`
        );
      }
      return updated;
    });
  };

  const handleLoadSample = (sample: SampleSummary) => {
    setDocumentText(sample.content);
    setAttachedFiles([]);
    setFileError(null);
    setLoadedSampleId(sample.id);
  };

  const handleClear = () => {
    setDocumentText('');
    setAttachedFiles([]);
    setFileError(null);
    setLoadedSampleId(null);
  };

  const handleAuditClick = () => {
    // ── DIAGNOSTIC LOG 1: What is in the queue when button is clicked? ──
    console.group('%c[AUDIT] Button clicked', 'color: #10b981; font-weight: bold');
    console.log('attachedFiles count :', attachedFiles.length);
    console.log('attachedFiles names :', attachedFiles.map(f => `${f.name} (${f.sizeKb}KB, ${f.mimeType})`));
    console.log('loadedSampleId      :', loadedSampleId);
    console.log('documentText length :', documentText.length);
    console.log('documentText preview:', documentText.substring(0, 120));
    console.groupEnd();

    if (attachedFiles.length > 0) {
      // Pass the full array of file attachments up to the parent
      onRunAudit(attachedFiles, undefined);
    } else if (loadedSampleId) {
      onRunAudit([], loadedSampleId);
    } else {
      // Text-only mode — no file attachments
      onRunAudit([], undefined);
    }
  };

  const filteredSamples = SAMPLE_SUMMARIES.filter(s => s.providerId === selectedProvider.id);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-slate-700" />
          <h2 className="font-sans font-bold text-slate-800 text-sm sm:text-base">Claim Intake &amp; Summary</h2>
        </div>
        {(documentText || attachedFiles.length > 0) && (
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
        {/* Drop Zone */}
        <div>
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Upload Discharge Summary or Claims Invoice
            <span className="ml-2 text-emerald-600 font-bold">(Multiple Files Supported)</span>
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
            {/* multiple attribute added here — allows selecting several files at once */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileInputChange}
              accept=".pdf,.png,.jpeg,.jpg,.txt"
            />
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-slate-50 text-slate-600 rounded-full border border-slate-100 shadow-sm">
                <Upload className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700">Drag &amp; drop files here</span>
                <span className="text-xs text-slate-500"> or </span>
                <span className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline">browse</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans">
                Supports multiple PDFs, scanned PNG/JPEG (OCR ready), or TXT (Max 10MB each)
              </p>
            </div>
          </div>

          {/* ── Attached files list — one chip per file with a remove button ── */}
          {attachedFiles.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                {attachedFiles.length} file{attachedFiles.length > 1 ? 's' : ''} queued for OCR
              </p>
              {attachedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 animate-in fade-in duration-100"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono text-slate-500 shrink-0">
                      {file.sizeKb} KB
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                    className="ml-2 p-1 rounded hover:bg-rose-100 hover:text-rose-600 text-slate-400 transition-colors shrink-0"
                    title="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fileError && (
            <div className="mt-2.5 p-2.5 bg-rose-50 rounded-lg border border-rose-200 flex items-start space-x-2 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        {/* Editable Text Area */}
        <div className="flex flex-col flex-1 min-h-[220px]">
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Discharge Summary Text Preview &amp; Editor
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
          disabled={(!documentText && attachedFiles.length === 0) || isAnalyzing}
          onClick={handleAuditClick}
          className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 text-sm shadow-sm transition-all focus:outline-none ${
            (!documentText && attachedFiles.length === 0)
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
              <span>
                Start AI Claim Audit
                {attachedFiles.length > 1 && (
                  <span className="ml-1.5 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {attachedFiles.length} files
                  </span>
                )}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
