import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DashboardView } from './components/DashboardView';
import { TenderAnalysisView } from './components/TenderAnalysisView';
import { RecommendationResultView } from './components/RecommendationResultView';
import { StandardsExplorerView } from './components/StandardsExplorerView';
import { DocumentComparisonView } from './components/DocumentComparisonView';
import { PipelineMethodologyView } from './components/PipelineMethodologyView';
import { ResearchPaperView } from './components/ResearchPaperView';
import { AuditHistoryView } from './components/AuditHistoryView';
import { VerificationModal } from './components/VerificationModal';
import { ReportModal } from './components/ReportModal';
import { 
  ActiveTab, 
  DocumentAnalysisResult, 
  StandardRecord, 
  SampleTender, 
  AuditLogEntry 
} from './types';
import { ApiService } from './services/api';
import { INITIAL_STANDARDS_DATA, SAMPLE_TENDERS, DEFAULT_AUDIT_LOGS } from './data/mockData';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [standards, setStandards] = useState<StandardRecord[]>(INITIAL_STANDARDS_DATA);
  const [sampleTenders, setSampleTenders] = useState<SampleTender[]>(SAMPLE_TENDERS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(DEFAULT_AUDIT_LOGS);
  
  const [selectedSample, setSelectedSample] = useState<SampleTender | null>(null);
  const [currentAnalysisResult, setCurrentAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<DocumentAnalysisResult[]>([]);

  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        hasActiveResult={!!currentAnalysisResult}
      />

      {/* Demo & Research Notice Banner */}
      <DisclaimerBanner />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-2xl border border-slate-200 text-center shadow-sm">
            <h3 className="text-base font-bold text-slate-800">No Tender Document Analyzed Yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select or paste a tender specification to generate Indian Standard recommendations.
            </p>
            <button
              onClick={() => setActiveTab('analyze')}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
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

        {activeTab === 'pipeline' && (
          <PipelineMethodologyView />
        )}

        {activeTab === 'research' && (
          <ResearchPaperView />
        )}

        {activeTab === 'audit' && (
          <AuditHistoryView logs={auditLogs} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-300">
              IS Standard Advisor • Problem Statement: SIH26108
            </p>
            <p className="text-[11px] text-slate-500">
              AI-Powered Indian Standards Recommendation Engine for Procurement Specifications
            </p>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Demo Research Prototype</span>
            <span>•</span>
            <span>Government Enterprise Design</span>
            <span>•</span>
            <span className="text-blue-400 font-medium">Smart India Hackathon</span>
          </div>
        </div>
      </footer>

      {/* Verification / Officer Signoff Modal */}
      {isDecisionModalOpen && currentAnalysisResult && (
        <VerificationModal
          analysisResult={currentAnalysisResult}
          onClose={() => setIsDecisionModalOpen(false)}
          onDecisionRecorded={handleDecisionRecorded}
        />
      )}

      {/* Printable Report Modal */}
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
