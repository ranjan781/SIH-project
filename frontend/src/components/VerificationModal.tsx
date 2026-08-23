import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  UserCheck, 
  FileText,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DocumentAnalysisResult, AuditLogEntry } from '../types';
import { ApiService } from '../services/api';

interface VerificationModalProps {
  analysisResult: DocumentAnalysisResult;
  onClose: () => void;
  onDecisionRecorded: (entry: AuditLogEntry) => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  analysisResult,
  onClose,
  onDecisionRecorded
}) => {
  const [officerName, setOfficerName] = useState<string>('Er. Sachin Gupta');
  const [officerRole, setOfficerRole] = useState<string>('Chief Procurement Verification Officer');
  const [decision, setDecision] = useState<'ACCEPTED' | 'FLAGGED_FOR_REVIEW' | 'REJECTED'>('ACCEPTED');
  const [remarks, setRemarks] = useState<string>(
    `Verified technical parameters for ${analysisResult.detected_product}. Upgraded specification to ${analysisResult.primary_recommendation?.is_number} under mandatory BIS QCO compliance.`
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim()) return;

    setIsSubmitting(true);
    try {
      const entry = await ApiService.recordOfficerDecision({
        analysis_id: analysisResult.analysis_id,
        standard_id: analysisResult.primary_recommendation?.is_number || "IS-RECOMMENDED",
        decision: decision,
        officer_name: officerName,
        officer_role: officerRole,
        remarks: remarks
      });

      if (decision === 'ACCEPTED') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setIsSubmitting(false);
      onDecisionRecorded(entry);
      onClose();
    } catch {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/30 border border-blue-400/30">
              <ShieldCheck className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Human-in-the-Loop Officer Verification</h3>
              <p className="text-[11px] text-blue-200">Problem Statement: SIH26108 Compliance Signoff</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Standard Summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Recommendation to Sign Off</p>
            <p className="font-mono font-bold text-sm text-blue-900 mt-0.5">
              {analysisResult.primary_recommendation?.is_number}
            </p>
            <p className="text-[11px] text-slate-600 truncate">{analysisResult.detected_product}</p>
          </div>

          {/* Decision Selection */}
          <div>
            <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1.5">
              Officer Decision / Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDecision('ACCEPTED')}
                className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                  decision === 'ACCEPTED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Accept & Approve</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('FLAGGED_FOR_REVIEW')}
                className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                  decision === 'FLAGGED_FOR_REVIEW'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Committee Review</span>
              </button>

              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                  decision === 'REJECTED'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject Standard</span>
              </button>
            </div>
          </div>

          {/* Officer Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Officer Name
              </label>
              <input
                type="text"
                required
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
                Designation / Role
              </label>
              <input
                type="text"
                required
                value={officerRole}
                onChange={(e) => setOfficerRole(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">
              Statutory Verification Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow-md shadow-blue-700/20"
            >
              {isSubmitting ? "Recording Signoff..." : "Confirm & Record Signoff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
