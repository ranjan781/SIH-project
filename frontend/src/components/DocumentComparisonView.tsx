import React from 'react';
import { 
  GitCompare, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  Layers,
  Sparkles
} from 'lucide-react';
import { DocumentAnalysisResult, ActiveTab } from '../types';

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
      <div className="max-w-4xl mx-auto py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <GitCompare className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Active Document Comparison</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Please run an analysis on a tender specification to generate a side-by-side standard diff.
        </p>
        <button
          onClick={() => setActiveTab('analyze')}
          className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
        >
          Analyze a Tender
        </button>
      </div>
    );
  }

  const { diff_comparison, document_name, detected_product } = analysisResult;
  const isOutdated = (diff_comparison.revision_gap_years || 0) > 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-blue-600" />
            <span>Side-by-Side Specification & Standard Comparison</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comparing cited tender parameters in <strong className="text-slate-800">{document_name}</strong> against the latest Indian Standard.
          </p>
        </div>

        <button
          onClick={onOpenDecisionModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Accept Recommendation</span>
        </button>
      </div>

      {/* Side-by-Side Visual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Tender Reference */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Tender Document Citation
              </span>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                Raw Input
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold font-mono text-slate-800">
                {diff_comparison.tender_cited_standard || "No Standard Specified"}
              </h4>
              <p className="text-xs text-slate-600">
                Product: <strong className="text-slate-800">{detected_product}</strong>
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Status: {isOutdated ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Outdated / Superseded Revision Cited</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standard Citation Verified</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: AI Recommendation */}
        <div className="bg-white rounded-2xl p-5 border-2 border-blue-600 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Recommended Indian Standard</span>
              </span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Current Active Standard
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold font-mono text-blue-900">
                {diff_comparison.recommended_standard}
              </h4>
              <p className="text-xs text-blue-800 font-medium">
                Mandatory active standard for public procurement under BIS QCO.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Full Compliance with Latest Amendments</span>
          </div>
        </div>
      </div>

      {/* Difference Summary Alert */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950">
        <h4 className="font-bold text-xs uppercase tracking-wider mb-1">Summary Advice & Technical Delta</h4>
        <p className="leading-relaxed font-medium">{diff_comparison.summary_advice}</p>

        {diff_comparison.key_differences.length > 0 && (
          <ul className="mt-2 space-y-1 list-disc list-inside text-blue-900">
            {diff_comparison.key_differences.map((diff, idx) => (
              <li key={idx}>{diff}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Parameter-by-Parameter Alignment Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Parameter Alignment & Gap Analysis Matrix
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-500 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Technical Parameter</th>
                <th className="px-5 py-3">Tender Document Value</th>
                <th className="px-5 py-3">Recommended IS Standard Value</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Analysis & Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {diff_comparison.parameter_diffs.map((param, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-bold text-slate-800">{param.parameter}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">{param.tender_requirement}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-blue-700">{param.standard_specification}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      param.status === 'MATCH' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : (param.status === 'UPGRADE_REQUIRED' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                    }`}>
                      {param.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 text-[11px]">{param.explanation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision CTA */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <h4 className="text-sm font-bold">Ready to sign off on this standard?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Record human-in-the-loop verification or generate official compliance documentation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('recommendation')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
          >
            Back to Recommendation
          </button>
          <button
            onClick={onOpenDecisionModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-md"
          >
            Officer Signoff
          </button>
        </div>
      </div>
    </div>
  );
};
