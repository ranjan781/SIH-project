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
  User,
  Bell
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
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: 'analyze', label: 'Tender Analysis', icon: <FileSearch className="w-3.5 h-3.5" /> },
    { 
      id: 'recommendation', 
      label: 'Recommendations', 
      icon: <Award className="w-3.5 h-3.5" />, 
      badge: hasActiveResult ? '1 Ready' : undefined 
    },
    { id: 'standards', label: 'Standards', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'comparison', label: 'Comparison', icon: <GitCompare className="w-3.5 h-3.5" /> },
    { id: 'pipeline', label: 'AI Pipeline', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'research', label: 'Research', icon: <GraduationCap className="w-3.5 h-3.5" /> },
    { id: 'audit', label: 'Audit Log', icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="bg-[#0f172a] text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-xs">
      {/* Top Institutional Bar */}
      <div className="bg-[#090d16] px-4 sm:px-6 py-1 border-b border-slate-800/80 text-[11px] text-slate-400 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            National Public Procurement Standards Verification System
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-400">Smart India Hackathon • <strong className="text-slate-300 font-semibold">SIH26108</strong></span>
        </div>

        <div className="flex items-center space-x-3 mt-0.5 sm:mt-0">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
            isBackendConnected 
              ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/50' 
              : 'text-amber-400 bg-amber-950/60 border border-amber-800/50'
          }`}>
            <Server className="w-2.5 h-2.5" />
            <span>{isBackendConnected ? 'FastAPI Service Live' : 'Client Inference Mode'}</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">v1.0-RC</span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-white">
                  IS Standard Advisor
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  BIS Intelligence
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                AI Recommendation Engine for Procurement Specs
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-xs border border-slate-700/80'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold font-mono ${
                      isActive ? 'bg-sky-900 text-sky-200' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Info */}
          <div className="hidden lg:flex items-center space-x-3 text-xs text-slate-300 border-l border-slate-800 pl-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">Er. Sachin Gupta</p>
              <p className="text-[10px] text-slate-400">Chief Verification Officer</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Mobile Nav Bar Overflow */}
        <div className="flex md:hidden space-x-1 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800 pt-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
