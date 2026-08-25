import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { DocumentAnalysisResult, AuditLogEntry, OfficerProfile } from '../types';
import { ApiService } from '../services/api';

interface VerificationModalProps {
  analysisResult: DocumentAnalysisResult;
  onClose: () => void;
  onDecisionRecorded: (entry: AuditLogEntry) => void;
  officerProfile: OfficerProfile;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  analysisResult,
  onClose,
  onDecisionRecorded,
  officerProfile
}) => {
  const targetStandard = analysisResult.primary_recommendation?.is_number
    || analysisResult.referenced_standards[0]?.normalized_is
    || "IS-RECOMMENDED";

  const [officerName, setOfficerName] = useState<string>(officerProfile.name);
  const [officerRole, setOfficerRole] = useState<string>(officerProfile.role);
  const [decision, setDecision] = useState<'ACCEPTED' | 'FLAGGED_FOR_REVIEW' | 'REJECTED'>('ACCEPTED');
  const [remarks, setRemarks] = useState<string>(
    `Verified technical specifications for ${analysisResult.detected_product}. Compliance determination (${decision}) recorded for ${targetStandard} under statutory BIS guidelines.`
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim()) return;

    setIsSubmitting(true);
    try {
      const entry = await ApiService.recordOfficerDecision({
        analysis_id: analysisResult.analysis_id,
        standard_id: targetStandard,
        decision: decision,
        officer_name: officerName,
        officer_role: officerRole,
        remarks: remarks
      });

      // Ensure fields match current analysis
      entry.document_name = analysisResult.document_name;
      entry.tender_ref = analysisResult.tender_ref || "TENDER/REC/VERIFIED";
      entry.detected_product = analysisResult.detected_product;
      entry.recommended_standard = targetStandard;

      try {
        if (decision === 'ACCEPTED' && typeof confetti === 'function') {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (e) {
        // Confetti optional
      }

      setIsSubmitting(false);
      onDecisionRecorded(entry);
      onClose();
    } catch (err) {
      console.error("Failed to record officer decision", err);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Verification Signoff Protocol</h3>
              <p className="text-[11px] text-slate-400">Statutory Procurement Compliance Record</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Standard Summary */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Target Standard</span>
            <p className="font-mono font-bold text-sm text-slate-900 dark:text-white">
              {targetStandard}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-0.5">{analysisResult.detected_product}</p>
          </div>

          {/* Action Choice */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider mb-1.5">
              Officer Action / Determination
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('ACCEPTED')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  decision === 'ACCEPTED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Accept & Sign</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('FLAGGED_FOR_REVIEW')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  decision === 'FLAGGED_FOR_REVIEW'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Committee Review</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                  decision === 'REJECTED'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300 ring-2 ring-rose-500/30'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Officer Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                Officer Name
              </label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider mb-1">
                Designation / Authority
              </label>
              <input
                type="text"
                required
                value={officerRole}
                onChange={(e) => setOfficerRole(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase text-[10px] tracking-wider mb-1">
              Statutory Verification Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              {isSubmitting ? "Recording..." : "Record Signoff in Audit Trail"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
