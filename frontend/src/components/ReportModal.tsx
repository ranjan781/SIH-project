import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Building, 
  Calendar, 
  Award,
  FileText
} from 'lucide-react';
import { DocumentAnalysisResult } from '../types';

interface ReportModalProps {
  analysisResult: DocumentAnalysisResult;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ analysisResult, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const {
    analysis_id,
    timestamp,
    document_name,
    tender_ref,
    issuing_authority,
    detected_product,
    detected_category,
    extracted_specifications,
    referenced_standards,
    primary_recommendation,
    overall_status,
    overall_confidence
  } = analysisResult;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-fadeIn">
        {/* Actions Bar (hidden on print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Procurement Standards Compliance Audit Certificate</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="p-8 sm:p-12 space-y-6 text-slate-900 text-xs bg-white">
          {/* Certificate Header with Emblem Look */}
          <div className="text-center border-b-2 border-slate-900 pb-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg mb-2">
              IS
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              Government Public Procurement Standards Verification System
            </p>
            <h1 className="text-lg font-black text-slate-950 uppercase tracking-tight mt-1">
              Indian Standards (IS) Applicability & Compliance Report
            </h1>
            <p className="text-[11px] text-slate-600 mt-1 font-mono">
              Report Ref: {analysis_id} • Date: {new Date(timestamp).toLocaleDateString()}
            </p>
          </div>

          {/* Document & Procurement Details */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Procurement Document</p>
              <p className="font-bold text-slate-900">{document_name}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{tender_ref || 'Reference: N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Issuing Authority / PSU</p>
              <p className="font-semibold text-slate-800">{issuing_authority || 'Authorized Public Procurement Entity'}</p>
              <p className="text-[11px] text-blue-700 font-medium mt-0.5">Category: {detected_category}</p>
            </div>
          </div>

          {/* Verification Findings */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Technical Verification Findings
            </h3>

            <div className="space-y-2 text-xs">
              <p><strong>Identified Product:</strong> {detected_product}</p>
              {extracted_specifications.grade && (
                <p><strong>Technical Grade Specified:</strong> {extracted_specifications.grade}</p>
              )}
              <p>
                <strong>Tender Citation Status:</strong>{' '}
                <span className="font-semibold text-slate-900">
                  {referenced_standards.length > 0 ? referenced_standards[0].normalized_is : 'None Explicitly Cited'}
                </span>{' '}
                ({overall_status.replace('_', ' ')})
              </p>
            </div>
          </div>

          {/* Recommended Standard Section */}
          {primary_recommendation && (
            <div className="p-5 rounded-xl border-2 border-blue-900 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">
                  Approved Standard Recommendation
                </span>
                <span className="text-xs font-bold text-blue-900 font-mono">
                  Confidence: {Math.round(overall_confidence * 100)}%
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold font-mono text-slate-950">
                  {primary_recommendation.is_number}
                </h4>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">
                  {primary_recommendation.title}
                </p>
              </div>

              {primary_recommendation.mandatory_qco && (
                <p className="text-[11px] text-slate-800 bg-white p-2.5 rounded border border-blue-200">
                  <strong>Mandatory QCO:</strong> {primary_recommendation.mandatory_qco}
                </p>
              )}

              <div className="pt-2 border-t border-blue-200 text-[11px] text-slate-700">
                <strong>Justification:</strong> {primary_recommendation.why_recommended_reasons.join(' ')}
              </div>
            </div>
          )}

          {/* Statutory Signoff Block */}
          <div className="pt-8 grid grid-cols-2 gap-8 border-t border-slate-300">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Verified by AI Engine</p>
              <p className="font-mono text-xs text-slate-700 mt-1">IS Standard Advisor (SIH26108)</p>
              <p className="text-[10px] text-slate-400">Timestamp: {timestamp}</p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-400">Authorized Officer Signature</p>
              <div className="h-10 border-b border-dashed border-slate-400 mt-2"></div>
              <p className="text-[11px] font-bold text-slate-800 mt-1">Procurement Verification Officer</p>
              <p className="text-[10px] text-slate-500">Competent Procurement Authority</p>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="pt-4 text-center text-[10px] text-slate-400 border-t border-slate-100">
            Smart India Hackathon Prototype (SIH26108) • Curated Demo Dataset • Always cross-verify with official BIS Gazette.
          </div>
        </div>
      </div>
    </div>
  );
};
