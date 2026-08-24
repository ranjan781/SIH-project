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
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Procurement Audit Studio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Tender Specification Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Extract parameters, detect referenced Indian Standards (IS), and check active edition compliance against the 152-standard BIS catalog.
          </p>
        </div>

        {/* Presets Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Sample Preset:</span>
          <select
            className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-medium text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-600 focus:outline-none"
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
            <button
              onClick={() => setInputMode('paste')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                inputMode === 'paste'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Tender Clauses</span>
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                inputMode === 'upload'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document (PDF / DOCX)</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Textarea or Upload Box */}
          {inputMode === 'paste' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tender Specification Text
              </label>
              <textarea
                rows={9}
                value={tenderText}
                onChange={(e) => setTenderText(e.target.value)}
                placeholder="Paste tender specification clauses here (e.g. 'Supply of High Strength Deformed Steel Bars Fe 500D conforming to IS 1786:2008 with min 16% elongation...')"
                className="w-full text-xs font-mono p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1.5">
                <span>Accepts unstructured text, tables, and standard IS citations</span>
                <span className="font-mono">{tenderText.length} chars</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Upload Document File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  uploadedFile
                    ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                {uploadedFile ? (
                  <div>
                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{uploadedFile.name}</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to upload or drag & drop tender PDF / DOCX / TXT
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Supports PDF, Microsoft Word, Plain Text (Max 15MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Context Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Category Hint
              </label>
              <select
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-medium text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              >
                <option value="all">Auto-Detect Category</option>
                <option value="Cement & Concrete">Cement & Concrete</option>
                <option value="Steel & Metal Products">Steel & Metal Products</option>
                <option value="Water Supply & Pipes">Water Supply & Pipes</option>
                <option value="Electrical & Wiring">Electrical & Wiring</option>
                <option value="Safety Equipment">Safety Equipment</option>
                <option value="Plastic Products">Plastic Products</option>
                <option value="Bricks & Clay Products">Bricks & Clay Products</option>
                <option value="Timber & Wood Products">Timber & Wood Products</option>
                <option value="Paints & Coatings">Paints & Coatings</option>
                <option value="Aggregates & Sand">Aggregates & Sand</option>
                <option value="Adhesives">Adhesives</option>
                <option value="Furniture">Furniture</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Tender Ref No (Optional)
              </label>
              <input
                type="text"
                value={tenderRef}
                onChange={(e) => setTenderRef(e.target.value)}
                placeholder="e.g. GeM/2024/B/4921"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 font-mono text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Issuing Authority (Optional)
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. CPWD / NHAI"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-3 px-5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 shadow-sm transition-all ${
                isAnalyzing
                  ? 'bg-slate-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Verification Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Run Standards Verification & Recommendation</span>
                  <ArrowRight className="w-4 h-4 text-blue-200" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Pipeline Stepper (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span>Verification Pipeline Stages</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                {isAnalyzing ? `Stage ${analysisStep + 1} of 5` : 'Standby'}
              </span>
            </div>

            <div className="space-y-3">
              {pipelineStages.map((stage, idx) => {
                const isCompleted = isAnalyzing ? idx < analysisStep : false;
                const isCurrent = isAnalyzing && idx === analysisStep;

                return (
                  <div 
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isCurrent 
                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 font-semibold' 
                        : (isCompleted 
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200' 
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-500')
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-mono text-slate-400">
                          {idx + 1}
                        </span>
                      )}
                      <span className="font-bold text-slate-900 dark:text-slate-100">{stage.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-6 mt-1">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Procurement Audit Checklist
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Verify that standard year matches active BIS gazette.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Ensure mandatory QCO compliance clause is attached.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Record officer signoff in audit log prior to bid release.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
