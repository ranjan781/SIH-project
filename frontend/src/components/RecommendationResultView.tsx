import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  GitCompare, 
  Printer, 
  Layers, 
  Info,
  ChevronRight,
  Sparkles,
  Check
} from 'lucide-react';
import type { DocumentAnalysisResult, ActiveTab } from '../types';

interface RecommendationResultViewProps {
  analysisResult: DocumentAnalysisResult;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDecisionModal: () => void;
  onOpenReportModal: () => void;
}

export const RecommendationResultView: React.FC<RecommendationResultViewProps> = ({
  analysisResult,
  setActiveTab,
  onOpenDecisionModal,
  onOpenReportModal
}) => {
  const {
    document_name,
    tender_ref,
    issuing_authority,
    detected_product,
    detected_category,
    extracted_specifications,
    referenced_standards,
    primary_recommendation,
    alternative_recommendations,
    diff_comparison,
    overall_status,
    overall_confidence,
    summary_verdict
  } = analysisResult;

  const statusConfig = {
    VALID: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      label: 'Verified • Valid & Current Reference'
    },
    OUTDATED_REFERENCE: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200',
      badgeBg: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: 'Review Required • Superseded Revision Detected'
    },
    REVIEW_REQUIRED: {
      bg: 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      icon: <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
      label: 'Standard Alignment Advisory'
    },
    MISMATCH_DETECTED: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200',
      badgeBg: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
      icon: <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
      label: 'Critical • Specification Mismatch'
    }
  }[overall_status] || {
    bg: 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    icon: <Info className="w-4 h-4 text-slate-600 dark:text-slate-400" />,
    label: overall_status
  };

  const confidencePct = Math.round(overall_confidence * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-page-enter">
      {/* Top Compliance Summary Banner */}
      <div className={`rounded-xl p-5 border shadow-xs ${statusConfig.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{statusConfig.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusConfig.badgeBg}`}>
                  {statusConfig.label}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  ID: {analysisResult.analysis_id}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {summary_verdict}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Document: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{document_name}</strong>
                {tender_ref && <> • Ref: <span className="font-mono text-slate-700 dark:text-slate-300">{tender_ref}</span></>}
                {issuing_authority && <> • Authority: <span className="text-slate-700 dark:text-slate-300">{issuing_authority}</span></>}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Audit Certificate</span>
            </button>
            <button
              onClick={onOpenDecisionModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-200" />
              <span>Officer Signoff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Specifications & Primary Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Extracted Specifications */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3.5">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Extracted Product Specifications</span>
              </h3>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono px-1.5 py-0.2 rounded font-semibold">
                NLP Extracted
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Identified Product</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">{detected_product}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Product Category</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{detected_category}</p>
              </div>

              {extracted_specifications.grade && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Specified Technical Grade</span>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700 inline-block text-[11px]">
                    {extracted_specifications.grade}
                  </p>
                </div>
              )}

              {extracted_specifications.material && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Material Composition</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{extracted_specifications.material}</p>
                </div>
              )}

              {extracted_specifications.dimensions && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dimensions & Physical Limits</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5 bg-slate-50 dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700 text-[11px]">
                    {extracted_specifications.dimensions}
                  </p>
                </div>
              )}

              {extracted_specifications.testing_requirements.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Required Testing Protocols</span>
                  <ul className="mt-1 space-y-1">
                    {extracted_specifications.testing_requirements.map((test, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                        <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Referenced Standards in Document */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5">
              Referenced IS Codes in Document
            </h3>

            {referenced_standards.length > 0 ? (
              <div className="space-y-2">
                {referenced_standards.map((ref, idx) => {
                  const isRefOutdated = ref.discrepancy_type === 'OUTDATED_REVISION' || ref.discrepancy_type === 'WITHDRAWN_STANDARD';
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border text-xs ${
                        isRefOutdated 
                          ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200' 
                          : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs">{ref.normalized_is}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          isRefOutdated ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                        }`}>
                          {ref.discrepancy_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {ref.discrepancy_details}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-500 text-center">
                No explicit IS standard number referenced in tender clauses.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Primary Standard Recommendation */}
        <div className="lg:col-span-7 space-y-4">
          {primary_recommendation ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs overflow-hidden">
              {/* Card Header (Deep Navy Header) */}
              <div className="bg-[#0b1329] text-white p-5 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-400" />
                    <span>Recommended Indian Standard</span>
                  </span>
                  <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-xs font-mono font-bold text-slate-200 border border-slate-700">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>{confidencePct}% Confidence ({primary_recommendation.confidence_level})</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mt-1.5 font-mono">
                  {primary_recommendation.is_number}
                </h3>
                <p className="text-xs text-slate-300 font-medium mt-0.5 leading-relaxed">
                  {primary_recommendation.title}
                </p>
              </div>

              <div className="p-5 space-y-4 text-xs">
                {/* 5-Point Explainable AI Justifications */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Why this standard? (Explainable AI Rationale)</span>
                  </h4>
                  <div className="space-y-1.5">
                    {primary_recommendation.why_recommended_reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-mono text-[10px] font-bold text-slate-500 w-4 shrink-0 mt-0.5">
                          0{i + 1}.
                        </span>
                        <span className="leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flagged / Superseded Rejection Reason */}
                {primary_recommendation.why_rejected_reasons.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <h4 className="text-[11px] font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Why was the referenced edition flagged?</span>
                    </h4>
                    <div className="space-y-1 text-xs text-amber-900 dark:text-amber-300">
                      {primary_recommendation.why_rejected_reasons.map((rej, i) => (
                        <p key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{rej}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Control Order */}
                {primary_recommendation.mandatory_qco && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] block mb-0.5">
                      Statutory Quality Control Order (QCO) Reference
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {primary_recommendation.mandatory_qco}
                    </p>
                  </div>
                )}

                {/* Scope Excerpt */}
                {primary_recommendation.scope_excerpt && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Standard Scope Excerpt
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700 leading-relaxed italic">
                      "{primary_recommendation.scope_excerpt}"
                    </p>
                  </div>
                )}

                {/* Quick Link to Side-by-Side Comparison */}
                {diff_comparison && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveTab('comparison')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>View Side-by-Side Clause Diff Matrix</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={onOpenDecisionModal}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Signoff Decision →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              No matching Indian Standard recommendation found.
            </div>
          )}

          {/* Supplementary Standards */}
          {alternative_recommendations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Supplementary & Test Standards</span>
              </h3>
              <div className="space-y-1.5">
                {alternative_recommendations.map((alt) => (
                  <div key={alt.standard_id} className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{alt.is_number}</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-2">{alt.title}</span>
                    </div>
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-300 shrink-0 ml-2">
                      {Math.round(alt.confidence_score * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
