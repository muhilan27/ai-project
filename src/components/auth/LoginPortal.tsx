import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  GitFork,
  Sparkles,
  Layers,
  UserPlus
} from 'lucide-react';
import { AuthUser } from '../../types';
import { authenticateUser, saveAccount, getStoredAccounts } from '../../data/mockUsers';

interface LoginPortalProps {
  initialPortal?: 'applicant' | 'admin';
  onLoginSuccess: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  initialPortal = 'applicant',
  onLoginSuccess,
  onCancel,
}) => {
  const [activePortal, setActivePortal] = useState<'applicant' | 'admin'>(initialPortal);
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  
  // Credentials
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Registration fields (for new applicants)
  const [regUserId, setRegUserId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessMsg, setRegSuccessMsg] = useState<string | null>(null);

  // Quick fill helper
  const handleQuickFill = (u: string, p: string) => {
    setUserId(u);
    setPassword(p);
    setErrorMsg(null);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!userId.trim()) {
      setErrorMsg('Please enter your User ID or Email.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your Password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const authResult = authenticateUser(userId, password, activePortal);
      setLoading(false);

      if (authResult.success && authResult.user) {
        onLoginSuccess(authResult.user);
      } else {
        setErrorMsg(authResult.message || 'Authentication failed. Please check credentials.');
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setRegSuccessMsg(null);

    if (!regUserId.trim()) {
      setErrorMsg('Please choose a User ID.');
      return;
    }
    if (!regName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMsg('Password must be at least 4 characters.');
      return;
    }

    const accounts = getStoredAccounts();
    if (accounts.some((a) => a.userId.toLowerCase() === regUserId.trim().toLowerCase())) {
      setErrorMsg(`User ID "${regUserId}" is already taken. Please choose another.`);
      return;
    }

    saveAccount({
      id: `USR-APP-${Date.now().toString().slice(-4)}`,
      userId: regUserId.trim().toLowerCase(),
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      role: 'applicant',
      title: 'Applicant Account',
    });

    setRegSuccessMsg(`Account created for ${regName}! You can now sign in.`);
    setUserId(regUserId.trim().toLowerCase());
    setPassword(regPassword);
    setMode('signin');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-xl">
        {/* System branding banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-xl shadow-indigo-950/60 mb-3 border border-indigo-400/30">
            <GitFork className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            CrediChain Authentication Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Role-Based Access Control for Multi-Pass Loan Inference & Knowledge Base Administration
          </p>
        </div>

        {/* Portal Switcher Tabs */}
        <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-xl flex mb-5">
          <button
            type="button"
            onClick={() => {
              setActivePortal('applicant');
              setMode('signin');
              setErrorMsg(null);
              setUserId('');
              setPassword('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activePortal === 'applicant'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 border border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Applicant Portal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActivePortal('admin');
              setMode('signin');
              setErrorMsg(null);
              setUserId('');
              setPassword('');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activePortal === 'admin'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40 border border-cyan-400/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin / Underwriter Portal</span>
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Portal Glow */}
          <div
            className={`absolute top-0 right-0 w-64 h-64 blur-3xl opacity-15 pointer-events-none rounded-full ${
              activePortal === 'admin' ? 'bg-cyan-400' : 'bg-indigo-500'
            }`}
          />

          {/* Portal Header Information */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    activePortal === 'admin'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                  }`}
                >
                  {activePortal === 'admin' ? 'RESTRICTED ADMIN ACCESS' : 'APPLICANT ACCESS'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-1">
                {activePortal === 'admin'
                  ? 'Underwriting Knowledge Base Administrator'
                  : mode === 'signin'
                  ? 'Sign In to Loan Assessment'
                  : 'Create Applicant Account'}
              </h2>
            </div>

            {activePortal === 'applicant' && (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'register' : 'signin');
                  setErrorMsg(null);
                  setRegSuccessMsg(null);
                }}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                {mode === 'signin' ? '+ New Applicant?' : 'Existing Sign In'}
              </button>
            )}
          </div>

          {/* Feedback banners */}
          {regSuccessMsg && (
            <div className="mb-5 p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{regSuccessMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              {/* User ID Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  User ID or Registered Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="login-user-id"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder={
                      activePortal === 'admin'
                        ? 'Enter admin User ID (e.g. admin)'
                        : 'Enter applicant User ID (e.g. applicant)'
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Account Password
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Encrypted In-Memory</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      activePortal === 'admin'
                        ? 'Enter admin password (e.g. admin123)'
                        : 'Enter applicant password (e.g. applicant123)'
                    }
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition font-mono"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                id="btn-submit-login"
                disabled={loading}
                className={`w-full mt-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 text-white shadow-lg transition-all ${
                  activePortal === 'admin'
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-cyan-950/50'
                    : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-indigo-950/50'
                } disabled:opacity-50`}
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>
                      {activePortal === 'admin' ? 'Authenticate into Admin Portal' : 'Sign In as Applicant'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* APPLICANT REGISTRATION FORM */}
          {mode === 'register' && activePortal === 'applicant' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Choose User ID</label>
                  <input
                    type="text"
                    value={regUserId}
                    onChange={(e) => setRegUserId(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">Full Legal Name</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. john.doe@example.com"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">Create Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register & Ready to Sign In</span>
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Preset Demo Credentials (Click to Autofill):</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Instant One-Click</span>
            </div>

            {activePortal === 'admin' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  id="preset-admin-1"
                  onClick={() => handleQuickFill('admin', 'admin123')}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                      Chief Underwriter
                    </span>
                    <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
                      ADMIN
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    User: <span className="text-cyan-300 font-bold">admin</span> • Pass:{' '}
                    <span className="text-slate-300 font-bold">admin123</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="preset-admin-2"
                  onClick={() => handleQuickFill('underwriter', 'underwriter123')}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-left transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300">
                      Dr. Julian Reed
                    </span>
                    <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
                      RISK ANALYST
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    User: <span className="text-cyan-300 font-bold">underwriter</span> • Pass:{' '}
                    <span className="text-slate-300 font-bold">underwriter123</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  id="preset-app-1"
                  onClick={() => handleQuickFill('applicant', 'applicant123')}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                    Elena Rostova
                  </div>
                  <div className="text-[10px] text-emerald-400">Prime Profile</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    <span className="text-indigo-300 font-bold">applicant</span> / applicant123
                  </div>
                </button>

                <button
                  type="button"
                  id="preset-app-2"
                  onClick={() => handleQuickFill('marcus', 'marcus123')}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                    Marcus Vance
                  </div>
                  <div className="text-[10px] text-amber-400">Borderline Profile</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    <span className="text-indigo-300 font-bold">marcus</span> / marcus123
                  </div>
                </button>

                <button
                  type="button"
                  id="preset-app-3"
                  onClick={() => handleQuickFill('sarah', 'sarah123')}
                  className="p-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-xl text-left transition group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300">
                    Sarah Jenkins
                  </div>
                  <div className="text-[10px] text-rose-400">High Risk Profile</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    <span className="text-indigo-300 font-bold">sarah</span> / sarah123
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Footnote on RBAC */}
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Forward Chaining Rule Engine RBAC</span>
            </span>
            <span>Client-Side In-Memory Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
