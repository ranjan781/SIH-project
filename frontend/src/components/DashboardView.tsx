import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  BookOpen,
  ShieldCheck,
  Building,
  Search,
  ExternalLink
} from 'lucide-react';
import type { ActiveTab, DocumentAnalysisResult, SampleTender } from '../types';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onSelectSampleTender?: (sample: SampleTender) => void;
  sampleTenders?: SampleTender[];
  recentAnalyses?: DocumentAnalysisResult[];
  onViewAnalysis?: (result: DocumentAnalysisResult) => void;
}

const DEMO_RECENT_AUDITS = [
  { id: 'AUD-2026-091', title: 'Supply of High-Strength TMT Steel Bars (Fe 500D)', cited: 'IS 1786:2008', active: 'IS 1786:2008', status: 'Compliant', date: 'Today, 09:40 AM', officer: 'Rajesh Kumar' },
  { id: 'AUD-2026-088', title: 'Procurement of Children Playground Swing Equipment', cited: 'IS 9873(Part 4):2017', active: 'IS 9873 (Part 4):2019', status: 'Outdated Revision', date: 'Yesterday, 04:15 PM', officer: 'Er. Sachin Gupta' },
  { id: 'AUD-2026-084', title: 'Bulk Procurement of 43 Grade Ordinary Portland Cement', cited: 'IS 8112:1989', active: 'IS 8112:2013', status: 'Outdated Revision', date: '24 Aug 2026', officer: 'Shri R. K. Sharma' },
  { id: 'AUD-2026-079', title: 'Supply of Portable Stored Pressure ABC Powder Extinguisher', cited: 'IS 2171:1999', active: 'IS 15683:2018', status: 'Withdrawn Code', date: '23 Aug 2026', officer: 'Dr. Ananya Sen' },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab
}) => {
  const [heroSearch, setHeroSearch] = useState('');

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      setActiveTab('standards');
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-16">
      
      {/* ── Hero Card ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-10 border border-[#E1E4E8] dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">

          {/* Left: Title + description + actions */}
          <div className="max-w-2xl space-y-5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-[#536586] dark:text-slate-300 border border-[#E1E4E8] dark:border-slate-700 tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#536586]" />
                Procurement Verification Portal
              </span>
            </div>

            <h1 className="page-title text-[#182036] dark:text-white">
              Public Procurement<br />Standards Verification
            </h1>

            <p className="body-text text-[#536586] dark:text-slate-300 max-w-xl">
              Automated intelligence engine to verify Indian Standard (IS) specifications in tender bid documents — detect superseded clauses, enforce QCO mandates, and reduce CAG audit compliance risks.
            </p>

            {/* Quick Hero Search */}
            <form onSubmit={handleHeroSearchSubmit} className="max-w-lg">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-4" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Instant IS lookup — e.g. 'IS 1786', 'TMT Steel', 'PE 100 Pipes'..."
                  className="w-full pl-11 pr-28 py-3.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-[#E1E4E8] dark:border-slate-700 rounded-xl text-[#182036] dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-700 font-medium placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-2 bg-[#182036] hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => setActiveTab('analyze')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#182036] hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Analyze Tender Specification</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('standards')}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#182036] dark:text-slate-200 text-sm font-medium rounded-xl border border-[#E1E4E8] dark:border-slate-700 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#536586]" />
                <span>Browse 152+ BIS Standards</span>
              </button>
            </div>
          </div>

          {/* Right: Operational Statistics Panel */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-[#E1E4E8] dark:border-slate-700 shrink-0 w-full lg:w-72 space-y-4">
            <h3 className="sub-section-title text-[#536586] dark:text-slate-400">
              Operational Statistics
            </h3>
            <div className="border-b border-[#E1E4E8] dark:border-slate-700" />
            <div className="space-y-3">
              {[
                { label: 'Indexed BIS Dataset', value: '152 Standards' },
                { label: 'Search Model', value: 'TF-IDF Vector' },
                { label: 'Procurement Sectors', value: '12 Categories' },
                { label: 'QCO Integration', value: 'Active' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-[#536586] dark:text-slate-400 font-medium">{label}</span>
                  <span className="font-mono font-bold text-[#182036] dark:text-white text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FileText, label: 'Catalog Corpus', value: '152', sub: 'Active & Revised Standards' },
          { icon: CheckCircle2, label: 'Coverage Sectors', value: '12', sub: 'Public Procurement Sectors' },
          { icon: AlertTriangle, label: 'Revision Lineage', value: '100%', sub: 'Superseded Tracking' },
          { icon: Building, label: 'Statutory Rules', value: 'QCO + GFR', sub: 'Quality Orders Enforced' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-[#E1E4E8] dark:border-slate-800 shadow-sm flex items-center gap-4 card-hover-lift">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#182036] dark:text-slate-300 flex items-center justify-center shrink-0 border border-[#E1E4E8] dark:border-slate-700">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#536586] dark:text-slate-400">{label}</span>
              <div className="text-2xl font-extrabold font-mono text-[#182036] dark:text-white mt-0.5">{value}</div>
              <span className="text-xs text-[#536586] dark:text-slate-500">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Procurement Audit Table ────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-10 border border-[#E1E4E8] dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E1E4E8] dark:border-slate-800 pb-5">
          <div>
            <h2 className="section-title text-[#182036] dark:text-white">Recent Procurement Audit Activity</h2>
            <p className="text-sm text-[#536586] dark:text-slate-400 mt-1">
              Live audit verification log of tender specifications and officer signoff records.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('analyze')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#182036] dark:text-slate-200 hover:underline shrink-0"
          >
            <span>New Tender Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E1E4E8] dark:border-slate-800">
                {['Audit ID', 'Tender Title', 'Cited IS', 'Active Edition', 'Compliance', 'Officer', 'Action'].map((h, i) => (
                  <th key={h} className={`py-3 px-4 text-xs font-bold uppercase tracking-wider text-[#536586] dark:text-slate-400 ${i === 6 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E4E8] dark:divide-slate-800">
              {DEMO_RECENT_AUDITS.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-4 font-mono font-semibold text-sm text-[#182036] dark:text-slate-200">{item.id}</td>
                  <td className="py-4 px-4 font-medium text-sm text-[#182036] dark:text-white max-w-xs truncate">{item.title}</td>
                  <td className="py-4 px-4 font-mono text-sm text-slate-500">{item.cited}</td>
                  <td className="py-4 px-4 font-mono font-bold text-sm text-[#182036] dark:text-slate-200">{item.active}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                      item.status === 'Compliant'
                        ? 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-[#536586] dark:text-slate-300 font-medium">{item.officer}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setActiveTab('analyze')}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#182036] dark:text-slate-200 hover:underline"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Audit Workflow Steps ───────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 sm:p-10 border border-[#E1E4E8] dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-[#E1E4E8] dark:border-slate-800 pb-5">
          <h2 className="section-title text-[#182036] dark:text-white">Procurement Verification Audit Workflow</h2>
          <p className="text-sm text-[#536586] dark:text-slate-400 mt-1">
            Standard 3-step verification protocol for public procurement specification compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Ingest Tender Specifications',
              desc: 'Paste tender specification text or upload PDF/DOCX files directly. The system extracts cited IS codes, material grades, and technical parameters.'
            },
            {
              step: '2',
              title: 'Vector Search & Revision Check',
              desc: 'Matches extracted specs against the 152-standard BIS dataset to verify current active editions and Quality Control Orders (QCO).'
            },
            {
              step: '3',
              title: 'Officer Verification & Signoff',
              desc: 'Generates evidence breakdown, parameter diff comparison, and formal officer signoff records for procurement documentation.'
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#182036] dark:bg-slate-100 text-white dark:text-[#182036] flex items-center justify-center font-extrabold text-base">
                {step}
              </div>
              <h3 className="text-base font-bold text-[#182036] dark:text-white">{title}</h3>
              <p className="text-sm text-[#536586] dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
