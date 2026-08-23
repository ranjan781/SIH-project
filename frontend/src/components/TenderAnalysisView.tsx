import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  File, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  Layers, 
  AlertCircle,
  Building,
  ArrowRight
} from 'lucide-react';
import { SampleTender, DocumentAnalysisResult } from '../types';
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

  const pipelineSteps = [
    "Ingesting Document & Cleaning Technical Specification Text...",
    "Running NLP Entity Extractor for IS Numbers, Grades & Materials...",
    "Querying Indian Standards Revision Timeline & Quality Control Orders (QCO)...",
    "Evaluating Specification Compatibility Matrix & Semantic Similarity...",
    "Synthesizing Explainable AI Rationale & Composite Confidence Scoring..."
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
      setErrorMessage("Please paste or type at least 15 characters of tender technical specification text.");
      return;
    }
    if (inputMode === 'upload' && !uploadedFile) {
      setErrorMessage("Please select a valid PDF, DOCX, or TXT tender document.");
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Step animation interval
    const stepInterval = setInterval(() => {
      setAnalysisStep(prev => (prev < pipelineSteps.length - 1 ? prev + 1 : prev));
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
          selectedSample ? `${selectedSample.id}.txt` : "Pasted_Tender_Spec.txt"
        );
      }

      clearInterval(stepInterval);
      setAnalysisStep(pipelineSteps.length - 1);

      // Short delay to let user see final check
      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalysisComplete(result);
      }, 500);

    } catch (err: any) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      setErrorMessage(err.message || "An error occurred during analysis. Please retry.");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Tender Specification Analysis Studio</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Upload an official procurement document (PDF/DOCX) or paste technical clause text to extract applicable Indian Standards (IS).
            </p>
          </div>

          {/* Quick Presets Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Sample Presets:</span>
            <select
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onChange={(e) => {
                const s = sampleTenders.find(t => t.id === e.target.value);
                if (s) handleSelectSample(s);
              }}
              defaultValue={selectedSample?.id || ""}
            >
              <option value="" disabled>Choose a realistic tender...</option>
              {sampleTenders.map(s => (
                <option key={s.id} value={s.id}>
                  {s.category}: {s.title.substring(0, 36)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="mt-6 flex border-b border-slate-200">
          <button
            onClick={() => setInputMode('paste')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              inputMode === 'paste'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Paste Specification Text
          </button>
          <button
            onClick={() => setInputMode('upload')}
            className={`pb-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              inputMode === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Upload Document (PDF / DOCX / TXT)
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Input Form */}
        <div className="mt-6 space-y-4">
          {inputMode === 'paste' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tender Specification & Clauses
              </label>
              <textarea
                rows={7}
                value={tenderText}
                onChange={(e) => setTenderText(e.target.value)}
                placeholder="Paste tender text here, e.g. 'Supply of High Strength Deformed Steel Bars Fe 500D conforming to IS 1786:2008 with min 16% elongation and max 0.075% S+P...'"
                className="w-full text-xs sm:text-sm font-sans p-3.5 bg-slate-50/70 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Supports natural technical tender clauses, product descriptions, test criteria & IS codes</span>
                <span>{tenderText.length} characters</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload Tender Document
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                  uploadedFile
                    ? 'border-emerald-400 bg-emerald-50/30'
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.txt"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-100/70 flex items-center justify-center text-blue-600 mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                {uploadedFile ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{uploadedFile.name}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • Click to change file
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Click to upload or drag & drop tender document
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PDF, Word (.docx), or plain text (Max 15MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata Parameters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Product Category Hint (Optional)
              </label>
              <select
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">Auto-Detect Domain (Recommended)</option>
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
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Tender Reference Number (Optional)
              </label>
              <input
                type="text"
                value={tenderRef}
                onChange={(e) => setTenderRef(e.target.value)}
                placeholder="e.g. GeM/2024/B/492109"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Issuing Authority / PSU (Optional)
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. State PWD / CPWD / NHPC"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                isAnalyzing
                  ? 'bg-slate-700 cursor-not-allowed opacity-90'
                  : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-600 hover:from-blue-600 hover:to-indigo-600 shadow-blue-900/30 active:scale-[0.99]'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Through AI Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Standards Verification & Recommendation</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progressive AI Pipeline Execution Animation */}
      {isAnalyzing && (
        <div className="bg-slate-900 rounded-2xl p-6 text-white border border-blue-800 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping"></span>
              <h3 className="text-sm font-bold tracking-wide uppercase text-blue-300">
                Executing AI Recommendation Pipeline
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Step {analysisStep + 1} of {pipelineSteps.length}</span>
          </div>

          <div className="space-y-3">
            {pipelineSteps.map((stepText, idx) => {
              const isDone = idx < analysisStep;
              const isCurrent = idx === analysisStep;
              return (
                <div 
                  key={idx}
                  className={`flex items-center gap-3 p-2.5 rounded-lg text-xs transition-all ${
                    isCurrent 
                      ? 'bg-blue-950/80 border border-blue-500/50 text-blue-200' 
                      : (isDone ? 'text-emerald-300 opacity-80' : 'text-slate-600')
                  }`}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    )}
                  </div>
                  <span className="font-medium">{stepText}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
