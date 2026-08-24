import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Building,
  Check,
  Search,
  UploadCloud
} from 'lucide-react';
import type { SampleTender, ActiveTab, DocumentAnalysisResult } from '../types';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectSampleTender: (sample: SampleTender) => void;
  sampleTenders: SampleTender[];
  recentAnalyses: DocumentAnalysisResult[];
  onViewAnalysis: (result: DocumentAnalysisResult) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onSelectSampleTender,
  sampleTenders,
  recentAnalyses,
  onViewAnalysis
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-fadeIn">
      
      {/* Hero Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Bureau of Indian Standards Audit System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Public Procurement Standards Verification
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Automated intelligence engine to verify Indian Standard (IS) specifications in tender bid documents, detect superseded clauses, enforce Quality Control Orders (QCO), and reduce CAG audit risks.
            </p>
            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('analyze')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Analyze New Tender Document</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('standards')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-all"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                <span>Browse 152+ BIS Standards</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Badge Panel */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0 w-full md:w-72 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              System Performance
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Indexed BIS Dataset:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">152 Standards</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-600 dark:text-slate-400">Search Algorithm:</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">TF-IDF Vector</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-600 dark:text-slate-400">Procurement Sectors:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">12 Categories</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Catalog Corpus</span>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">152</div>
            <span className="text-[11px] text-slate-500">Active & Revised Standards</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Coverage Sectors</span>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">12</div>
            <span className="text-[11px] text-slate-500">Public Procurement Areas</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Revision Graph</span>
            <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 mt-0.5">100%</div>
            <span className="text-[11px] text-slate-500">Superseded Tracking</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Statutory Compliance</span>
            <div className="text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400 mt-0.5">QCO + GFR</div>
            <span className="text-[11px] text-slate-500">Mandatory Mandates Enforced</span>
          </div>
        </div>
      </div>

      {/* Test Scenarios Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Procurement Verification Test Scenarios
              </h2>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any pre-configured procurement scenario to test the recommendation engine on real edge cases.
            </p>
          </div>
          <span className="text-xs font-bold font-mono px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 shrink-0">
            {sampleTenders.length} Scenarios Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sampleTenders.map((sample) => {
            const isOutdated = sample.scenario_type.includes('Outdated') || sample.scenario_type.includes('Withdrawn');
            return (
              <div
                key={sample.id}
                onClick={() => onSelectSampleTender(sample)}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {sample.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isOutdated
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {sample.scenario_type}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {sample.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {sample.issue_summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <div className="font-mono text-[11px] flex items-center gap-1.5">
                    <span className="line-through text-slate-400">{sample.expected_detected_is}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sample.expected_recommended_is}</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Run Verification</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            1
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Ingest Tender Clauses</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Paste tender specification text or upload PDF/DOCX files directly. The system extracts product specs and cited IS codes.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            2
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Semantic Vector Match</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Queries the 152-standard BIS vector index using TF-IDF similarity to find active specifications across 12 product sectors.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            3
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Audit Signoff & Export</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Generates 5-point evidence rationale, clause diff matrix, and formal officer signoff certificates for procurement records.
          </p>
        </div>
      </div>

    </div>
  );
};
