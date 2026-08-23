import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Download, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { AuditLogEntry } from '../types';

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
    link.setAttribute("download", `BIS_Procurement_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Procurement Compliance & Audit History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-evident record of all AI recommendation verifications, officer signoffs, and manual review decisions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search officer, tender ref, or standard..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={decisionFilter}
          onChange={(e) => setDecisionFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-auto"
        >
          <option value="all">All Officer Decisions ({logs.length})</option>
          <option value="ACCEPTED">Accepted / Approved</option>
          <option value="FLAGGED_FOR_REVIEW">Flagged for Committee Review</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Log ID / Timestamp</th>
                <th className="px-5 py-3.5">Procurement Officer</th>
                <th className="px-5 py-3.5">Tender / Product</th>
                <th className="px-5 py-3.5">Cited vs Recommended IS</th>
                <th className="px-5 py-3.5">Decision</th>
                <th className="px-5 py-3.5">Officer Remarks</th>
                <th className="px-5 py-3.5 text-right">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="font-mono text-blue-700 font-bold">{log.log_id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800 flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{log.officer_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{log.officer_role}</div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-slate-800 truncate">{log.document_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.tender_ref || 'Ref: N/A'}</div>
                      <div className="text-[11px] text-slate-600 truncate mt-0.5">{log.detected_product}</div>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">
                      <div className="line-through text-slate-400">{log.cited_standard || 'None'}</div>
                      <div className="font-bold text-blue-700">{log.recommended_standard}</div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.decision === 'ACCEPTED' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : (log.decision === 'FLAGGED_FOR_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')
                      }`}>
                        {log.decision.replace(/_/g, ' ')}
                      </span>
                    </td>

                    <td className="px-5 py-4 max-w-xs text-slate-700 text-[11px]">
                      {log.remarks || <span className="text-slate-400 italic">No additional remarks</span>}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-800 text-right whitespace-nowrap">
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
