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
  Info,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight
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
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      label: 'Verified • Valid & Current Standard'
    },
    OUTDATED_REFERENCE: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200',
      badgeBg: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />,
      label: 'Review Required • Superseded Revision Cited'
    },
    REVIEW_REQUIRED: {
      bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
      icon: <Info className="w-6 h-6 text-slate-600 dark:text-slate-400 shrink-0" />,
      label: 'Standard Alignment Advisory'
    },
    MISMATCH_DETECTED: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200',
      badgeBg: 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-700',
      icon: <XCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />,
      label: 'Critical • Non-Compliant Specification'
    }
  }[overall_status] || {
    bg: 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    icon: <Info className="w-6 h-6 text-slate-600 dark:text-slate-400 shrink-0" />,
    label: overall_status
  };

  const confidencePct = Math.round(overall_confidence * 100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      
      {/* Executive Status Header */}
      <div className={`rounded-[14px] p-7 sm:p-[30px] border border-[#E1E4E8] shadow-xs ${statusConfig.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="mt-1">{statusConfig.icon}</div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${statusConfig.badgeBg}`}>
                  {statusConfig.label}
                </span>
                <span className="text-xs text-[#536586] font-mono">
                  Analysis ID: {analysisResult.analysis_id}
                </span>
              </div>
              <h1 className="page-title text-[#182036] dark:text-white mt-1">
                {summary_verdict}
              </h1>
              <p className="body-text text-sm text-[#536586] dark:text-slate-400 mt-1">
                Document: <strong className="text-[#182036] dark:text-slate-100">{document_name}</strong>
                {tender_ref && <> • Ref: <span className="font-mono text-[#536586] dark:text-slate-300">{tender_ref}</span></>}
                {issuing_authority && <> • Authority: <span className="text-[#536586] dark:text-slate-300">{issuing_authority}</span></>}
              </p>
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Export Audit Report</span>
            </button>
            <button
              onClick={onOpenDecisionModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Officer Signoff</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Standards Match Summary Table ─────────────────────────────────── */}
      {referenced_standards.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E1E4E8] dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-7 py-5 border-b border-[#E1E4E8] dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-[17px] font-bold text-[#182036] dark:text-white">Standards Match Summary</h2>
              <p className="text-sm text-[#536586] dark:text-slate-400 mt-0.5">
                All Indian Standards detected in tender document — verified against active BIS catalog
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#E1E4E8] dark:border-slate-700 font-mono">
              {referenced_standards.length} Standard{referenced_standards.length !== 1 ? 's' : ''} Detected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-[#E1E4E8] dark:border-slate-700">
                  {['Tender Requirement', 'Detected IS', 'Recommended Standard', 'Version / Revision', 'Confidence'].map((h, i) => (
                    <th key={h} className={`py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-[#536586] dark:text-slate-400 whitespace-nowrap ${i === 4 ? 'text-center' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E1E4E8] dark:divide-slate-800">
                {referenced_standards.map((ref, idx) => {
                  const isOutdated = ref.discrepancy_type === 'OUTDATED_REVISION' || ref.discrepancy_type === 'WITHDRAWN_STANDARD';
                  const isValid = ref.discrepancy_type === 'VALID_CURRENT';

                  // Extract recommended standard:
                  // For valid refs → the cited IS itself is the active one
                  // For row 0 outdated → use primary recommendation
                  // For other rows → try to extract from discrepancy_details (e.g. "superseded by IS 383:2016")
                  let recStd = ref.normalized_is;
                  if (isValid) {
                    // Try to extract versioned IS from details: "Valid Reference: IS 456:2000 is the active..."
                    const validMatch = ref.discrepancy_details.match(/(IS[\s\d:\(\)\/]+:\d{4})/);
                    recStd = validMatch ? validMatch[1].trim() : ref.normalized_is;
                  } else if (idx === 0 && primary_recommendation) {
                    recStd = primary_recommendation.is_number;
                  } else {
                    // Try to parse the active standard from discrepancy_details
                    const detailMatch = ref.discrepancy_details.match(/superseded by (IS[\s\d:\(\)\/]+(?::\d{4})?)/i)
                      || ref.discrepancy_details.match(/upgraded to unified code (IS[\s\d:\(\)\/]+(?::\d{4})?)/i)
                      || ref.discrepancy_details.match(/active.*?(IS[\s\d:\(\)\/]+:\d{4})/i);
                    if (detailMatch) {
                      recStd = detailMatch[1].trim();
                    }
                  }

                  const yearMatch = recStd.match(/:(\d{4})/);
                  const revYear = yearMatch ? yearMatch[1] : '—';

                  // Product label: first row uses detected_product, others use title from details
                  const requirementLabel = idx === 0 && detected_product
                    ? detected_product
                    : (() => {
                        const base = ref.normalized_is.split(':')[0].trim();
                        // Map common IS bases to friendly names
                        const MAP: Record<string, string> = {
                          'IS 456': 'Plain & Reinforced Concrete',
                          'IS 383': 'Fine & Coarse Aggregates',
                          'IS 2062': 'Structural Steel',
                          'IS 732': 'Electrical Wiring',
                          'IS 1293': 'Plugs & Socket-Outlets',
                          'IS 516': 'Concrete Testing',
                          'IS 1786': 'TMT Steel Rebars',
                          'IS 8112': 'OPC 43 Cement',
                          'IS 12269': 'OPC 53 Cement',
                          'IS 4984': 'HDPE Pipes',
                          'IS 694': 'PVC Cables',
                          'IS 15683': 'Fire Extinguishers',
                          'IS 3043': 'Earthing System',
                        };
                        return MAP[base] || base;
                      })();

                  const confScore = idx === 0 && primary_recommendation
                    ? primary_recommendation.confidence_score
                    : (isValid ? 0.92 : 0.87);

                  const confLabel = confScore >= 0.85 ? 'High' : confScore >= 0.70 ? 'Medium' : 'Review';

                  const confStyle = confLabel === 'High'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : confLabel === 'Medium'
                      ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-5 text-sm font-semibold text-[#182036] dark:text-white max-w-[200px]">
                        {requirementLabel}
                      </td>
                      <td className="py-4 px-5 font-mono text-sm text-[#536586] dark:text-slate-400 whitespace-nowrap">
                        {ref.normalized_is}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className={`font-mono font-bold text-sm ${isOutdated ? 'text-amber-700 dark:text-amber-400' : 'text-[#182036] dark:text-white'}`}>
                          {recStd}
                        </span>
                        {isOutdated && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            UPGRADED
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-sm text-[#182036] dark:text-slate-200">
                        {revYear}
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${confStyle}`}>
                          {confLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main Grid: Recommended Standard & Extracted Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recommended Standard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {primary_recommendation ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>Recommended Indian Standard (IS)</span>
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded text-xs font-mono font-semibold">
                    {confidencePct}% Match
                  </span>
                </div>

                <h2 className="text-2xl font-bold font-mono text-white mt-2">
                  {primary_recommendation.is_number}
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {primary_recommendation.title}
                </p>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs">
                {/* 5-Point Evidence Rationale */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span>Evidence Rationale & Verification Breakdown</span>
                  </h3>
                  <div className="space-y-2">
                    {primary_recommendation.why_recommended_reasons.map((reason, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-400 shrink-0 mt-0.5">
                          0{i + 1}.
                        </span>
                        <span className="leading-relaxed font-medium">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>


                {/* Superseded Rejection Warning */}
                {primary_recommendation.why_rejected_reasons.length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                    <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Why standard cited in tender was flagged</span>
                    </h3>
                    <div className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
                      {primary_recommendation.why_rejected_reasons.map((rej, i) => (
                        <p key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{rej}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Control Order Callout */}
                {primary_recommendation.mandatory_qco && (
                  <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
                    <span className="font-bold text-blue-900 dark:text-blue-200 uppercase text-[10px] tracking-wider block mb-1">
                      Statutory Quality Control Order (QCO) Mandate
                    </span>
                    <p className="text-blue-800 dark:text-blue-300 font-semibold leading-relaxed">
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
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed italic">
                      "{primary_recommendation.scope_excerpt}"
                    </p>
                  </div>
                )}

                {/* Action Row */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>View Clause-by-Clause Diff Matrix</span>
                  </button>

                  <button
                    onClick={onOpenDecisionModal}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Record Officer Decision</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center text-slate-500">
              No matching Indian Standard recommendation found.
            </div>
          )}

          {/* Supplementary Standards */}
          {alternative_recommendations.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Supplementary Standards in Category</span>
              </h3>
              <div className="space-y-2">
                {alternative_recommendations.map((alt) => (
                  <div key={alt.standard_id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{alt.is_number}</span>
                      <span className="text-slate-600 dark:text-slate-400 ml-2">{alt.title}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0 ml-3">
                      {Math.round(alt.confidence_score * 100)}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Extracted Specifications (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Extracted Tender Specifications</span>
              </h3>
              <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                NLP Output
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identified Product</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{detected_product}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sector Category</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{detected_category}</p>
              </div>

              {extracted_specifications.grade && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Technical Grade</span>
                  <p className="font-mono font-bold text-slate-900 dark:text-white mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs inline-block">
                    {extracted_specifications.grade}
                  </p>
                </div>
              )}

              {extracted_specifications.material && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Material Specs</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">{extracted_specifications.material}</p>
                </div>
              )}

              {extracted_specifications.dimensions && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dimensions & Physical Limits</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                    {extracted_specifications.dimensions}
                  </p>
                </div>
              )}

              {extracted_specifications.testing_requirements.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required Test Protocols</span>
                  <ul className="mt-1.5 space-y-1">
                    {extracted_specifications.testing_requirements.map((test, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                        <span>{test}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Referenced Standards Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Referenced IS Codes in Document
            </h3>

            {referenced_standards.length > 0 ? (
              <div className="space-y-2.5">
                {referenced_standards.map((ref, idx) => {
                  const isRefOutdated = ref.discrepancy_type === 'OUTDATED_REVISION' || ref.discrepancy_type === 'WITHDRAWN_STANDARD';
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs ${
                        isRefOutdated 
                          ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200' 
                          : 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs">{ref.normalized_is}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isRefOutdated ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-300' : 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-300'
                        }`}>
                          {ref.discrepancy_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {ref.discrepancy_details}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 text-center">
                No explicit IS standard number referenced in tender clauses.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
