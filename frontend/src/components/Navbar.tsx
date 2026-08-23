import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  FileSearch, 
  Award, 
  BookOpen, 
  GitCompare, 
  Workflow, 
  GraduationCap, 
  History, 
  Server,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBackendConnected: boolean;
  hasActiveResult: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  hasActiveResult
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'analyze', label: 'Tender Analysis', icon: <FileSearch className="w-4 h-4" /> },
    { 
      id: 'recommendation', 
      label: 'Recommendation', 
      icon: <Award className="w-4 h-4" />, 
      badge: hasActiveResult ? 'Active' : undefined 
    },
    { id: 'standards', label: 'Standards Explorer', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'comparison', label: 'Doc Comparison', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'pipeline', label: 'AI Pipeline', icon: <Workflow className="w-4 h-4" /> },
    { id: 'research', label: 'Research & Paper', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'audit', label: 'Audit Log', icon: <History className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Bar with Ministry / PS Branding */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-800/80 text-xs text-slate-400 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-blue-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Smart India Hackathon 2024
          </span>
          <span className="text-slate-600">|</span>
          <span>Problem Statement: <strong className="text-slate-300">SIH26108</strong></span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-300">Public Procurement Standards Intelligence</span>
        </div>

        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${
            isBackendConnected 
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' 
              : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
          }`}>
            <Server className="w-3 h-3" />
            <span>{isBackendConnected ? 'FastAPI Backend Online' : 'Client AI Engine (Offline Ready)'}</span>
          </div>
          <span className="text-slate-500 text-[11px]">v1.0-Prototype</span>
        </div>
      </div>

      {/* Main App Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-blue-900/40 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 rounded-[7px] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                  IS Standard Advisor
                </h1>
                <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded">
                  BIS-AI
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                AI-Powered Indian Standards Recommendation Engine
              </p>
            </div>
          </div>

          {/* Quick Action */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('analyze')}
              className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Analyze New Tender</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-blue-800 text-blue-200' : 'bg-blue-900/60 text-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
