import React from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  Layers,
  ArrowRight
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
      <div className="max-w-xl mx-auto my-16 bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs animate-page-enter">
        <GitCompare className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800">No Document Comparison Active</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Analyze a tender document or select a realistic scenario to inspect the side-by-side specification diff.
        </p>
        <button
          onClick={() => setActiveTab('analyze')}
          className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
        >
          Go to Tender Studio
        </button>
      </div>
    );
  }

  const { diff_comparison, document_name, detected_product } = analysisResult;
  const isOutdated = (diff_comparison.revision_gap_years || 0) > 0;

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-16 animate-page-enter">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              Compliance Tool
            </span>
            <span className="text-xs text-slate-400">Clause Gap Analysis</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Tender Citation vs Standard Requirement Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluating specifications from <strong className="text-slate-700 font-semibold">{document_name}</strong> against the latest BIS criteria.
          </p>
        </div>

        <button
          onClick={onOpenDecisionModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>Signoff Decision</span>
        </button>
      </div>

      {/* Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Tender Document Reference */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tender Citation
              </span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                Input Clause
              </span>
            </div>

            <h3 className="text-base font-bold font-mono text-slate-900">
              {diff_comparison.tender_cited_standard || "No Standard Number Cited"}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Detected Product: <strong className="text-slate-800">{detected_product}</strong>
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 text-xs">
            {isOutdated ? (
              <span className="text-amber-800 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Superseded / Outdated Revision Cited</span>
              </span>
            ) : (
              <span className="text-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Valid Current Reference</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Card: Recommended Indian Standard */}
        <div className="bg-white rounded-xl p-5 border border-slate-300 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-600" />
                <span>Recommended Standard</span>
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                Active BIS Edition
              </span>
            </div>

            <h3 className="text-base font-bold font-mono text-slate-900">
              {diff_comparison.recommended_standard}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Mandatory active standard under current Quality Control Orders (QCO).
            </p>
          </div>

          <div className="mt-4 pt-2.5 border-t border-slate-100 text-xs text-emerald-800 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Full Compliance with Statutory Gazette Notifications</span>
          </div>
        </div>
      </div>

      {/* Summary Advice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
        <h4 className="font-bold text-[11px] uppercase tracking-wider mb-1 text-slate-900">Summary Findings & Gap Analysis</h4>
        <p className="leading-relaxed font-medium text-slate-700">{diff_comparison.summary_advice}</p>

        {diff_comparison.key_differences.length > 0 && (
          <ul className="mt-2 space-y-1 list-disc list-inside text-slate-600">
            {diff_comparison.key_differences.map((diff, idx) => (
              <li key={idx}>{diff}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Parameter Gap Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Parameter Alignment & Gap Analysis Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Technical Parameter</th>
                <th className="px-4 py-2.5">Tender Document Requirement</th>
                <th className="px-4 py-2.5">Recommended IS Specification</th>
                <th className="px-4 py-2.5">Alignment Status</th>
                <th className="px-4 py-2.5">Technical Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diff_comparison.parameter_diffs.map((param, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-800">{param.parameter}</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{param.tender_requirement}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">{param.standard_specification}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      param.status === 'MATCH' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : (param.status === 'UPGRADE_REQUIRED' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-rose-50 text-rose-800 border-rose-200')
                    }`}>
                      {param.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-[11px] leading-relaxed">{param.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
