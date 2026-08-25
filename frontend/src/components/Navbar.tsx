import React, { useState } from 'react';
import { 
  ShieldCheck, 
  User, 
  Sun, 
  Moon,
  Menu,
  X,
  ChevronDown,
  Check
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
  { name: 'Dr. Ananya Sen', role: 'Senior Standards Auditor', department: 'Bureau of Indian Standards' },
  { name: 'Col. Vikram Singh', role: 'Director Procurement & Logistics', department: 'Ministry of Defence Procurement Cell' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleDarkMode,
  officerProfile,
  onUpdateOfficerProfile
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
      department: editDept.trim() || 'Technical Bureau'
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsProfileModalOpen(false);
    }, 500);
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
    }, 500);
  };

  return (
    <>
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-lg">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">


          <div className="flex items-center justify-between h-16">
            {/* Left: Branding */}
            <div 
              className="flex items-center space-x-3 cursor-pointer select-none shrink-0"
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200">
                <ShieldCheck className="w-5 h-5 text-slate-300" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block">
                  IS Standard Advisor
                </span>
                <p className="text-xs text-slate-400 font-normal hidden sm:block">
                  BIS Public Procurement Portal
                </p>
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-0.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>

              {/* Mobile Hamburger Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(prev => !prev)}
                className="md:hidden p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Officer Profile Button */}
              <button
                onClick={() => {
                  setEditName(officerProfile.name);
                  setEditRole(officerProfile.role);
                  setEditDept(officerProfile.department);
                  setIsProfileModalOpen(true);
                }}
                className="flex items-center space-x-2 pl-3 border-l border-slate-800 hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors group"
                title="Click to manage officer credentials"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center font-medium text-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-semibold text-white leading-none">
                      {officerProfile.name}
                    </p>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-none max-w-[160px] truncate">
                    {officerProfile.role}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-slate-800 space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
              
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>Officer: {officerProfile.name}</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Officer Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center font-medium">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Verification Officer Profile</h3>
                  <p className="text-[10px] text-slate-400">Statutory Signoff Credentials</p>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Officer Designation Presets
                </label>
                <div className="space-y-1.5">
                  {PRESET_OFFICERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        officerProfile.name === preset.name
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 text-slate-900 dark:text-slate-100 font-semibold'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">{preset.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{preset.role} • {preset.department.split(',')[0]}</div>
                      </div>
                      {officerProfile.name === preset.name && (
                        <Check className="w-4 h-4 text-slate-700 dark:text-slate-300 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Custom Credentials
                </label>

                <div>
                  <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Department / Ministry
                  </label>
                  <input
                    type="text"
                    required
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-medium focus:ring-1 focus:ring-slate-700 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  {savedSuccess ? (
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Saved
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Used for official signoff audit trail</span>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsProfileModalOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium rounded-lg text-xs"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold rounded-lg text-xs"
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
