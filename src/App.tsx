/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LoanApplicationForm } from './components/applicant/LoanApplicationForm';
import { AssessmentResultView } from './components/applicant/AssessmentResultView';
import { ApplicationHistory } from './components/applicant/ApplicationHistory';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { RuleManager } from './components/admin/RuleManager';
import { EngineTestLab } from './components/admin/EngineTestLab';
import { LoginPortal } from './components/auth/LoginPortal';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { DEFAULT_RULES } from './data/defaultRules';
import { generateInitialHistory } from './data/sampleApplications';
import { ApplicationRecord, AuthUser, LoanApplicationInput, Rule } from './types';
import { runForwardChainingEngine } from './engine/inferenceEngine';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('credichain_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Knowledge Base Rules (Stored as Data, fully editable without touching engine)
  const [rules, setRules] = useState<Rule[]>(() => {
    const saved = localStorage.getItem('credichain_rules');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_RULES;
      }
    }
    return DEFAULT_RULES;
  });

  // Application History Records
  const [history, setHistory] = useState<ApplicationRecord[]>(() => {
    const saved = localStorage.getItem('credichain_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return generateInitialHistory();
      }
    }
    return generateInitialHistory();
  });

  // Navigation State
  const [currentRole, setCurrentRole] = useState<'applicant' | 'admin'>(() => {
    return currentUser?.role || 'applicant';
  });
  const [applicantTab, setApplicantTab] = useState<'apply' | 'history'>('apply');
  const [adminTab, setAdminTab] = useState<'dashboard' | 'rules' | 'testlab'>('dashboard');

  // Currently Active Evaluation (for inspection & immediate result display)
  const [currentEvaluation, setCurrentEvaluation] = useState<{
    input: LoanApplicationInput;
    result: any;
    recordId?: string;
  } | null>(null);

  const [isEvaluating, setIsEvaluating] = useState(false);

  // Auth Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem('credichain_session', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('credichain_session');
    setCurrentEvaluation(null);
  };

  const handleAdminElevationSuccess = (adminUser: AuthUser) => {
    setCurrentUser(adminUser);
    setCurrentRole('admin');
    localStorage.setItem('credichain_session', JSON.stringify(adminUser));
  };

  // Sync rules to localStorage
  const handleUpdateRule = (updatedRule: Rule) => {
    setRules((prev) => {
      const next = prev.map((r) => (r.id === updatedRule.id ? updatedRule : r));
      localStorage.setItem('credichain_rules', JSON.stringify(next));
      return next;
    });
  };

  const handleAddRule = (newRule: Rule) => {
    setRules((prev) => {
      const next = [...prev, newRule];
      localStorage.setItem('credichain_rules', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => {
      const next = prev.filter((r) => r.id !== ruleId);
      localStorage.setItem('credichain_rules', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleRuleActive = (ruleId: string) => {
    setRules((prev) => {
      const next = prev.map((r) =>
        r.id === ruleId ? { ...r, active: !r.active } : r
      );
      localStorage.setItem('credichain_rules', JSON.stringify(next));
      return next;
    });
  };

  const handleResetToDefaults = () => {
    setRules(DEFAULT_RULES);
    localStorage.setItem('credichain_rules', JSON.stringify(DEFAULT_RULES));
  };

  // Submit and execute forward chaining inference
  const handleSubmitApplication = (input: LoanApplicationInput) => {
    setIsEvaluating(true);

    // Initial working memory facts representation
    const initialFacts = {
      age: Number(input.age),
      monthly_income: Number(input.monthly_income),
      credit_score: Number(input.credit_score),
      employment_duration: Number(input.employment_duration),
      previous_default: Boolean(input.previous_default),
      debt_to_income_ratio: Number(input.debt_to_income_ratio),
      active_loans: Number(input.active_loans),
      requested_amount: Number(input.requested_amount),
    };

    setTimeout(() => {
      // Execute pure forward chaining inference
      const result = runForwardChainingEngine(initialFacts, rules);

      const recordId = `APP-2026-${1000 + history.length + 1}`;
      const newRecord: ApplicationRecord = {
        id: recordId,
        applicantId: `USR-${100 + history.length}`,
        applicantName: input.applicantName,
        input,
        inferenceResult: result,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('credichain_history', JSON.stringify(updatedHistory));

      setCurrentEvaluation({
        input,
        result,
        recordId,
      });

      setIsEvaluating(false);
    }, 280);
  };

  const handleSelectHistoryItem = (record: ApplicationRecord) => {
    setCurrentEvaluation({
      input: record.input,
      result: record.inferenceResult,
      recordId: record.id,
    });
    setCurrentRole('applicant');
    setApplicantTab('apply');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16">
      {/* Top Header & Role Switcher */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onRequestAdminLogin={() => setIsAdminModalOpen(true)}
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        applicantTab={applicantTab}
        onApplicantTabChange={(tab) => setApplicantTab(tab)}
        adminTab={adminTab}
        onAdminTabChange={(tab) => setAdminTab(tab)}
        totalApplications={history.length}
      />

      {/* Main App Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* If not logged in, show dedicated Login Portal */}
        {!currentUser ? (
          <LoginPortal
            initialPortal={currentRole === 'admin' ? 'admin' : 'applicant'}
            onLoginSuccess={handleLoginSuccess}
          />
        ) : (
          <>
            {/* APPLICANT ROLE VIEW */}
            {currentRole === 'applicant' && (
              <div>
                {applicantTab === 'apply' && (
                  <div>
                    {currentEvaluation ? (
                      <AssessmentResultView
                        applicationInput={currentEvaluation.input}
                        result={currentEvaluation.result}
                        onReset={() => setCurrentEvaluation(null)}
                        onViewHistory={() => setApplicantTab('history')}
                      />
                    ) : (
                      <LoanApplicationForm
                        onSubmitApplication={handleSubmitApplication}
                        isEvaluating={isEvaluating}
                        currentUserName={currentUser.name}
                      />
                    )}
                  </div>
                )}

                {applicantTab === 'history' && (
                  <ApplicationHistory
                    history={history}
                    onSelectApplication={handleSelectHistoryItem}
                    onNewApplicationClick={() => {
                      setCurrentEvaluation(null);
                      setApplicantTab('apply');
                    }}
                  />
                )}
              </div>
            )}

            {/* ADMIN ROLE VIEW */}
            {currentRole === 'admin' && (
              <div>
                {adminTab === 'dashboard' && (
                  <AdminDashboard
                    history={history}
                    rules={rules}
                    onSelectApplication={handleSelectHistoryItem}
                    onNavigateToRules={() => setAdminTab('rules')}
                    onNavigateToTestLab={() => setAdminTab('testlab')}
                  />
                )}

                {adminTab === 'rules' && (
                  <RuleManager
                    rules={rules}
                    onUpdateRule={handleUpdateRule}
                    onAddRule={handleAddRule}
                    onDeleteRule={handleDeleteRule}
                    onToggleRuleActive={handleToggleRuleActive}
                    onResetToDefaults={handleResetToDefaults}
                  />
                )}

                {adminTab === 'testlab' && (
                  <EngineTestLab currentRules={rules} />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Admin Elevation Modal (for applicants attempting to access Admin Panel) */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onSuccess={handleAdminElevationSuccess}
      />
    </div>
  );
}

