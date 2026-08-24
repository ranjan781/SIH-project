import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DashboardView } from './components/DashboardView';
import { TenderAnalysisView } from './components/TenderAnalysisView';
import { RecommendationResultView } from './components/RecommendationResultView';
import { StandardsExplorerView } from './components/StandardsExplorerView';
import { DocumentComparisonView } from './components/DocumentComparisonView';
import { VerificationModal } from './components/VerificationModal';
import { ReportModal } from './components/ReportModal';
import type { 
  ActiveTab, 
  DocumentAnalysisResult, 
  StandardRecord, 
  SampleTender, 
  AuditLogEntry,
  OfficerProfile
} from './types';
import { ApiService } from './services/api';
import { INITIAL_STANDARDS_DATA, SAMPLE_TENDERS, DEFAULT_AUDIT_LOGS } from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('sih_theme') === 'dark';
  });

  // Active Verification Officer State (Persisted in localStorage)
  const [officerProfile, setOfficerProfile] = useState<OfficerProfile>(() => {
    const saved = localStorage.getItem('sih_officer_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      name: 'Er. Sachin Gupta',
      role: 'Chief Procurement Verification Officer',
      department: 'CPWD Technical Office, New Delhi'
    };
  });

  const [standards, setStandards] = useState<StandardRecord[]>(INITIAL_STANDARDS_DATA);
  const [sampleTenders, setSampleTenders] = useState<SampleTender[]>(SAMPLE_TENDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEFAULT_AUDIT_LOGS);
  
  const [selectedSample, setSelectedSample] = useState<SampleTender | null>(null);
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<DocumentAnalysisResult[]>([]);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Update & Persist Officer Profile
  const handleUpdateOfficerProfile = (profile: OfficerProfile) => {
    setOfficerProfile(profile);
    localStorage.setItem('sih_officer_profile', JSON.stringify(profile));
  };

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sih_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sih_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // Initial load: check backend connection & fetch data
  useEffect(() => {
    const initData = async () => {
      const isOnline = await ApiService.checkBackendHealth();
      setIsBackendConnected(isOnline);

      try {
        const stds = await ApiService.getStandards();
        setStandards(stds);
        const samples = await ApiService.getSampleTenders();
        setSampleTenders(samples);
        const logs = await ApiService.getAuditHistory();
        setAuditLogs(logs);
      } catch (err) {
        console.log("Using built-in client data");
      }
    };
    initData();
  }, []);

  const handleAnalysisComplete = (result: DocumentAnalysisResult) => {
    setCurrentAnalysisResult(result);
    setRecentAnalyses(prev => [result, ...prev.filter(r => r.analysis_id !== result.analysis_id)]);
    setActiveTab('recommendation');
  };

  const handleSelectSampleTender = (sample: SampleTender) => {
    setSelectedSample(sample);
    setActiveTab('analyze');
  };

  const handleViewAnalysis = (result: DocumentAnalysisResult) => {
    setCurrentAnalysisResult(result);
    setActiveTab('recommendation');
  };

  const handleDecisionRecorded = (newEntry: AuditLogEntry) => {
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        hasActiveResult={!!currentAnalysisResult}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        officerProfile={officerProfile}
        onUpdateOfficerProfile={handleUpdateOfficerProfile}
      />

      <DisclaimerBanner />

      {/* Main Page Content */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onSelectSampleTender={handleSelectSampleTender}
            sampleTenders={sampleTenders}
            recentAnalyses={recentAnalyses}
            onViewAnalysis={handleViewAnalysis}
          />
        )}

        {activeTab === 'analyze' && (
          <TenderAnalysisView
            onAnalysisComplete={handleAnalysisComplete}
            sampleTenders={sampleTenders}
            selectedSample={selectedSample}
          />
        )}

        {activeTab === 'recommendation' && currentAnalysisResult && (
          <RecommendationResultView
            analysisResult={currentAnalysisResult}
            setActiveTab={setActiveTab}
            onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
            onOpenReportModal={() => setIsReportModalOpen(true)}
          />
        )}

        {activeTab === 'recommendation' && !currentAnalysisResult && (
          <div className="max-w-md mx-auto my-16 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Tender Document Analyzed Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select or paste a tender specification to generate Indian Standard recommendations.
            </p>
            <button
              onClick={() => setActiveTab('analyze')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Go to Tender Analysis Studio
            </button>
          </div>
        )}

        {activeTab === 'standards' && (
          <StandardsExplorerView standards={standards} />
        )}

        {activeTab === 'comparison' && (
          <DocumentComparisonView
            analysisResult={currentAnalysisResult}
            setActiveTab={setActiveTab}
            onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
          />
        )}
      </main>

      {/* Clean Enterprise Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-bold text-slate-200">
              IS Standard Advisor • Public Procurement Verification Portal
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bureau of Indian Standards Public Procurement Intelligent Verification System
            </p>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-medium">
            <span>Logged in as: <strong className="text-slate-200 font-bold">{officerProfile.name}</strong> ({officerProfile.role})</span>
            <span>•</span>
            <span className="text-blue-400 font-bold">Enterprise Procurement Bureau</span>
          </div>
        </div>
      </footer>


      {/* Officer Signoff Modal */}
      {isDecisionModalOpen && currentAnalysisResult && (
        <VerificationModal
          analysisResult={currentAnalysisResult}
          onClose={() => setIsDecisionModalOpen(false)}
          onDecisionRecorded={handleDecisionRecorded}
          officerProfile={officerProfile}
        />
      )}

      {/* Audit Report Modal */}
      {isReportModalOpen && currentAnalysisResult && (
        <ReportModal
          analysisResult={currentAnalysisResult}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
