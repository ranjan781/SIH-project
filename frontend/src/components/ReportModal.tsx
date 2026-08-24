import React from 'react';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  FileText
} from 'lucide-react';
import type { DocumentAnalysisResult } from '../types';

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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-fadeIn">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="no-print p-3.5 bg-[#0f172a] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Procurement Compliance Verification Audit Certificate</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded shadow-xs transition-all"
            >
              <Printer className="w-3 h-3" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="p-8 sm:p-12 space-y-6 text-slate-900 text-xs bg-white">
          {/* Certificate Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="w-10 h-10 mx-auto rounded bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm mb-1.5">
              BIS
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              National Public Procurement Standards Verification Framework
            </p>
            <h1 className="text-base font-black text-slate-950 uppercase tracking-tight mt-0.5">
              Indian Standards (IS) Applicability & Compliance Report
            </h1>
            <p className="text-[11px] text-slate-600 mt-1 font-mono">
              Audit Ref: {analysis_id} • Issued: {new Date(timestamp).toLocaleDateString()}
            </p>
          </div>

          {/* Document & Procurement Details */}
          <div className="grid grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Procurement Specification</span>
              <p className="font-bold text-slate-900 text-xs">{document_name}</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{tender_ref || 'Reference: N/A'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Issuing Authority</span>
              <p className="font-semibold text-slate-800 text-xs">{issuing_authority || 'Public Procurement Entity'}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Category: {detected_category}</p>
            </div>
          </div>

          {/* Verification Findings */}
          <div className="space-y-2 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 text-[11px]">
              Technical Verification Findings
            </h3>
            <p><strong>Identified Product:</strong> {detected_product}</p>
            {extracted_specifications.grade && (
              <p><strong>Technical Grade Specified:</strong> {extracted_specifications.grade}</p>
            )}
            <p>
              <strong>Tender Reference Status:</strong>{' '}
              <span className="font-semibold text-slate-900">
                {referenced_standards.length > 0 ? referenced_standards[0].normalized_is : 'None Explicitly Cited'}
              </span>{' '}
              ({overall_status.replace('_', ' ')})
            </p>
          </div>

          {/* Recommended Standard Section */}
          {primary_recommendation && (
            <div className="p-4 rounded-lg border border-slate-900 bg-slate-50/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  Approved Standard Recommendation
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  Confidence: {Math.round(overall_confidence * 100)}%
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold font-mono text-slate-950">
                  {primary_recommendation.is_number}
                </h4>
                <p className="text-xs font-medium text-slate-700 mt-0.5">
                  {primary_recommendation.title}
                </p>
              </div>

              {primary_recommendation.mandatory_qco && (
                <p className="text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200">
                  <strong>Mandatory QCO:</strong> {primary_recommendation.mandatory_qco}
                </p>
              )}

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                <strong>Justification:</strong> {primary_recommendation.why_recommended_reasons.join(' ')}
              </div>
            </div>
          )}

          {/* Signature Block */}
          <div className="pt-6 grid grid-cols-2 gap-8 border-t border-slate-300">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">AI Verification Engine</span>
              <p className="font-mono text-xs text-slate-700 mt-0.5">IS Standard Advisor (SIH26108)</p>
              <p className="text-[10px] text-slate-400">Timestamp: {timestamp}</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Authorized Officer Signature</span>
              <div className="h-8 border-b border-dashed border-slate-400 mt-1"></div>
              <p className="text-xs font-bold text-slate-800 mt-1">Procurement Verification Officer</p>
              <p className="text-[10px] text-slate-500">Authorized Signatory</p>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-3 text-center text-[10px] text-slate-400 border-t border-slate-100">
            Smart India Hackathon 2024 (SIH26108) • Research Environment • Always cross-verify with official BIS Gazette.
          </div>
        </div>
      </div>
    </div>
  );
};
