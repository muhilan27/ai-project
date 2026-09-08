import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers, 
  TrendingUp, 
  FileText,
  Search,
  ArrowUpRight
} from 'lucide-react';
import { ApplicationRecord, Rule } from '../../types';

interface AdminDashboardProps {
  history: ApplicationRecord[];
  rules: Rule[];
  onSelectApplication: (record: ApplicationRecord) => void;
  onNavigateToRules: () => void;
  onNavigateToTestLab: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  history,
  rules,
  onSelectApplication,
  onNavigateToRules,
  onNavigateToTestLab,
}) => {
  const total = history.length;
  const eligibleCount = history.filter((h) => h.inferenceResult.decision === 'ELIGIBLE').length;
  const conditionalCount = history.filter((h) => h.inferenceResult.decision === 'CONDITIONALLY_ELIGIBLE').length;
  const notEligibleCount = history.filter((h) => h.inferenceResult.decision === 'NOT_ELIGIBLE').length;

  const approvalRate = total > 0 ? Math.round((eligibleCount / total) * 100) : 0;
  const conditionalRate = total > 0 ? Math.round((conditionalCount / total) * 100) : 0;
  const rejectRate = total > 0 ? Math.round((notEligibleCount / total) * 100) : 0;

  // Average passes to fixpoint
  const avgPasses =
    total > 0
      ? (history.reduce((acc, h) => acc + h.inferenceResult.passesRequired, 0) / total).toFixed(1)
      : '0.0';

  // Rule firing statistics across history
  const ruleFiringStats = rules.map((rule) => {
    let timesFired = 0;
    history.forEach((h) => {
      if (h.inferenceResult.rulesFired.includes(rule.id)) {
        timesFired++;
      }
    });
    const firingRate = total > 0 ? Math.round((timesFired / total) * 100) : 0;
    return {
      rule,
      timesFired,
      firingRate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Underwriting Operations & Inference Analytics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry on forward-chaining fixpoint passes, approval ratios, and rule firing frequencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateToTestLab}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs font-semibold border border-slate-700 transition"
          >
            <span>Engine Test Lab</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onNavigateToRules}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <span>Manage Knowledge Base</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Total Evaluated</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-2 font-mono">
            {total}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-indigo-400 font-semibold">{avgPasses}</span> avg passes to fixpoint
          </div>
        </div>

        {/* Fully Eligible */}
        <div className="bg-slate-900 border border-emerald-900/40 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-emerald-400">
            <span>Fully Eligible (Approved)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-300 mt-2 font-mono">
            {eligibleCount} <span className="text-sm font-normal text-emerald-400/80">({approvalRate}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Aggregator R7 fired on Pass 2
          </div>
        </div>

        {/* Conditionally Eligible */}
        <div className="bg-slate-900 border border-amber-900/40 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-amber-400">
            <span>Conditionally Eligible</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-300 mt-2 font-mono">
            {conditionalCount} <span className="text-sm font-normal text-amber-400/80">({conditionalRate}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Exactly 1 mandatory base fail
          </div>
        </div>

        {/* Not Eligible */}
        <div className="bg-slate-900 border border-rose-900/40 p-5 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-xs font-medium text-rose-400">
            <span>Not Eligible (Declined)</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-300 mt-2 font-mono">
            {notEligibleCount} <span className="text-sm font-normal text-rose-400/80">({rejectRate}%)</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            2+ mandatory base failures
          </div>
        </div>
      </div>

      {/* Rule Firing Frequency Analytics */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Knowledge Base Rule Firing Statistics</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Percentage of assessments in which each rule satisfied its condition and derived its conclusion
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            {rules.filter((r) => r.active).length} Active Rules
          </span>
        </div>

        <div className="space-y-3">
          {ruleFiringStats.map(({ rule, timesFired, firingRate }) => {
            const isR7 = rule.id === 'R7';

            return (
              <div key={rule.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300 w-8">{rule.id}</span>
                    <span className="text-white font-medium">{rule.name}</span>
                    {isR7 && (
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-1.5 py-0.5 rounded border border-indigo-800">
                        Aggregator
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-slate-400">
                    <span className="text-white font-bold">{timesFired}</span> / {total} ({firingRate}%)
                  </div>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isR7
                        ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                        : rule.mandatory
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${firingRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <h3 className="text-sm font-bold text-white">Recent Underwriting Decisions</h3>
          <span className="text-xs text-slate-400">Showing last {Math.min(5, history.length)} applications</span>
        </div>

        <div className="divide-y divide-slate-800/60 text-xs">
          {history.slice(0, 5).map((item) => {
            const d = item.inferenceResult.decision;
            const badgeClass =
              d === 'ELIGIBLE'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : d === 'CONDITIONALLY_ELIGIBLE'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30';

            return (
              <div
                key={item.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-850/40 px-2 rounded-lg transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.applicantName}</span>
                    <span className="font-mono text-slate-500 text-[11px]">{item.id}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Score {item.input.credit_score} • ${item.input.monthly_income?.toLocaleString()} Inc • {item.input.debt_to_income_ratio}% DTI
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 font-mono text-[11px] font-bold rounded-full border ${badgeClass}`}>
                    {d}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectApplication(item)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs font-medium border border-slate-700 transition"
                  >
                    View Audit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
