import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  BookOpen,
  Clock,
  Check,
  ChevronDown,
  UploadCloud,
  Search,
  Building2,
  FileCheck
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
  const [trendRange, setTrendRange] = useState<'6' | '12'>('6');

  // Monthly data for the chart
  const monthlyData = [
    { month: 'Feb', docs: 6, stds: 4 },
    { month: 'Mar', docs: 7, stds: 4 },
    { month: 'Apr', docs: 11, stds: 6 },
    { month: 'May', docs: 16, stds: 8 },
    { month: 'Jun', docs: 20, stds: 14 },
    { month: 'Jul', docs: 27, stds: 19 },
  ];

  return (
    <div className="space-y-5 max-w-[1520px] mx-auto pb-16 animate-page-enter">
      
      {/* Top Hero Section: Main Intelligence Card (Left) + Statutory Enforcement Card (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Left Main Hero Card (approx 75% width on xl: 9 cols) */}
        <div className="xl:col-span-8 bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                AI Analysis Engine Online
              </span>
              <span className="text-xs text-slate-400 font-mono">SIH26108 Evaluation Protocol</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Procurement Standards Intelligence
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Analyze tender specifications, verify referenced Indian Standards (IS), and identify potential revision mismatches and superseded statutory clauses.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('analyze')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-blue-200" />
                <span>Analyze New Tender</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
              </button>

              <button
                onClick={() => setActiveTab('standards')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg shadow-xs transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Browse Standards Catalog</span>
              </button>
            </div>
          </div>

          {/* Right Side of Hero: Capabilities Box + Government Illustration */}
          <div className="flex items-center gap-5 shrink-0 self-center">
            {/* System Capabilities Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/70 text-xs w-60">
              <p className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider mb-2.5">
                SYSTEM CAPABILITIES
              </p>
              <div className="space-y-2 text-[11.5px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Revision Check Accuracy:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg Inference Latency:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">&lt; 180 ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Statutory QCO Coverage:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded text-[10px]">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Government Graphic Illustration */}
            <div className="hidden 2xl:flex flex-col items-center justify-center p-3 relative">
              <svg width="120" height="100" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Government Portico Pillars */}
                <path d="M20 95H80V100H20V95Z" fill="#94A3B8" />
                <path d="M25 45H75V50H25V45Z" fill="#94A3B8" />
                <path d="M50 25L20 45H80L50 25Z" fill="#64748B" />
                <rect x="28" y="50" width="8" height="45" rx="1" fill="#CBD5E1" />
                <rect x="46" y="50" width="8" height="45" rx="1" fill="#CBD5E1" />
                <rect x="64" y="50" width="8" height="45" rx="1" fill="#CBD5E1" />
                {/* Document with Shield */}
                <rect x="75" y="30" width="48" height="65" rx="3" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2" />
                <line x1="83" y1="42" x2="110" y2="42" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="83" y1="50" x2="105" y2="50" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                <line x1="83" y1="58" x2="115" y2="58" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
                {/* Green Verified Shield */}
                <circle cx="99" cy="75" r="12" fill="#10B981" />
                <path d="M95 75L98 78L104 72" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {/* Magnifying Glass */}
                <circle cx="115" cy="85" r="10" stroke="#0F172A" strokeWidth="3" fill="none" />
                <line x1="122" y1="92" x2="132" y2="102" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Statutory Enforcement Card (3 cols on xl) */}
        <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                STATUTORY COMPLIANCE ENFORCEMENT
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                GFR 2017
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3.5">
              Public procurement without verified current IS references leads to non-compliant deliveries, audit queries by CAG, and legal arbitration under commercial contract acts.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Quality Control Order (QCO) Verification</strong>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Enforces mandatory BIS certification mandates.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">CAG & CVC Audit Alignment</strong>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Prevents compliance objections, surcharge, and audit paras.</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">Legal & Contractual Safeguard</strong>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">Mitigates vendor risk and arbitration exposure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row of 4 Metric Cards (Matching Photo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: DOCUMENTS ANALYZED */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs card-hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              DOCUMENTS ANALYZED
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">14</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                <span>+100% automated</span>
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">Processed across public tenders</p>
          </div>
        </div>

        {/* Card 2: STANDARDS IDENTIFIED */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs card-hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              STANDARDS IDENTIFIED
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">28</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">in research corpus</span>
            </div>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">Spanning 10 key public sectors</p>
          </div>
        </div>

        {/* Card 3: OUTDATED REFERENCES */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs card-hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              OUTDATED REFERENCES
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">6</span>
              <span className="text-[10.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                Action Required
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">Superseded revisions upgraded</p>
          </div>
        </div>

        {/* Card 4: HIGH-RISK MISMATCHES */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs card-hover-lift flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              HIGH-RISK MISMATCHES
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">3</span>
              <span className="text-[10.5px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800">
                Non-Compliant
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">Withdrawn codes / grade gaps</p>
          </div>
        </div>

      </div>

      {/* Bottom 4-Column Row (Matching Photo) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Col 1 (4 cols): STANDARDS STATUS DISTRIBUTION & COMPLIANCE BREAKDOWN */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>STANDARDS STATUS DISTRIBUTION & COMPLIANCE BREAKDOWN</span>
                </h3>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Empirical verification ratio across analyzed tender corpus
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-semibold shrink-0">
                n = 28 Records
              </span>
            </div>

            {/* Donut Chart and Legend */}
            <div className="flex items-center gap-4 py-4">
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-28 h-28 transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4.5" />
                  {/* Segment 1: Green 58% (Valid) */}
                  <circle 
                    cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4.5" 
                    strokeDasharray="51 100" strokeDashoffset="0"
                  />
                  {/* Segment 2: Orange 27% (Outdated) */}
                  <circle 
                    cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4.5" 
                    strokeDasharray="24 100" strokeDashoffset="-51"
                  />
                  {/* Segment 3: Red 15% (Withdrawn) */}
                  <circle 
                    cx="18" cy="18" r="14" fill="none" stroke="#F43F5E" strokeWidth="4.5" 
                    strokeDasharray="13 100" strokeDashoffset="-75"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white leading-none">28</span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Total</span>
                </div>
              </div>

              {/* Progress bars & percentages */}
              <div className="flex-1 space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Valid & Current Standards (IS)
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">58% (16)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '58%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      Outdated / Superseded Revisions
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">27% (8)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '27%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Withdrawn / Mismatch
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">15% (4)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('standards')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View Detailed Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Col 2 (3 cols): ANALYSIS TREND (Monthly) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                ANALYSIS TREND <span className="text-slate-400 font-normal">(Monthly)</span>
              </h3>
              <div className="relative">
                <button 
                  onClick={() => setTrendRange(trendRange === '6' ? '12' : '6')}
                  className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  <span>Last 6 Records</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Interactive Bar Chart */}
            <div className="pt-2">
              <div className="h-40 flex items-end justify-between gap-2 px-2 border-b border-slate-200 dark:border-slate-700 pb-1">
                {monthlyData.map((item, idx) => {
                  const docHeight = (item.docs / 30) * 100;
                  const stdHeight = (item.stds / 30) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-32">
                        {/* Docs Bar (Blue) */}
                        <div 
                          className="w-2.5 bg-blue-600 hover:bg-blue-700 rounded-t-xs transition-all"
                          style={{ height: `${docHeight}%` }}
                          title={`Docs Analyzed: ${item.docs}`}
                        />
                        {/* Stds Bar (Green) */}
                        <div 
                          className="w-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-t-xs transition-all"
                          style={{ height: `${stdHeight}%` }}
                          title={`Standards Identified: ${item.stds}`}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{item.month}</span>
                    </div>
                  );
                })}
              </div>

              {/* Y Axis Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span>
                  Documents Analyzed
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
                  Standards Identified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 3 (3 cols): RECENT TENDER ANALYSES */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                RECENT TENDER ANALYSES
              </h3>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* List of 4 Documents (Matching Photo) */}
            <div className="space-y-2.5">
              {/* Item 1 */}
              <div 
                onClick={() => onSelectSampleTender(sampleTenders[0] || sampleTenders[1])}
                className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      PWD_Road_Infra_Tender_2024.pdf
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Analyzed 2h ago • Road Construction
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded shrink-0">
                  Review Required
                </span>
              </div>

              {/* Item 2 */}
              <div 
                onClick={() => onSelectSampleTender(sampleTenders[1])}
                className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Steel_Supply_Specifications.docx
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Analyzed 5h ago • Steel & Metallurgy
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded shrink-0">
                  Compliant
                </span>
              </div>

              {/* Item 3 */}
              <div 
                onClick={() => onSelectSampleTender(sampleTenders[3] || sampleTenders[0])}
                className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Electrical_Equipment_GoI.pdf
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Analyzed 1d ago • Electricals
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-800 px-1.5 py-0.2 rounded shrink-0">
                  Non-Compliant
                </span>
              </div>

              {/* Item 4 */}
              <div 
                onClick={() => onSelectSampleTender(sampleTenders[4] || sampleTenders[1])}
                className="p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      Water_Treatment_Equipments.pdf
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      Analyzed 2d ago • Water & Sanitation
                    </p>
                  </div>
                </div>
                <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded shrink-0">
                  Compliant
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 4 (2 cols on xl): RISK LEVEL OVERVIEW & QUICK ACTIONS */}
        <div className="lg:col-span-2 space-y-4">
          {/* Risk Level Overview */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
              RISK LEVEL OVERVIEW
            </h3>

            <div className="flex items-center gap-3">
              {/* Circular Gauge Donut */}
              <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-16 h-16 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4" />
                  {/* High Risk 21% */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F43F5E" strokeWidth="4" strokeDasharray="18 100" strokeDashoffset="0" />
                  {/* Med Risk 43% */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="4" strokeDasharray="38 100" strokeDashoffset="-18" />
                  {/* Low Risk 36% */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="32 100" strokeDashoffset="-56" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">3</span>
                  <span className="text-[7px] text-slate-400 uppercase font-semibold">High Risk</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span>High Risk</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white ml-auto">3 (21%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                  <span>Medium Risk</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white ml-auto">6 (43%)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>Low Risk</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white ml-auto">5 (36%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-2.5">
              QUICK ACTIONS
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('analyze')}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <UploadCloud className="w-3.5 h-3.5 text-blue-500" />
                  <span className="truncate">Upload Tender Document</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={() => setActiveTab('standards')}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold flex items-center justify-between border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Search className="w-3.5 h-3.5 text-blue-500" />
                  <span className="truncate">Search Indian Standards</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 1-Click Realistic Scenarios for judges to test instantly */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>SIH HACKATHON 1-CLICK TEST SCENARIOS</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click any scenario below to automatically run and test the AI recommendation engine on real-world edge cases:
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
            {sampleTenders.length} Scenarios Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sampleTenders.map((sample) => {
            const isOutdated = sample.scenario_type.includes('Outdated') || sample.scenario_type.includes('Withdrawn');
            return (
              <div
                key={sample.id}
                onClick={() => onSelectSampleTender(sample)}
                className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer flex flex-col justify-between card-hover-lift"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                      {sample.category}
                    </span>
                    <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded border ${
                      isOutdated
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {sample.scenario_type}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {sample.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {sample.issue_summary}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-[11px]">
                  <div className="font-mono text-[10px] flex items-center gap-1">
                    <span className="line-through text-slate-400">{sample.expected_detected_is}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-bold text-slate-900 dark:text-white">{sample.expected_recommended_is}</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-0.5">
                    <span>Run AI</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
