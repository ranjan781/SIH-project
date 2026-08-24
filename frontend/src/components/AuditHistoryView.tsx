import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import type { AuditLogEntry } from '../types';

interface AuditHistoryViewProps {
  logs: AuditLogEntry[];
}

export const AuditHistoryView: React.FC<AuditHistoryViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchDec = decisionFilter === 'all' || l.decision.toLowerCase() === decisionFilter.toLowerCase();
      const q = searchTerm.toLowerCase().trim();
      const matchQuery = !q || (
        l.officer_name.toLowerCase().includes(q) ||
        l.document_name.toLowerCase().includes(q) ||
        (l.tender_ref && l.tender_ref.toLowerCase().includes(q)) ||
        l.detected_product.toLowerCase().includes(q) ||
        l.recommended_standard.toLowerCase().includes(q)
      );
      return matchDec && matchQuery;
    });
  }, [logs, decisionFilter, searchTerm]);

  const handleExportCSV = () => {
    const headers = ["Log ID", "Timestamp", "Officer Name", "Role", "Document Name", "Tender Ref", "Product", "Cited Standard", "Recommended Standard", "Decision", "Remarks", "Confidence"];
    const rows = filteredLogs.map(l => [
      l.log_id,
      l.timestamp,
      `"${l.officer_name}"`,
      `"${l.officer_role}"`,
      `"${l.document_name}"`,
      `"${l.tender_ref || ''}"`,
      `"${l.detected_product}"`,
      `"${l.cited_standard || ''}"`,
      `"${l.recommended_standard}"`,
      l.decision,
      `"${l.remarks || ''}"`,
      l.confidence_score
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Procurement_Standards_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Audit Ledger
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Procurement Compliance Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Record of all procurement officer signoffs, AI standard recommendations, and committee review decisions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-xs transition-colors shrink-0"
        >
          <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search officer name, tender ref, or standard..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-600 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Officer Decisions ({logs.length})</option>
          <option value="ACCEPTED">Accepted / Approved</option>
          <option value="FLAGGED_FOR_REVIEW">Flagged for Committee Review</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200 dark:border-slate-700 text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3">Log ID / Timestamp</th>
                <th className="px-5 py-3">Verification Officer</th>
                <th className="px-5 py-3">Tender / Product</th>
                <th className="px-5 py-3">Cited vs Recommended IS</th>
                <th className="px-5 py-3">Officer Action</th>
                <th className="px-5 py-3">Remarks</th>
                <th className="px-5 py-3 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-mono text-slate-900 dark:text-slate-100 font-bold text-xs">{log.log_id}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{log.officer_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{log.officer_role}</div>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{log.document_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.tender_ref || 'Ref: N/A'}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">{log.detected_product}</div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-xs whitespace-nowrap">
                      <div className="line-through text-slate-400">{log.cited_standard || 'None'}</div>
                      <div className="font-bold text-slate-900 dark:text-white">{log.recommended_standard}</div>
                    </td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.decision === 'ACCEPTED' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                          : (log.decision === 'FLAGGED_FOR_REVIEW' ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800' : 'bg-rose-50 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800')
                      }`}>
                        {log.decision.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      {log.remarks || <span className="text-slate-400 italic">No remarks recorded</span>}
                    </td>

                    <td className="px-5 py-3.5 font-mono font-bold text-slate-900 dark:text-white text-right whitespace-nowrap">
                      {Math.round(log.confidence_score * 100)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No compliance audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
