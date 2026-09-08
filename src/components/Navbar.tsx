import React from 'react';
import { 
  GitFork, 
  Layers, 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  History, 
  Sliders, 
  Beaker,
  Sparkles,
  LogOut,
  User,
  Lock
} from 'lucide-react';
import { AuthUser } from '../types';

interface NavbarProps {
  currentUser: AuthUser | null;
  onLogout: () => void;
  onRequestAdminLogin: () => void;
  currentRole: 'applicant' | 'admin';
  onRoleChange: (role: 'applicant' | 'admin') => void;
  applicantTab: 'apply' | 'history';
  onApplicantTabChange: (tab: 'apply' | 'history') => void;
  adminTab: 'dashboard' | 'rules' | 'testlab';
  onAdminTabChange: (tab: 'dashboard' | 'rules' | 'testlab') => void;
  totalApplications: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onRequestAdminLogin,
  currentRole,
  onRoleChange,
  applicantTab,
  onApplicantTabChange,
  adminTab,
  onAdminTabChange,
  totalApplications,
}) => {
  const handleAdminClick = () => {
    if (currentUser?.role === 'admin') {
      onRoleChange('admin');
    } else {
      // Prompt admin login
      onRequestAdminLogin();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and System Identification */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-950/50 shrink-0">
              <GitFork className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">CrediChain AI</span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Forward Chaining Expert System
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Multi-Pass Inference Engine with Explainability Trails</p>
            </div>
          </div>

          {/* Navigation Controls and Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Engine Multi-Pass Proof Tag */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 text-xs font-mono bg-slate-800/80 border border-slate-700 rounded-lg text-emerald-400">
              <Layers className="w-3.5 h-3.5" />
              <span>R7 Aggregator First • Multi-Pass Active</span>
            </div>

            {/* Role Switcher Pill */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center shadow-inner">
              <button
                id="role-switch-applicant"
                type="button"
                onClick={() => onRoleChange('applicant')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentRole === 'applicant'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Applicant Portal</span>
                <span className="xs:hidden">Applicant</span>
              </button>
              <button
                id="role-switch-admin"
                type="button"
                onClick={handleAdminClick}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentRole === 'admin'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
                title={currentUser?.role !== 'admin' ? 'Requires Admin Credentials' : ''}
              >
                {currentUser?.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="hidden xs:inline">Admin Panel</span>
                <span className="xs:hidden">Admin</span>
              </button>
            </div>

            {/* Authenticated User Pill / Logout */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
                <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-white text-[11px] ${
                    currentUser.role === 'admin' ? 'bg-cyan-600' : 'bg-indigo-600'
                  }`}>
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-semibold text-white leading-tight flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      <span className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                        currentUser.role === 'admin' 
                          ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700' 
                          : 'bg-indigo-950/80 text-indigo-300 border-indigo-700'
                      }`}>
                        {currentUser.role.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ID: <span className="text-slate-300">@{currentUser.userId}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-logout"
                  onClick={onLogout}
                  className="p-2 bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-700 hover:border-rose-700 transition"
                  title="Sign Out / Switch Portal Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-Navigation Bar for active role */}
        <div className="flex items-center justify-between py-2 border-t border-slate-800/60 text-xs overflow-x-auto">
          {currentRole === 'applicant' ? (
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="applicant-tab-apply"
                type="button"
                onClick={() => onApplicantTabChange('apply')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  applicantTab === 'apply'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                New Loan Application
              </button>
              <button
                id="applicant-tab-history"
                type="button"
                onClick={() => onApplicantTabChange('history')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  applicantTab === 'history'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Application History ({totalApplications})
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <button
                id="admin-tab-dashboard"
                type="button"
                onClick={() => onAdminTabChange('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  adminTab === 'dashboard'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Underwriting Analytics
              </button>
              <button
                id="admin-tab-rules"
                type="button"
                onClick={() => onAdminTabChange('rules')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  adminTab === 'rules'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Knowledge Base & Rules (CRUD)
              </button>
              <button
                id="admin-tab-testlab"
                type="button"
                onClick={() => onAdminTabChange('testlab')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  adminTab === 'testlab'
                    ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Beaker className="w-3.5 h-3.5" />
                Multi-Pass Engine Test Lab
              </button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-slate-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pure Client-Side In-Memory Engine</span>
          </div>
        </div>
      </div>
    </header>
  );
};

