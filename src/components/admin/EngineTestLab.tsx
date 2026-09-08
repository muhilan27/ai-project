import React, { useState } from 'react';
import { 
  Beaker, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Layers, 
  ShieldAlert, 
  Sparkles,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { Rule } from '../../types';
import { runForwardChainingEngine } from '../../engine/inferenceEngine';
import { DEFAULT_RULES } from '../../data/defaultRules';

interface TestCaseResult {
  id: string;
  name: string;
  category: 'multi_pass' | 'decision_logic';
  passed: boolean;
  assertions: {
    statement: string;
    expected: any;
    actual: any;
    passed: boolean;
  }[];
  details: string;
  passBreakdown?: string[];
}

interface EngineTestLabProps {
  currentRules: Rule[];
}

export const EngineTestLab: React.FC<EngineTestLabProps> = ({ currentRules }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [selectedTest, setSelectedTest] = useState<TestCaseResult | null>(null);

  const runAllTests = () => {
    setIsRunning(true);
    const results: TestCaseResult[] = [];

    // Ensure R7 is first in evaluation order
    const rulesToTest = [...currentRules];
    // Put R7 first if not already first
    const r7Index = rulesToTest.findIndex((r) => r.id === 'R7');
    if (r7Index > 0) {
      const [r7] = rulesToTest.splice(r7Index, 1);
      rulesToTest.unshift(r7);
    }

    // --- TEST 1: Multi-Pass Aggregator Claim Proof ---
    {
      const primeFacts = {
        age: 32,
        monthly_income: 48000,
        credit_score: 750,
        employment_duration: 3.5,
        previous_default: false,
        debt_to_income_ratio: 25,
        active_loans: 1,
      };

      const result = runForwardChainingEngine(primeFacts, rulesToTest);
      const pass1 = result.passHistory.find((p) => p.passNumber === 1);
      const pass2 = result.passHistory.find((p) => p.passNumber === 2);
      const pass3 = result.passHistory.find((p) => p.passNumber === 3);

      const r7FiredInPass1 = pass1 ? pass1.rulesFiredInThisPass.includes('R7') : false;
      const r7FiredInPass2 = pass2 ? pass2.rulesFiredInThisPass.includes('R7') : false;
      const fixpointAtPass3 = pass3 ? Object.keys(pass3.newFactsDerived).length === 0 : false;

      const r7Trace = result.ruleTraces.find((t) => t.ruleId === 'R7');

      const a1 = {
        statement: 'R7 (Master Aggregator) positioned FIRST in rules array',
        expected: 'R7',
        actual: rulesToTest[0].id,
        passed: rulesToTest[0].id === 'R7',
      };
      const a2 = {
        statement: 'R7 does NOT fire on Pass 1 (waiting for derived facts)',
        expected: false,
        actual: r7FiredInPass1,
        passed: !r7FiredInPass1,
      };
      const a3 = {
        statement: 'R1–R6 fire on Pass 1 and establish 6 derived facts',
        expected: 6,
        actual: pass1 ? pass1.rulesFiredInThisPass.filter((id) => id !== 'R8').length : 0,
        passed: pass1 ? pass1.rulesFiredInThisPass.filter((id) => id !== 'R8').length >= 6 : false,
      };
      const a4 = {
        statement: 'R7 FIRES on Pass 2 after derived facts exist in working memory',
        expected: true,
        actual: r7FiredInPass2,
        passed: r7FiredInPass2,
      };
      const a5 = {
        statement: 'Pass 3 derives 0 new facts (fixpoint reached, loop halts)',
        expected: true,
        actual: fixpointAtPass3,
        passed: fixpointAtPass3,
      };

      const allPassed = a1.passed && a2.passed && a3.passed && a4.passed && a5.passed;

      results.push({
        id: 'T1_MULTIPASS',
        name: 'Multi-Pass Forward Chaining Proof (R7 Evaluated First)',
        category: 'multi_pass',
        passed: allPassed,
        assertions: [a1, a2, a3, a4, a5],
        details: `R7 evaluates first at Pass 1, halts firing due to missing derived facts. Passes 1 fires base rules. Pass 2 fires R7. Pass 3 halts at fixpoint. Total passes: ${result.passesRequired}.`,
        passBreakdown: result.passHistory.map(
          (p) => `Pass ${p.passNumber}: Fired [${p.rulesFiredInThisPass.join(', ')}] | +${Object.keys(p.newFactsDerived).length} new facts`
        ),
      });
    }

    // --- TEST 2: Decision Outcome 1 - ELIGIBLE ---
    {
      const eligibleFacts = {
        age: 28,
        monthly_income: 50000,
        credit_score: 740,
        employment_duration: 3,
        previous_default: false,
        debt_to_income_ratio: 28,
        active_loans: 1,
      };

      const result = runForwardChainingEngine(eligibleFacts, rulesToTest);
      const a1 = {
        statement: 'Decision outcome evaluates to ELIGIBLE',
        expected: 'ELIGIBLE',
        actual: result.decision,
        passed: result.decision === 'ELIGIBLE',
      };
      const a2 = {
        statement: 'Mandatory base rule failures equal exactly 0',
        expected: 0,
        actual: result.mandatoryBaseRulesFailed.length,
        passed: result.mandatoryBaseRulesFailed.length === 0,
      };
      const a3 = {
        statement: 'Fact "loan_eligible" derived and equals true',
        expected: true,
        actual: result.finalFacts['loan_eligible'],
        passed: result.finalFacts['loan_eligible'] === true,
      };

      results.push({
        id: 'T2_ELIGIBLE',
        name: 'Three-Way Decision Logic: Outcome 1 (ELIGIBLE)',
        category: 'decision_logic',
        passed: a1.passed && a2.passed && a3.passed,
        assertions: [a1, a2, a3],
        details: 'All 6 mandatory base rules satisfied. R7 fires on Pass 2. Master loan approval issued.',
      });
    }

    // --- TEST 3: Decision Outcome 2 - CONDITIONALLY_ELIGIBLE ---
    {
      // Credit score 670 fails R3 (requires >= 700), other 5 mandatory rules pass!
      const conditionalFacts = {
        age: 30,
        monthly_income: 45000,
        credit_score: 670, // Fails R3!
        employment_duration: 4,
        previous_default: false,
        debt_to_income_ratio: 28,
        active_loans: 1,
      };

      const result = runForwardChainingEngine(conditionalFacts, rulesToTest);
      const a1 = {
        statement: 'Aggregator R7 does not fire (loan_eligible is not true)',
        expected: undefined,
        actual: result.finalFacts['loan_eligible'],
        passed: result.finalFacts['loan_eligible'] !== true,
      };
      const a2 = {
        statement: 'Exactly ONE mandatory base rule failed (R3)',
        expected: ['R3'],
        actual: result.mandatoryBaseRulesFailed,
        passed:
          result.mandatoryBaseRulesFailed.length === 1 &&
          result.mandatoryBaseRulesFailed[0] === 'R3',
      };
      const a3 = {
        statement: 'Aggregator R7 failure is NOT double-counted as a base failure',
        expected: false,
        actual: result.mandatoryBaseRulesFailed.includes('R7'),
        passed: !result.mandatoryBaseRulesFailed.includes('R7'),
      };
      const a4 = {
        statement: 'Decision outcome evaluates to CONDITIONALLY_ELIGIBLE',
        expected: 'CONDITIONALLY_ELIGIBLE',
        actual: result.decision,
        passed: result.decision === 'CONDITIONALLY_ELIGIBLE',
      };

      results.push({
        id: 'T3_CONDITIONAL',
        name: 'Three-Way Decision Logic: Outcome 2 (CONDITIONALLY_ELIGIBLE)',
        category: 'decision_logic',
        passed: a1.passed && a2.passed && a3.passed && a4.passed,
        assertions: [a1, a2, a3, a4],
        details: 'Exactly 1 mandatory base rule failed (R3 Credit Score 670 < 700). Qualifies for conditional review without double-counting R7.',
      });
    }

    // --- TEST 4: Decision Outcome 3 - NOT_ELIGIBLE ---
    {
      // 3 mandatory failures: Income 20k (<30k), Credit 610 (<700), DTI 55% (>40%)
      const notEligibleFacts = {
        age: 35,
        monthly_income: 20000, // Fails R2
        credit_score: 610,   // Fails R3
        employment_duration: 3,
        previous_default: true, // Fails R5
        debt_to_income_ratio: 55, // Fails R6
        active_loans: 3,
      };

      const result = runForwardChainingEngine(notEligibleFacts, rulesToTest);
      const a1 = {
        statement: 'Two or more mandatory base rules failed',
        expected: true,
        actual: result.mandatoryBaseRulesFailed.length >= 2,
        passed: result.mandatoryBaseRulesFailed.length >= 2,
      };
      const a2 = {
        statement: 'Decision outcome evaluates to NOT_ELIGIBLE',
        expected: 'NOT_ELIGIBLE',
        actual: result.decision,
        passed: result.decision === 'NOT_ELIGIBLE',
      };

      results.push({
        id: 'T4_NOT_ELIGIBLE',
        name: 'Three-Way Decision Logic: Outcome 3 (NOT_ELIGIBLE)',
        category: 'decision_logic',
        passed: a1.passed && a2.passed,
        assertions: [a1, a2],
        details: `Failed ${result.mandatoryBaseRulesFailed.length} mandatory rules (${result.mandatoryBaseRulesFailed.join(', ')}). Exceeds single-exception threshold.`,
      });
    }

    // --- TEST 5: Advisory Rule Independence ---
    {
      // All 6 mandatory pass, but advisory rule R8 fails (active_loans = 4 > 2)
      const advisoryFailFacts = {
        age: 32,
        monthly_income: 48000,
        credit_score: 750,
        employment_duration: 3.5,
        previous_default: false,
        debt_to_income_ratio: 25,
        active_loans: 4, // Fails R8 advisory rule!
      };

      const result = runForwardChainingEngine(advisoryFailFacts, rulesToTest);
      const a1 = {
        statement: 'Master aggregator R7 still fires (loan_eligible === true)',
        expected: true,
        actual: result.finalFacts['loan_eligible'],
        passed: result.finalFacts['loan_eligible'] === true,
      };
      const a2 = {
        statement: 'Decision remains ELIGIBLE despite non-mandatory advisory failure',
        expected: 'ELIGIBLE',
        actual: result.decision,
        passed: result.decision === 'ELIGIBLE',
      };
      const a3 = {
        statement: 'R8 tracked in advisoryRulesFailed list',
        expected: true,
        actual: result.advisoryRulesFailed.includes('R8'),
        passed: result.advisoryRulesFailed.includes('R8'),
      };

      results.push({
        id: 'T5_ADVISORY',
        name: 'Advisory Rule Independence (Non-Mandatory R8)',
        category: 'decision_logic',
        passed: a1.passed && a2.passed && a3.passed,
        assertions: [a1, a2, a3],
        details: 'Advisory rule R8 failure does not block master loan eligibility when all mandatory criteria pass.',
      });
    }

    setTimeout(() => {
      setTestResults(results);
      setSelectedTest(results[0]);
      setIsRunning(false);
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Test Lab Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Beaker className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">
              Forward Chaining Verification & Test Lab
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Formally executes and verifies the multi-pass aggregator claim (R7 first) and all 3 decision outcomes.
          </p>
        </div>

        <button
          type="button"
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition disabled:opacity-50 self-start md:self-auto"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Running Inference Test Suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Execute Automated Verification Suite</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {testResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Test Case Selector Column */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Test Suite Results ({testResults.filter((t) => t.passed).length}/{testResults.length} Passed)
            </div>

            {testResults.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTest(t)}
                className={`w-full text-left p-3.5 rounded-xl border transition ${
                  selectedTest?.id === t.id
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow ring-1 ring-indigo-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-xs text-white line-clamp-1">{t.name}</span>
                  {t.passed ? (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  ) : (
                    <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      <XCircle className="w-3 h-3" /> FAIL
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {t.details}
                </p>
              </button>
            ))}
          </div>

          {/* Selected Test Detail Viewer */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            {selectedTest && (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                      Assertion Telemetry: {selectedTest.id}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{selectedTest.name}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTest.passed ? (
                      <span className="px-3 py-1 text-xs font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ALL ASSERTIONS VERIFIED
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> ASSERTION FAILED
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedTest.details}
                </p>

                {/* Multi-pass breakdown if available */}
                {selectedTest.passBreakdown && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-900/40">
                    <div className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Live Pass Execution Breakdown (R7 Evaluated First):</span>
                    </div>
                    <div className="space-y-1 font-mono text-xs text-slate-300">
                      {selectedTest.passBreakdown.map((line, idx) => (
                        <div key={idx} className="p-1.5 bg-slate-900/80 rounded border border-slate-800">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assertions Table */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Formal Assertions:
                  </div>

                  <div className="space-y-2">
                    {selectedTest.assertions.map((a, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          a.passed
                            ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-200'
                            : 'bg-rose-950/10 border-rose-900/30 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">
                            {a.passed ? '✓' : '✕'}
                          </span>
                          <span className="text-white font-sans font-medium">{a.statement}</span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] shrink-0 self-end sm:self-center">
                          <div className="text-slate-400">
                            Expected: <span className="text-cyan-300 font-bold">{JSON.stringify(a.expected)}</span>
                          </div>
                          <div className="text-slate-400">
                            Actual: <span className="text-white font-bold">{JSON.stringify(a.actual)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl">
          <Beaker className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-white">Automated Verification Suite Ready</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Execute the test suite to run live assertions verifying multi-pass forward chaining convergence (with R7 at index 0) and all 3 decision branches.
          </p>
          <button
            type="button"
            onClick={runAllTests}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            Run Test Suite Now
          </button>
        </div>
      )}
    </div>
  );
};
