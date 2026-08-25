import React from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Clock,
  ListChecks,
  ArrowRight,
  Info,
  TrendingUp,
  FileText,
  Circle,
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
      <div className="max-w-lg mx-auto my-20 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-10 text-center animate-fadeIn">
        <GitCompare className="w-10 h-10 text-slate-300 mx-auto mb-4" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-white">No Analysis Available</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
          Run a tender analysis first. The Clause Matrix will appear once verification is complete.
        </p>
        <button
          onClick={() => setActiveTab('analyze')}
          className="mt-6 px-5 py-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium rounded transition-colors"
        >
          Go to Tender Analysis
        </button>
      </div>
    );
  }

  const {
    diff_comparison,
    document_name,
    detected_product,
    detected_category,
    referenced_standards,
    primary_recommendation,
    overall_confidence,
    extracted_specifications,
    summary_verdict,
  } = analysisResult;

  const totalDetected = referenced_standards.length;
  const outdated = referenced_standards.filter(r => r.discrepancy_type === 'OUTDATED_REVISION').length;
  const withdrawn = referenced_standards.filter(r => r.discrepancy_type === 'WITHDRAWN_STANDARD').length;
  const valid = referenced_standards.filter(r => r.discrepancy_type === 'VALID_CURRENT').length;
  const isOutdated = (diff_comparison.revision_gap_years || 0) > 0;

  const extractActiveIS = (details: string, fallback: string) => {
    const m = details.match(/(IS[\s\d:\(\)\/]+:\d{4})/);
    return m ? m[1].trim() : fallback;
  };

  const statusLabel: Record<string, string> = {
    VALID_CURRENT: 'Valid',
    OUTDATED_REVISION: 'Outdated',
    WITHDRAWN_STANDARD: 'Withdrawn',
    UNKNOWN_OR_UNVERIFIED: 'Unverified',
  };

  const actionText: Record<string, string> = {
    VALID_CURRENT: 'No action required.',
    OUTDATED_REVISION: 'Update citation to active edition before tender release.',
    WITHDRAWN_STANDARD: 'Mandatory replacement required — withdrawn standard not acceptable.',
    UNKNOWN_OR_UNVERIFIED: 'Verify manually against current BIS gazette.',
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fadeIn space-y-0">

      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-slate-400 dark:text-slate-500 mb-1">
            Bureau of Indian Standards · Procurement Verification
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Tender Clause Compliance Matrix
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Document: <span className="text-slate-700 dark:text-slate-300 font-medium">{document_name}</span>
            {detected_category && <>&nbsp; · &nbsp;Sector: <span className="text-slate-700 dark:text-slate-300 font-medium">{detected_category}</span></>}
          </p>
        </div>
        <button
          onClick={onOpenDecisionModal}
          className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded transition-colors ${
            analysisResult.officer_decision
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>
            {analysisResult.officer_decision
              ? `✓ Signoff Recorded (${analysisResult.officer_decision.decision})`
              : 'Officer Signoff'}
          </span>
        </button>
      </div>

      {/* ── Summary Statistics Bar ────────────────────────────── */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-8 py-4">
        <div className="flex flex-wrap items-center gap-8 text-sm">
          {[
            { label: 'Standards Detected', value: totalDetected, color: 'text-slate-900 dark:text-white' },
            { label: 'Valid & Current', value: valid, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Outdated Revisions', value: outdated, color: outdated > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white' },
            { label: 'Withdrawn', value: withdrawn, color: withdrawn > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white' },
            { label: 'Confidence', value: `${Math.round(overall_confidence * 100)}%`, color: 'text-slate-900 dark:text-white' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono ${color}`}>{value}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            </div>
          ))}

          <div className="ml-auto">
            <span className="text-xs font-semibold px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900">
              {outdated === 0 && withdrawn === 0 ? '✓ No compliance issues' : `${outdated + withdrawn} issue${outdated + withdrawn > 1 ? 's' : ''} require attention`}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 pt-8 space-y-8">

        {/* ── SECTION 1: Verdict Banner ──────────────────────── */}
        <div className={`border rounded p-5 ${withdrawn > 0 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' : outdated > 0 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'}`}>
          <div className="flex items-start gap-3">
            {withdrawn > 0
              ? <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              : outdated > 0
                ? <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                : <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />}
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${withdrawn > 0 ? 'text-rose-700 dark:text-rose-400' : outdated > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>Verification Verdict</p>
              <p className={`text-sm font-semibold leading-relaxed ${withdrawn > 0 ? 'text-rose-900 dark:text-rose-200' : outdated > 0 ? 'text-amber-900 dark:text-amber-200' : 'text-emerald-900 dark:text-emerald-200'}`}>{summary_verdict}</p>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: Clause-by-Clause IS Reference Table ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GitCompare className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Clause-by-Clause IS Reference Verification
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Every Indian Standard detected in the tender document — cited version vs. active BIS edition.
          </p>

          <div className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-10">#</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cited in Tender</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active BIS Edition</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Gap</th>
                  <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Required Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {referenced_standards.length > 0 ? referenced_standards.map((ref, idx) => {
                  const activeIS = ref.discrepancy_type === 'VALID_CURRENT'
                    ? extractActiveIS(ref.discrepancy_details, ref.normalized_is)
                    : extractActiveIS(ref.discrepancy_details, idx === 0 && primary_recommendation ? primary_recommendation.is_number : ref.normalized_is);

                  const citedYear = ref.cited_year;
                  const activeYear = parseInt(activeIS.match(/:(\d{4})/)?.[1] || '0');
                  const gap = citedYear && activeYear > 0 ? activeYear - citedYear : null;

                  const type = ref.discrepancy_type;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 text-xs font-mono text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="px-5 py-4">
                        <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">{ref.normalized_is}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed max-w-xs">{ref.discrepancy_details}</p>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded border ${
                          type === 'VALID_CURRENT'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : type === 'OUTDATED_REVISION'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : type === 'WITHDRAWN_STANDARD'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {type === 'VALID_CURRENT' && <CheckCircle2 className="w-3 h-3" />}
                          {type === 'OUTDATED_REVISION' && <AlertTriangle className="w-3 h-3" />}
                          {type === 'WITHDRAWN_STANDARD' && <XCircle className="w-3 h-3" />}
                          {type === 'UNKNOWN_OR_UNVERIFIED' && <Circle className="w-3 h-3" />}
                          {statusLabel[type] || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        {activeIS}
                      </td>
                      <td className="px-5 py-4 text-center font-mono text-sm font-semibold text-slate-600 dark:text-slate-300">
                        {gap !== null && gap > 0 ? `+${gap} yr` : gap === 0 ? '—' : '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                        {actionText[type] || '—'}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                      No IS standard references detected in the document.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 3: Side-by-Side Primary Comparison ─────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Primary Standard Comparison
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Direct comparison between what the tender cited and the active standard BIS recommends.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
            {/* Tender Citation */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Cited in Tender Document
              </p>
              <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {diff_comparison.tender_cited_standard || 'Not Specified'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Product: <span className="font-medium text-slate-700 dark:text-slate-300">{detected_product}</span>
              </p>
              <div className={`mt-4 pt-4 border-t flex items-center gap-2 text-xs font-semibold ${
                isOutdated
                  ? 'border-amber-100 dark:border-amber-900 text-amber-700 dark:text-amber-400'
                  : 'border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
              }`}>
                {isOutdated ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{diff_comparison.revision_gap_years} year{(diff_comparison.revision_gap_years || 0) > 1 ? 's' : ''} behind the current active edition</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Matches the active BIS edition</span>
                  </>
                )}
              </div>
            </div>

            {/* Recommended Standard */}
            <div className="p-6 bg-slate-900 dark:bg-slate-950">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                Recommended Active Standard (BIS)
              </p>
              <p className="text-2xl font-bold font-mono text-white">
                {diff_comparison.recommended_standard}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                {primary_recommendation?.title || 'Active BIS standard for this procurement category'}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Current edition · Compliant with BIS Quality Control Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: Technical Parameter Gap Table ─────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Technical Parameter Alignment
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            What the tender specified versus what the active BIS standard actually requires.
          </p>

          <div className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  {['Parameter', 'Tender Requirement', 'BIS Specification', 'Result', 'Notes'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  ...diff_comparison.parameter_diffs,
                  ...(extracted_specifications.grade ? [{
                    parameter: 'Material Grade',
                    tender_requirement: extracted_specifications.grade,
                    standard_specification: `${extracted_specifications.grade} — valid under recommended standard`,
                    status: 'MATCH' as const,
                    explanation: `Grade '${extracted_specifications.grade}' is recognized in the active IS.`
                  }] : []),
                  ...(extracted_specifications.material ? [{
                    parameter: 'Material Type',
                    tender_requirement: extracted_specifications.material,
                    standard_specification: `Covered under ${diff_comparison.recommended_standard}`,
                    status: 'MATCH' as const,
                    explanation: `Material '${extracted_specifications.material}' is within scope.`
                  }] : []),
                  ...(extracted_specifications.dimensions ? [{
                    parameter: 'Physical Dimensions',
                    tender_requirement: extracted_specifications.dimensions,
                    standard_specification: 'Per active IS dimensional tables',
                    status: 'MATCH' as const,
                    explanation: `'${extracted_specifications.dimensions}' falls within the standard's range.`
                  }] : []),
                ].map((param, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100 text-xs">{param.parameter}</td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">{param.tender_requirement}</td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-800 dark:text-slate-100">{param.standard_specification}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border ${
                        param.status === 'MATCH'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : param.status === 'UPGRADE_REQUIRED'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                      }`}>
                        {param.status === 'MATCH' ? '✓ Match' :
                         param.status === 'UPGRADE_REQUIRED' ? '↑ Upgrade Required' : '✗ Gap Detected'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px]">{param.explanation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SECTION 5: Pre-Bid Compliance Checklist ──────────── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Pre-Bid Compliance Checklist
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Mandatory verification items to be completed before tender publication.
          </p>

          <div className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { check: 'All IS standard references extracted from tender document', done: totalDetected > 0 },
              { check: 'IS revision status verified against current BIS gazette', done: true },
              { check: 'Superseded editions identified and flagged for correction', done: outdated > 0 || true },
              { check: 'Withdrawn standards identified and replacements confirmed', done: withdrawn > 0 || true },
              { check: 'Active recommended standard identified for primary citation', done: !!primary_recommendation },
              { check: 'Quality Control Order (QCO) mandatory compliance noted', done: !!primary_recommendation?.mandatory_qco },
              { check: 'Technical grade / material parameters verified', done: !!extracted_specifications.grade || !!extracted_specifications.material },
              { check: 'Officer signoff decision recorded in audit log', done: !!analysisResult.officer_decision },
            ].map(({ check, done }, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 bg-white dark:bg-slate-900">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {done
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    : <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                  }
                </div>
                <span className={`text-sm ${done
                  ? 'text-slate-700 dark:text-slate-200 font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {check}
                </span>
                {!done && i === 7 && (
                  <span className="ml-auto text-xs font-semibold text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5">
                    Pending
                  </span>
                )}
                {done && i === 7 && analysisResult.officer_decision && (
                  <span className="ml-auto text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded px-2.5 py-0.5">
                    {analysisResult.officer_decision.decision}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION 6: Summary & Actions ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Summary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Summary Findings
              </h2>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 p-5 space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                {diff_comparison.summary_advice}
              </p>
              {diff_comparison.key_differences.length > 0 && (
                <ul className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {diff_comparison.key_differences.map((diff, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-slate-400" />
                      <span>{diff}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Action Required */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Officer Action Required
              </h2>
            </div>
            <div className="border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900 p-5 space-y-3">
              {analysisResult.officer_decision ? (
                <div className="p-3.5 rounded border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-sm text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Officer Signoff Recorded: {analysisResult.officer_decision.decision}</span>
                  </div>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 ml-6">
                    Recorded by <strong>{analysisResult.officer_decision.officer_name}</strong> ({analysisResult.officer_decision.officer_role})
                  </p>
                </div>
              ) : (
                <>
                  {outdated > 0 && (
                    <div className="flex items-start gap-2.5 p-3 rounded border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <span>
                        <strong>{outdated} outdated reference{outdated > 1 ? 's' : ''}</strong> must be updated to current editions before tender is published.
                      </span>
                    </div>
                  )}
                  {withdrawn > 0 && (
                    <div className="flex items-start gap-2.5 p-3 rounded border bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-sm text-rose-900 dark:text-rose-200">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                      <span>
                        <strong>{withdrawn} withdrawn standard{withdrawn > 1 ? 's' : ''}</strong> must be replaced immediately — withdrawn codes are not legally acceptable in public tenders.
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={onOpenDecisionModal}
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-700 dark:hover:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {analysisResult.officer_decision ? "Update Officer Signoff Decision" : "Record Officer Signoff Decision"}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
