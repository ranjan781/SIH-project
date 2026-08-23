import React from 'react';
import { 
  ShieldCheck, 
  Bell, 
  User, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import type { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBackendConnected: boolean;
  hasActiveResult: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  hasActiveResult,
  isDarkMode,
  toggleDarkMode
}) => {
  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analyze', label: 'Tender Analysis' },
    { id: 'recommendation', label: 'Recommendations' },
    { id: 'standards', label: 'Standards Explorer' },
    { id: 'comparison', label: 'Comparison' },
    { id: 'pipeline', label: 'AI Pipeline' },
    { id: 'research', label: 'Research & Paper' },
    { id: 'audit', label: 'Audit Log' },
  ];

  return (
    <header className="bg-[#0b1329] text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Shield Logo & Brand Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  IS Standard Advisor
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                AI Standards Intelligence for Public Procurement
              </p>
            </div>
          </div>

          {/* Center: Navigation Tabs with active underline indicator */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/40 rounded-md'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-blue-500 rounded-full shadow-sm shadow-blue-500/50"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Engine Status, Bright/Dark Mode Toggle, Notifications & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* AI Engine Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-[11px] font-medium font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>AI Engine Online</span>
            </div>

            {/* Bright / Dark Mode Toggle Switch (Sun - Toggle - Moon) */}
            <div className="flex items-center space-x-1.5 bg-slate-800/70 border border-slate-700/80 px-2 py-1 rounded-full">
              <Sun className={`w-3.5 h-3.5 ${!isDarkMode ? 'text-amber-400' : 'text-slate-400'}`} />
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label="Toggle bright and dark mode"
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  isDarkMode ? 'bg-blue-600 justify-end' : 'bg-slate-600 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200" />
              </button>
              <Moon className={`w-3.5 h-3.5 ${isDarkMode ? 'text-sky-300' : 'text-slate-400'}`} />
            </div>

            {/* Notification Bell with Badge count */}
            <div className="relative cursor-pointer p-1 text-slate-300 hover:text-white transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center shadow-xs">
                3
              </span>
            </div>

            {/* User Profile Info */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
                <User className="w-4 h-4 text-slate-700" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-200 leading-none">Er. Sachin Gupta</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Verification Officer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="flex xl:hidden space-x-1 overflow-x-auto pb-2 pt-1 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 text-[11px] font-medium whitespace-nowrap rounded ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
