import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  GitFork, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Database,
  RefreshCw,
  FileText
} from 'lucide-react';
import { InferenceResult, LoanApplicationInput } from '../../types';

interface AssessmentResultViewProps {
  applicationInput: LoanApplicationInput;
  result: InferenceResult;
  onReset: () => void;
  onViewHistory: () => void;
}

export const AssessmentResultView: React.FC<AssessmentResultViewProps> = ({
  applicationInput,
  result,
  onReset,
  onViewHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'trail' | 'multipass' | 'memory'>('trail');
  const [expandedRuleIds, setExpandedRuleIds] = useState<Set<string>>(new Set(['R7', 'R1', 'R3']));

  const toggleRuleExpand = (id: string) => {
    setExpandedRuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDecisionTheme = (decision: string) => {
    switch (decision) {
      case 'ELIGIBLE':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/20',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-400" />,
          title: 'ELIGIBLE FOR LOAN APPROVAL',
          sub: 'All mandatory underwriting tenets satisfied. Master aggregator rule R7 fired successfully.',
        };
      case 'CONDITIONALLY_ELIGIBLE':
        return {
          border: 'border-amber-500/40',
          bg: 'bg-amber-950/20',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          title: 'CONDITIONALLY ELIGIBLE',
          sub: 'Standard baseline met with exactly ONE mandatory exception. Conditional manual underwriter review required.',
        };
      case 'NOT_ELIGIBLE':
      default:
        return {
          border: 'border-rose-500/40',
          bg: 'bg-rose-950/20',
          badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          icon: <XCircle className="w-8 h-8 text-rose-400" />,
          title: 'NOT ELIGIBLE FOR LOAN',
          sub: 'Applicant failed two or more mandatory eligibility requirements. Declined by forward chaining inference.',
        };
    }
  };

  const theme = getDecisionTheme(result.decision);

  return (
    <div className="space-y-6">
      {/* 1. Main Decision Card */}
      <div className={`p-6 rounded-2xl border ${theme.border} ${theme.bg} shadow-2xl relative overflow-hidden backdrop-blur`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/60 shadow-inner">
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`px-3 py-1 text-xs font-bold font-mono uppercase tracking-wider rounded-full border ${theme.badgeBg}`}>
                  {result.decision}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Evaluated at {new Date(result.evaluatedAt).toLocaleTimeString()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 tracking-tight">
                {theme.title}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {result.decisionReason}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-6 text-right">
            <span className="text-xs text-slate-400">Applicant Reference</span>
            <span className="text-sm font-semibold text-white">{applicationInput.applicantName}</span>
            <span className="text-xs text-indigo-400 font-mono mt-0.5">
              ${applicationInput.requested_amount?.toLocaleString()} • {applicationInput.loan_tenure_months} Mo
            </span>
          </div>
        </div>

        {/* Inference Engine Quick KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/60">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Passes to Fixpoint</div>
            <div className="text-lg font-bold text-cyan-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Layers className="w-4 h-4" />
              <span>{result.passesRequired} Passes</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Iterative rule scanning until 0 additions</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Rules Fired</div>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
              {result.rulesFired.length} / {result.ruleTraces.length} Active
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">{result.totalRulesEvaluated} total evaluations</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Mandatory Base Fails</div>
            <div className={`text-lg font-bold font-mono mt-0.5 ${
              result.mandatoryBaseRulesFailed.length === 0 
                ? 'text-emerald-400' 
                : result.mandatoryBaseRulesFailed.length === 1 
                ? 'text-amber-400' 
                : 'text-rose-400'
            }`}>
              {result.mandatoryBaseRulesFailed.length} Failed
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Excludes master aggregator R7</div>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Derived Facts Added</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              +{Object.keys(result.derivedFacts).length} Facts
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Added to working memory</div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs for Result Details */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('trail')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'trail'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Explainable Reasoning Trail ({result.ruleTraces.length} Rules)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('multipass')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'multipass'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            Multi-Pass Execution Timeline ({result.passHistory.length} Passes)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'memory'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Working Memory Inspector
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            New Assessment
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            History
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB A: REASONING TRAIL */}
      {activeTab === 'trail' && (
        <div className="space-y-3">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Full Forward-Chaining Audit Trail: </span>
              Every rule in the knowledge base was evaluated against working memory. Each entry displays whether it fired, which pass it fired on, the fact derived, and the human-readable explanation generated by the engine trace.
            </div>
          </div>

          <div className="space-y-2.5">
            {result.ruleTraces.map((trace) => {
              const isExpanded = expandedRuleIds.has(trace.ruleId);
              const isFired = trace.status === 'fired';
              const isAggregator = trace.isAggregator || trace.ruleId === 'R7';

              return (
                <div
                  key={trace.ruleId}
                  className={`rounded-xl border transition-all ${
                    isFired
                      ? 'bg-slate-900 border-slate-700/80 hover:border-slate-600'
                      : trace.mandatory
                      ? 'bg-rose-950/10 border-rose-900/30 hover:border-rose-800/50'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div
                    onClick={() => toggleRuleExpand(trace.ruleId)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Status Icon & Pass Badge */}
                      <div className="flex items-center gap-2">
                        {isFired ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                            ✓
                          </div>
                        ) : (
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            trace.mandatory 
                              ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400' 
                              : 'bg-slate-800 border border-slate-700 text-slate-400'
                          }`}>
                            ✕
                          </div>
                        )}
                        <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-slate-800 border border-slate-700 rounded">
                          {trace.ruleId}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{trace.ruleName}</h4>
                          {isAggregator && (
                            <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                              Master Aggregator
                            </span>
                          )}
                          <span className={`px-2 py-0.2 text-[10px] font-mono rounded ${
                            trace.mandatory 
                              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {trace.mandatory ? 'Mandatory' : 'Advisory'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {trace.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right">
                        {isFired ? (
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[11px] font-semibold text-emerald-400">FIRED</span>
                            <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded">
                              Pass #{trace.passNumber}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="text-[11px] font-semibold text-rose-400">FAILED TO FIRE</span>
                            <span className="px-2 py-0.5 text-[11px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded">
                              Did Not Fire
                            </span>
                          </div>
                        )}

                        {trace.derivedFact && (
                          <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                            + {trace.derivedFact.name}: {String(trace.derivedFact.value)}
                          </div>
                        )}
                      </div>

                      <div className="text-slate-500 hover:text-slate-300">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded condition evaluation breakdown */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 bg-slate-950/40">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Evaluated Conditions ({trace.conditions.length}):
                      </div>

                      <div className="space-y-1.5">
                        {trace.conditions.map((cond, cIdx) => (
                          <div
                            key={cIdx}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg text-xs font-mono border ${
                              cond.satisfied
                                ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-300'
                                : 'bg-rose-950/10 border-rose-900/30 text-rose-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{cond.satisfied ? '✓' : '✕'}</span>
                              <span className="font-bold text-slate-200">{cond.fact}</span>
                              <span className="text-indigo-400">{cond.op}</span>
                              <span className="text-slate-300">
                                {Array.isArray(cond.expectedValue)
                                  ? `[${cond.expectedValue.join(', ')}]`
                                  : String(cond.expectedValue)}
                              </span>
                            </div>

                            <div className="mt-1 sm:mt-0 flex items-center gap-2 text-[11px]">
                              <span className="text-slate-400">Actual Memory Value:</span>
                              <span className={`font-bold px-1.5 py-0.5 rounded ${
                                cond.existsInMemory 
                                  ? 'bg-slate-800 text-cyan-300' 
                                  : 'bg-rose-950 text-rose-400'
                              }`}>
                                {cond.existsInMemory ? String(cond.actualValue) : 'MISSING FROM MEMORY'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB B: MULTI-PASS TIMELINE (FIXPOINT PROOF) */}
      {activeTab === 'multipass' && (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <Layers className="w-4 h-4" />
              <span>Multi-Pass Forward Chaining Fixpoint Proof</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              In this knowledge base, Master Aggregator <code className="text-amber-400 font-mono">R7</code> is deliberately positioned <strong className="text-white">FIRST</strong> in the active evaluation array. In Pass 1, R7 cannot fire because its 6 derived facts are absent from working memory. R1–R6 fire during Pass 1 to add those derived facts. Only in Pass 2 does R7 satisfy and fire! Pass 3 then produces zero new facts, proving fixpoint convergence.
            </p>
          </div>

          <div className="space-y-4">
            {result.passHistory.map((pass) => {
              const isFixpointPass = Object.keys(pass.newFactsDerived).length === 0;

              return (
                <div
                  key={pass.passNumber}
                  className={`p-5 rounded-2xl border ${
                    isFixpointPass
                      ? 'bg-slate-900/40 border-slate-800'
                      : 'bg-slate-900 border-indigo-900/40 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl font-mono font-bold flex items-center justify-center text-sm ${
                        isFixpointPass 
                          ? 'bg-slate-800 text-slate-400 border border-slate-700' 
                          : 'bg-indigo-600 text-white shadow'
                      }`}>
                        P{pass.passNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>Pass #{pass.passNumber}</span>
                          {isFixpointPass ? (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-normal bg-slate-800 text-emerald-400 border border-emerald-500/30 rounded">
                              Fixpoint Reached (Halting)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[10px] font-mono font-normal bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                              {pass.rulesFiredInThisPass.length} Rules Fired
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {pass.rulesEvaluatedCount} rules evaluated in this cycle
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-mono text-slate-400">
                      Working Memory Size: {Object.keys(pass.workingMemorySnapshot).length} facts
                    </div>
                  </div>

                  {/* Rules fired in this pass */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Rules Fired in Pass #{pass.passNumber}:
                      </div>
                      {pass.rulesFiredInThisPass.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {pass.rulesFiredInThisPass.map((rid) => {
                            const isR7 = rid === 'R7';
                            return (
                              <span
                                key={rid}
                                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border ${
                                  isR7
                                    ? 'bg-indigo-950 text-indigo-300 border-indigo-500 shadow-md shadow-indigo-950'
                                    : 'bg-emerald-950/40 text-emerald-300 border-emerald-700/50'
                                }`}
                              >
                                {rid} {isR7 ? '(Aggregator Fired!)' : ''}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic">
                          No new rules fired (Fixpoint criteria satisfied).
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        New Facts Added to Working Memory:
                      </div>
                      {Object.keys(pass.newFactsDerived).length > 0 ? (
                        <div className="space-y-1">
                          {Object.entries(pass.newFactsDerived).map(([k, v]) => (
                            <div
                              key={k}
                              className="text-xs font-mono p-1.5 bg-slate-950 rounded border border-slate-800 text-cyan-300 flex items-center justify-between"
                            >
                              <span>{k}</span>
                              <span className="text-emerald-400 font-bold">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-500 italic">
                          0 new facts added. Loop terminates safely.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB C: WORKING MEMORY INSPECTOR */}
      {activeTab === 'memory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Initial Working Memory Facts</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {Object.keys(result.initialFacts).length} Facts
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {Object.entries(result.initialFacts).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800/80">
                  <span className="text-slate-300">{key}:</span>
                  <span className="text-cyan-300 font-bold">
                    {typeof val === 'number' ? val.toLocaleString() : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <GitFork className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Final Derived Facts (Inferred)</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                +{Object.keys(result.derivedFacts).length} Derived
              </span>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {Object.entries(result.derivedFacts).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-emerald-900/30">
                  <span className="text-slate-300">{key}:</span>
                  <span className="text-emerald-400 font-bold">
                    {String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
