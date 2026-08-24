import React from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import type { DocumentAnalysisResult, ActiveTab } from '../types';

interface DocumentComparisonViewProps {
  analysisResult: DocumentAnalysisResult | null;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDecisionModal: () => void;
}

export const DocumentComparisonView: React.FC<DocumentComparisonViewProps> = ({
  analysisResult,
  setActiveTab,
  onOpenDecisionModal
}) => {
  if (!analysisResult || !analysisResult.diff_comparison) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xs animate-fadeIn">
        <GitCompare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Document Comparison Active</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Analyze a tender document or select a realistic scenario from the Dashboard to inspect the side-by-side specification diff.
        </p>
        <button
          onClick={() => setActiveTab('analyze')}
          className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
        >
          Go to Tender Studio
        </button>
      </div>
    );
  }

  const { diff_comparison, document_name, detected_product } = analysisResult;
  const isOutdated = (diff_comparison.revision_gap_years || 0) > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Clause Matrix
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Tender Citation vs Standard Requirement Gap Matrix
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Side-by-side clause evaluation for <strong className="text-slate-900 dark:text-slate-100">{document_name}</strong>.
          </p>
        </div>

        <button
          onClick={onOpenDecisionModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
        >
          <ShieldCheck className="w-4 h-4 text-blue-200" />
          <span>Record Signoff</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Tender Document Reference */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tender Citation
              </span>
              <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                Cited in Document
              </span>
            </div>

            <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {diff_comparison.tender_cited_standard || "No Standard Cited"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Detected Product: <strong className="text-slate-900 dark:text-slate-100">{detected_product}</strong>
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            {isOutdated ? (
              <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Superseded / Outdated Revision Cited</span>
              </span>
            ) : (
              <span className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Valid Current Reference</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Card: Recommended Standard */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Recommended Standard</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-bold">
                Active Edition
              </span>
            </div>

            <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {diff_comparison.recommended_standard}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Mandatory active standard under current Quality Control Orders (QCO).
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Full Compliance with BIS Gazette</span>
          </div>
        </div>
      </div>

      {/* Summary Advice */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 space-y-2">
        <h4 className="font-bold uppercase tracking-wider text-slate-900 dark:text-white">Summary Findings & Advice</h4>
        <p className="leading-relaxed font-semibold text-slate-800 dark:text-slate-200">{diff_comparison.summary_advice}</p>

        {diff_comparison.key_differences.length > 0 && (
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600 dark:text-slate-400">
            {diff_comparison.key_differences.map((diff, idx) => (
              <li key={idx}>{diff}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Parameter Gap Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Parameter Alignment Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3">Technical Parameter</th>
                <th className="px-5 py-3">Tender Requirement</th>
                <th className="px-5 py-3">Recommended Specification</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {diff_comparison.parameter_diffs.map((param, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{param.parameter}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">{param.tender_requirement}</td>
                  <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white">{param.standard_specification}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      param.status === 'MATCH' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                        : (param.status === 'UPGRADE_REQUIRED' ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' : 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800')
                    }`}>
                      {param.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 leading-relaxed">{param.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
