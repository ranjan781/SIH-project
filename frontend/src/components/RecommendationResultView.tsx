import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  GitCompare, 
  Download, 
  Printer, 
  Layers, 
  Info,
  Building,
  Calendar,
  Sparkles,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DocumentAnalysisResult, ActiveTab } from '../types';

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

  const isOutdated = overall_status === 'OUTDATED_REFERENCE';
  const isValid = overall_status === 'VALID';
  const isMismatch = overall_status === 'MISMATCH_DETECTED';

  const statusConfig = {
    VALID: {
      bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      label: 'Valid & Current Reference'
    },
    OUTDATED_REFERENCE: {
      bg: 'bg-amber-50 border-amber-300 text-amber-950',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      label: 'Superseded / Outdated Reference Detected'
    },
    REVIEW_REQUIRED: {
      bg: 'bg-blue-50 border-blue-300 text-blue-950',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      label: 'Standard Alignment Recommended'
    },
    MISMATCH_DETECTED: {
      bg: 'bg-rose-50 border-rose-300 text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: <XCircle className="w-5 h-5 text-rose-600" />,
      label: 'Product-Standard Mismatch'
    }
  }[overall_status] || {
    bg: 'bg-slate-50 border-slate-300 text-slate-900',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: <Info className="w-5 h-5 text-slate-600" />,
    label: overall_status
  };

  const confidencePct = Math.round(overall_confidence * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Header Summary Banner */}
      <div className={`rounded-2xl p-5 sm:p-6 border shadow-sm ${statusConfig.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5">{statusConfig.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.badgeBg}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Analysis ID: {analysisResult.analysis_id}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {summary_verdict}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Document: <strong className="text-slate-800">{document_name}</strong>
                {tender_ref && <> • Ref: <span className="font-mono">{tender_ref}</span></>}
                {issuing_authority && <> • Authority: <span>{issuing_authority}</span></>}
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Audit Report</span>
            </button>
            <button
              onClick={onOpenDecisionModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Officer Decision Signoff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Extracted Specs & Primary Standard Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Extracted Document Specifications */}
        <div className="lg:col-span-5 space-y-5">
          {/* Product Identification Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Extracted Tender Specifications</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                NLP Identified
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px]">Identified Product</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{detected_product}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium uppercase text-[10px]">Industry Domain / Category</p>
                <p className="font-semibold text-blue-700 mt-0.5">{detected_category}</p>
              </div>

              {extracted_specifications.grade && (
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Material Grade / Class</p>
                  <p className="font-semibold text-slate-800 mt-0.5 font-mono bg-slate-50 p-1.5 rounded border border-slate-100 inline-block">
                    {extracted_specifications.grade}
                  </p>
                </div>
              )}

              {extracted_specifications.material && (
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Material Base</p>
                  <p className="font-medium text-slate-700 mt-0.5">{extracted_specifications.material}</p>
                </div>
              )}

              {extracted_specifications.dimensions && (
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Dimensions / Numerical Limits</p>
                  <p className="font-mono text-slate-700 mt-0.5 bg-slate-50 p-1.5 rounded border border-slate-100">
                    {extracted_specifications.dimensions}
                  </p>
                </div>
              )}

              {extracted_specifications.testing_requirements.length > 0 && (
                <div>
                  <p className="text-slate-400 font-medium uppercase text-[10px]">Required Testing Protocols</p>
                  <ul className="mt-1 space-y-1">
                    {extracted_specifications.testing_requirements.map((test, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-slate-700 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Referenced Standards in Tender Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Referenced IS Codes in Tender
            </h3>

            {referenced_standards.length > 0 ? (
              <div className="space-y-2.5">
                {referenced_standards.map((ref, idx) => {
                  const isRefOutdated = ref.discrepancy_type === 'OUTDATED_REVISION' || ref.discrepancy_type === 'WITHDRAWN_STANDARD';
                  return (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border text-xs ${
                        isRefOutdated 
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm">{ref.normalized_is}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isRefOutdated ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                        }`}>
                          {ref.discrepancy_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1.5 leading-normal">
                        {ref.discrepancy_details}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                No explicit IS number cited in tender clause. AI evaluated product parameters directly.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 Cols): Primary Recommendation & Explainable AI */}
        <div className="lg:col-span-7 space-y-5">
          {/* Recommended Standard Spotlight */}
          {primary_recommendation ? (
            <div className="bg-white rounded-2xl border-2 border-blue-600/70 shadow-lg overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Recommended Indian Standard</span>
                  </span>
                  <div className="flex items-center gap-1.5 bg-blue-800/80 px-2.5 py-1 rounded-full text-xs font-bold text-blue-100 border border-blue-700">
                    <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                    <span>{confidencePct}% Confidence ({primary_recommendation.confidence_level})</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mt-2 font-mono">
                  {primary_recommendation.is_number}
                </h3>
                <p className="text-xs text-blue-100 font-medium mt-1 leading-relaxed">
                  {primary_recommendation.title}
                </p>
              </div>

              <div className="p-5 space-y-5">
                {/* 5-Point Explainable AI Rationale */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Why this standard? (AI Explainability Breakdown)</span>
                  </h4>
                  <div className="space-y-2">
                    {primary_recommendation.why_recommended_reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why was the existing standard flagged / rejected? */}
                {primary_recommendation.why_rejected_reasons.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Why was the tender reference flagged / updated?</span>
                    </h4>
                    <div className="space-y-1.5 text-xs text-amber-900">
                      {primary_recommendation.why_rejected_reasons.map((rej, i) => (
                        <p key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{rej}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mandatory Quality Control Order (QCO) */}
                {primary_recommendation.mandatory_qco && (
                  <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs">
                    <p className="font-bold text-indigo-950 uppercase text-[11px] mb-0.5">
                      Statutory Quality Control Order (QCO)
                    </p>
                    <p className="text-indigo-900 font-medium leading-relaxed">
                      {primary_recommendation.mandatory_qco}
                    </p>
                  </div>
                )}

                {/* Scope Excerpt */}
                {primary_recommendation.scope_excerpt && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Standard Scope Summary
                    </p>
                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                      "{primary_recommendation.scope_excerpt}"
                    </p>
                  </div>
                )}

                {/* Side by side diff preview link */}
                {diff_comparison && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <button
                      onClick={() => setActiveTab('comparison')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>View Clause-by-Clause Parameter Comparison</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={onOpenDecisionModal}
                      className="text-xs font-bold text-blue-700 hover:underline"
                    >
                      Signoff Recommendation →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-500">
              No matching Indian Standard recommendation found.
            </div>
          )}

          {/* Alternative / Supplementary Standards */}
          {alternative_recommendations.length > 0 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Supplementary / Related Standards</span>
              </h3>
              <div className="space-y-2">
                {alternative_recommendations.map((alt) => (
                  <div key={alt.standard_id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900">{alt.is_number}</span>
                      <span className="text-slate-500 ml-2">{alt.title}</span>
                    </div>
                    <span className="font-bold text-slate-600 shrink-0 ml-2">
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
