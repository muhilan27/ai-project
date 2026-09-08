import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  DollarSign, 
  FileCheck2, 
  Zap, 
  HelpCircle, 
  ChevronRight,
  RefreshCw,
  Code2
} from 'lucide-react';
import { LoanApplicationInput } from '../../types';
import { APPLICANT_PRESETS, ApplicantPreset } from '../../data/sampleApplications';

interface LoanApplicationFormProps {
  onSubmitApplication: (input: LoanApplicationInput) => void;
  isEvaluating: boolean;
  currentUserName?: string;
}

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  onSubmitApplication,
  isEvaluating,
  currentUserName,
}) => {
  const [formData, setFormData] = useState<LoanApplicationInput>({
    applicantName: currentUserName || 'Elena Rostova',
    age: 34,
    monthly_income: 52000,
    credit_score: 765,
    employment_duration: 4.5,
    previous_default: false,
    debt_to_income_ratio: 26,
    active_loans: 1,
    requested_amount: 350000,
    loan_tenure_months: 60,
    loan_purpose: 'Home Renovation & Modernization',
    marital_status: 'Married',
    dependents: 1,
  });

  const [activeSection, setActiveSection] = useState<'personal' | 'employment' | 'financial' | 'requested'>('personal');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('prime_eligible');
  const [showFactsJson, setShowFactsJson] = useState<boolean>(false);

  const handleApplyPreset = (preset: ApplicantPreset) => {
    setSelectedPresetId(preset.id);
    setFormData({ ...preset.data });
  };

  const handleInputChange = (field: keyof LoanApplicationInput, value: any) => {
    setSelectedPresetId('custom');
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitApplication(formData);
  };

  // The generated working memory facts object that will be supplied to forward chaining
  const workingMemoryFactsPreview = {
    age: Number(formData.age),
    monthly_income: Number(formData.monthly_income),
    credit_score: Number(formData.credit_score),
    employment_duration: Number(formData.employment_duration),
    previous_default: Boolean(formData.previous_default),
    debt_to_income_ratio: Number(formData.debt_to_income_ratio),
    active_loans: Number(formData.active_loans),
    requested_amount: Number(formData.requested_amount),
  };

  return (
    <div className="space-y-6">
      {/* Top Test Bench Presets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Instant Test Profiles (3 Canonical Outcomes)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click a profile to pre-fill input facts and test the forward-chaining decision outcomes:
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowFactsJson(!showFactsJson)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            {showFactsJson ? 'Hide Working Memory Facts' : 'Inspect Input Facts JSON'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {APPLICANT_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const badgeColor =
              preset.expectedOutcome === 'ELIGIBLE'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : preset.expectedOutcome === 'CONDITIONALLY_ELIGIBLE'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm text-slate-100">{preset.label}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-full ${badgeColor}`}>
                    {preset.expectedOutcome}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
                <div className="mt-2 text-[11px] font-mono text-slate-300 flex flex-wrap gap-x-2 gap-y-1">
                  <span>Score: {preset.data.credit_score}</span>
                  <span>•</span>
                  <span>Inc: ${preset.data.monthly_income.toLocaleString()}</span>
                  <span>•</span>
                  <span>DTI: {preset.data.debt_to_income_ratio}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Working Memory Facts JSON preview */}
        {showFactsJson && (
          <div className="mt-4 p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs">
            <div className="text-slate-400 mb-1 flex items-center justify-between">
              <span>WORKING_MEMORY_INITIAL_FACTS:</span>
              <span className="text-[10px] text-indigo-400">Fed directly to inference engine loop</span>
            </div>
            <pre className="text-cyan-300 overflow-x-auto p-2 bg-slate-900/80 rounded">
              {JSON.stringify(workingMemoryFactsPreview, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Main Loan Application Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Section Navigation Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-800 bg-slate-950/70 p-2 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSection('personal')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition ${
              activeSection === 'personal'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            1. Personal Info
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('employment')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition ${
              activeSection === 'employment'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            2. Employment
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('financial')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition ${
              activeSection === 'financial'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            3. Financial & Credit
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('requested')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-medium transition ${
              activeSection === 'requested'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            4. Loan Request
          </button>
        </div>

        <div className="p-6">
          {/* 1. PERSONAL INFO SECTION */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-white">Personal & Demographics</h3>
                <p className="text-xs text-slate-400">Maps to core demographic rules (e.g. Rule R1: Age 21–60)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.applicantName}
                    onChange={(e) => handleInputChange('applicantName', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Age (Years) <span className="text-indigo-400 font-mono text-[11px]">[fact: age]</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Rule R1 requires 21–60</span>
                  </div>
                  <input
                    type="number"
                    min={18}
                    max={100}
                    required
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Marital Status
                  </label>
                  <select
                    value={formData.marital_status}
                    onChange={(e) => handleInputChange('marital_status', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Number of Dependents
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={formData.dependents}
                    onChange={(e) => handleInputChange('dependents', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. EMPLOYMENT SECTION */}
          {activeSection === 'employment' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-white">Employment & Career Tenure</h3>
                <p className="text-xs text-slate-400">Maps to occupational stability rules (e.g. Rule R4: employment_duration &gt;= 2)</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Employment Duration (Years) <span className="text-indigo-400 font-mono text-[11px]">[fact: employment_duration]</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Rule R4 requires &gt;= 2.0</span>
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={50}
                    required
                    value={formData.employment_duration}
                    onChange={(e) => handleInputChange('employment_duration', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Employment Type
                  </label>
                  <select
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    defaultValue="Full-Time Corporate"
                  >
                    <option value="Full-Time Corporate">Full-Time Salaried (Corporate)</option>
                    <option value="Government Service">Government / Public Sector</option>
                    <option value="Self-Employed">Self-Employed / Business Owner</option>
                    <option value="Contract / Freelance">Contractor / Freelance</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. FINANCIAL SECTION */}
          {activeSection === 'financial' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-white">Financial Facts & Credit Risk Parameters</h3>
                <p className="text-xs text-slate-400">Key facts for base mandatory rules R2, R3, R5, R6 and advisory R8</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Monthly Income ($) <span className="text-indigo-400 font-mono text-[11px]">[fact: monthly_income]</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Rule R2 &gt;= 30,000</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={formData.monthly_income}
                    onChange={(e) => handleInputChange('monthly_income', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Credit Score (FICO) <span className="text-indigo-400 font-mono text-[11px]">[fact: credit_score]</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Rule R3 &gt;= 700</span>
                  </div>
                  <input
                    type="number"
                    min={300}
                    max={850}
                    required
                    value={formData.credit_score}
                    onChange={(e) => handleInputChange('credit_score', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Debt-to-Income Ratio (%) <span className="text-indigo-400 font-mono text-[11px]">[fact: debt_to_income_ratio]</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Rule R6 &lt;= 40%</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={formData.debt_to_income_ratio}
                    onChange={(e) => handleInputChange('debt_to_income_ratio', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Active Existing Loans <span className="text-indigo-400 font-mono text-[11px]">[fact: active_loans]</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Advisory R8 &lt;= 2</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={15}
                    required
                    value={formData.active_loans}
                    onChange={(e) => handleInputChange('active_loans', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2 bg-slate-950/90 border border-slate-800 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                        <span>Previous Loan Default Record</span>
                        <span className="text-indigo-400 font-mono text-[11px]">[fact: previous_default]</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mandatory Rule R5 requires <code className="text-emerald-400">previous_default == false</code>
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.previous_default}
                        onChange={(e) => handleInputChange('previous_default', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                      <span className="ml-2 text-xs font-mono text-slate-300">
                        {formData.previous_default ? (
                          <span className="text-rose-400 font-bold">YES (Default Recorded)</span>
                        ) : (
                          <span className="text-emerald-400 font-bold">NO (Clean History)</span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. REQUESTED LOAN SECTION */}
          {activeSection === 'requested' && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-semibold text-white">Requested Loan Details</h3>
                <p className="text-xs text-slate-400">Specifies requested principal and repayment tenure</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Requested Amount ($) <span className="text-indigo-400 font-mono text-[11px]">[fact: requested_amount]</span>
                  </label>
                  <input
                    type="number"
                    min={5000}
                    max={2000000}
                    step={5000}
                    required
                    value={formData.requested_amount}
                    onChange={(e) => handleInputChange('requested_amount', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tenure (Months)
                  </label>
                  <select
                    value={formData.loan_tenure_months}
                    onChange={(e) => handleInputChange('loan_tenure_months', Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                    <option value={48}>48 Months (4 Years)</option>
                    <option value={60}>60 Months (5 Years)</option>
                    <option value={84}>84 Months (7 Years)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Loan Purpose
                  </label>
                  <input
                    type="text"
                    value={formData.loan_purpose}
                    onChange={(e) => handleInputChange('loan_purpose', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Home purchase, Debt consolidation, Working capital"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Forward chaining runs iterative passes until fixpoint (Aggregator R7 evaluated first).</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {activeSection !== 'personal' && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'requested') setActiveSection('financial');
                    else if (activeSection === 'financial') setActiveSection('employment');
                    else if (activeSection === 'employment') setActiveSection('personal');
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                >
                  Previous Section
                </button>
              )}

              {activeSection !== 'requested' ? (
                <button
                  type="button"
                  onClick={() => {
                    if (activeSection === 'personal') setActiveSection('employment');
                    else if (activeSection === 'employment') setActiveSection('financial');
                    else if (activeSection === 'financial') setActiveSection('requested');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : null}

              <button
                id="submit-loan-evaluation-btn"
                type="submit"
                disabled={isEvaluating}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-900/30 transition disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Forward Chaining Passes...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Run Inference Engine & Assess</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
