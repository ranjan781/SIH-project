import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Sun, 
  Moon,
  Activity,
  Menu,
  X,
  ChevronDown,
  Edit3,
  Check,
  Building2,
  Award
} from 'lucide-react';
import type { ActiveTab, OfficerProfile } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isBackendConnected: boolean;
  hasActiveResult: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  officerProfile: OfficerProfile;
  onUpdateOfficerProfile: (profile: OfficerProfile) => void;
}

const PRESET_OFFICERS: OfficerProfile[] = [
  { name: 'Er. Sachin Gupta', role: 'Chief Procurement Verification Officer', department: 'CPWD Central Office, New Delhi' },
  { name: 'Shri R. K. Sharma', role: 'Executive Engineer (Technical)', department: 'National Highways Authority of India (NHAI)' },
  { name: 'Dr. Ananya Sen', role: 'Senior Standards Auditor', department: 'Bureau of Indian Standards (BIS Committee)' },
  { name: 'Col. Vikram Singh', role: 'Director Procurement & Logistics', department: 'Ministry of Defence Procurement Cell' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  hasActiveResult,
  isDarkMode,
  toggleDarkMode,
  officerProfile,
  onUpdateOfficerProfile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(officerProfile.name);
  const [editRole, setEditRole] = useState(officerProfile.role);
  const [editDept, setEditDept] = useState(officerProfile.department);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'analyze', label: 'Tender Analysis' },
    { id: 'recommendation', label: 'Recommendations' },
    { id: 'standards', label: 'Standards Explorer' },
    { id: 'comparison', label: 'Clause Matrix' },
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOfficerProfile({
      name: editName.trim() || 'Verification Officer',
      role: editRole.trim() || 'Procurement Officer',
      department: editDept.trim() || 'SIH Bureau'
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 600);
  };

  const handleSelectPreset = (preset: OfficerProfile) => {
    setEditName(preset.name);
    setEditRole(preset.role);
    setEditDept(preset.department);
    onUpdateOfficerProfile(preset);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 600);
  };

  return (
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo & Brand */}
            <div 
              className="flex items-center space-x-3 cursor-pointer select-none shrink-0"
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-white">
                    IS Standard Advisor
                  </span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
                    Govt AI Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Bureau of Indian Standards Public Procurement Verification
                </p>
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Right Controls */}
            <div className="flex items-center space-x-3 shrink-0">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>


              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="md:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Functional User Profile Button */}
              <button
                onClick={() => {
                  setEditName(officerProfile.name);
                  setEditRole(officerProfile.role);
                  setEditDept(officerProfile.department);
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center space-x-2.5 pl-3 border-l border-slate-800 hover:bg-slate-800/80 p-1.5 rounded-xl transition-all group"
                title="Click to view & edit officer details"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white border border-blue-400 flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-white leading-none group-hover:text-blue-300 transition-colors">
                      {officerProfile.name}
                    </p>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-none max-w-[140px] truncate">
                    {officerProfile.role}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-800 space-y-1 animate-fadeIn">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              
              {/* Mobile Officer Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl text-blue-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Officer Profile: {officerProfile.name}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Verification Officer Interactive Modal / Popover */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Verification Officer Settings</h3>
                  <p className="text-[11px] text-slate-400">Statutory Signoff & Identity Management</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form & Presets */}
            <div className="p-6 space-y-5 text-xs">

              {/* Quick Officer Role Presets */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Quick Select Designation Presets
                </label>
                <div className="space-y-1.5">
                  {PRESET_OFFICERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        officerProfile.name === preset.name
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-200 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{preset.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{preset.role} • {preset.department.split(',')[0]}</div>
                      </div>
                      {officerProfile.name === preset.name && (
                        <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Custom Officer Credentials
                </label>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Officer Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="e.g. Er. Sachin Gupta"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    placeholder="e.g. Chief Procurement Officer"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department / Bureau
                  </label>
                  <input
                    type="text"
                    required
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    placeholder="e.g. CPWD Technical Office"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {savedSuccess ? (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Profile Updated!
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Used for all signoff certificates</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
