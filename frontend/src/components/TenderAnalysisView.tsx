import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  ArrowRight,
  SlidersHorizontal,
  Layers,
  FileCheck,
  Check
} from 'lucide-react';
import type { SampleTender, DocumentAnalysisResult } from '../types';
import { ApiService } from '../services/api';

interface TenderAnalysisViewProps {
  onAnalysisComplete: (result: DocumentAnalysisResult) => void;
  sampleTenders: SampleTender[];
  selectedSample?: SampleTender | null;
}

export const TenderAnalysisView: React.FC<TenderAnalysisViewProps> = ({
  onAnalysisComplete,
  sampleTenders,
  selectedSample
}) => {
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [tenderText, setTenderText] = useState<string>(selectedSample ? selectedSample.text : '');
  const [categoryHint, setCategoryHint] = useState<string>(selectedSample ? selectedSample.category : 'all');
  const [tenderRef, setTenderRef] = useState<string>(selectedSample ? selectedSample.tender_ref : '');
  const [issuingAuthority, setIssuingAuthority] = useState<string>(selectedSample ? selectedSample.issuing_authority : '');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const pipelineStages = [
    { label: "Document Ingestion & Text Preprocessing", desc: "Sanitizing clauses, removing formatting artifacts" },
    { label: "NLP Entity Extraction & Parameter Parsing", desc: "Detecting IS codes, material grades, tolerances" },
    { label: "Temporal Revision Graph Check", desc: "Cross-referencing active edition years & QCO mandates" },
    { label: "Specification Compatibility Matrix", desc: "Evaluating tensile strength, composition & test protocols" },
    { label: "Explainable Recommendation & Confidence Scoring", desc: "Synthesizing 5-point evidence rationale" }
  ];

  const handleSelectSample = (sample: SampleTender) => {
    setTenderText(sample.text);
    setCategoryHint(sample.category);
    setTenderRef(sample.tender_ref);
    setIssuingAuthority(sample.issuing_authority);
    setInputMode('paste');
    setErrorMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      setErrorMessage(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (inputMode === 'paste' && tenderText.trim().length < 15) {
      setErrorMessage("Please enter at least 15 characters of tender specification text.");
      return;
    }
    if (inputMode === 'upload' && !uploadedFile) {
      setErrorMessage("Please upload a PDF, DOCX, or TXT tender document.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Progressive stage animation
    const stageInterval = setInterval(() => {
      setAnalysisStep(prev => (prev < pipelineStages.length - 1 ? prev + 1 : prev));
    }, 450);

    try {
      let result: DocumentAnalysisResult;

      if (inputMode === 'upload' && uploadedFile) {
        result = await ApiService.analyzeDocument(
          uploadedFile,
          categoryHint !== 'all' ? categoryHint : undefined,
          tenderRef || undefined,
          issuingAuthority || undefined
        );
      } else {
        result = await ApiService.analyzeText(
          tenderText,
          categoryHint !== 'all' ? categoryHint : undefined,
          tenderRef || undefined,
          issuingAuthority || undefined,
          selectedSample ? `${selectedSample.id}.txt` : "Tender_Specification.txt"
        );
      }

      clearInterval(stageInterval);
      setAnalysisStep(pipelineStages.length - 1);

      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(result);
      }, 500);

    } catch (err: any) {
      clearInterval(stageInterval);
      setIsAnalyzing(false);
      setErrorMessage(err.message || "Analysis could not be completed. Please verify document formatting.");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-page-enter">
      {/* Top Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              Module: IS-Verification
            </span>
            <span className="text-xs text-slate-400">SIH26108 Workspace</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Tender Specification Analysis Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ingest procurement bid specifications to extract technical parameters, detect cited standards, and verify against active BIS editions.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Sample Presets:</span>
          <select
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
            onChange={(e) => {
              const s = sampleTenders.find(t => t.id === e.target.value);
              if (s) handleSelectSample(s);
            }}
            defaultValue={selectedSample?.id || ""}
          >
            <option value="" disabled>Load a realistic tender...</option>
            {sampleTenders.map(s => (
              <option key={s.id} value={s.id}>
                {s.category}: {s.title.substring(0, 34)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Workspace Layout (Left: Input & Metadata | Right: Live Pipeline Status & Guidance) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
          {/* Mode Switcher */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setInputMode('paste')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                inputMode === 'paste'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Paste Specification Clauses
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
                inputMode === 'upload'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Upload Document (PDF / DOCX)
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Input Area */}
          {inputMode === 'paste' ? (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tender Specification Text
              </label>
              <textarea
                rows={8}
                value={tenderText}
                onChange={(e) => setTenderText(e.target.value)}
                placeholder="Paste tender specification clauses here (e.g. 'Supply of High Strength Deformed Steel Bars Fe 500D conforming to IS 1786:2008 with min 16% elongation...')"
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-slate-800 focus:outline-none transition-all leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Accepts unstructured text, technical tables, and standard references</span>
                <span>{tenderText.length} characters</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Upload Procurement Document
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  uploadedFile
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />
                <UploadCloud className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                {uploadedFile ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{uploadedFile.name}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • Click to choose different file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Click to upload or drag & drop tender PDF/DOCX
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports Adobe PDF, Microsoft Word, Plain Text (Max 15MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Context Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Product Category Hint
              </label>
              <select
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
              >
                <option value="all">Auto-Detect Category</option>
                <option value="Construction & Structural">Construction & Structural</option>
                <option value="Electrical & Cables">Electrical & Cables</option>
                <option value="Safety & PPE">Safety & PPE</option>
                <option value="Fire Safety">Fire Safety</option>
                <option value="Pipes & Infrastructure">Pipes & Infrastructure</option>
                <option value="Toys & Child Safety">Toys & Child Safety</option>
                <option value="Medical & Healthcare">Medical & Healthcare</option>
                <option value="Renewable Energy & Solar">Renewable Energy & Solar</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Tender Reference (Optional)
              </label>
              <input
                type="text"
                value={tenderRef}
                onChange={(e) => setTenderRef(e.target.value)}
                placeholder="e.g. GeM/2024/B/4921"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                Authority / PSU (Optional)
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. CPWD Bridges"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-2 shadow-xs transition-all ${
                isAnalyzing
                  ? 'bg-slate-700 cursor-not-allowed opacity-90'
                  : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Analysis Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>Run Standards Verification & Recommendation</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Guidance & Execution Stepper (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time Pipeline Execution Panel */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Verification Pipeline Stages</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                {isAnalyzing ? `Active: Stage ${analysisStep + 1}/5` : 'Standby'}
              </span>
            </div>

            <div className="space-y-2.5">
              {pipelineStages.map((stage, idx) => {
                const isCompleted = isAnalyzing ? idx < analysisStep : false;
                const isCurrent = isAnalyzing && idx === analysisStep;

                return (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs transition-all ${
                      isCurrent 
                        ? 'bg-sky-50/70 border-sky-300 text-sky-950 font-medium' 
                        : (isCompleted 
                            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' 
                            : 'bg-slate-50/50 border-slate-200 text-slate-500')
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono text-slate-400">
                            {idx + 1}
                          </span>
                        )}
                        <span className="font-semibold text-slate-800">{stage.label}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 ml-5.5 mt-0.5">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Regulatory Guidance */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Procurement Audit Checklist
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600">
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify that standard year matches active BIS gazette.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ensure mandatory QCO compliance clause is attached.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                <span>Record officer signoff in audit log prior to bid release.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
