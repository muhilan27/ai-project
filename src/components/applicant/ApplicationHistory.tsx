import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { ApplicationRecord } from '../../types';

interface ApplicationHistoryProps {
  history: ApplicationRecord[];
  onSelectApplication: (record: ApplicationRecord) => void;
  onNewApplicationClick: () => void;
}

export const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({
  history,
  onSelectApplication,
  onNewApplicationClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('ALL');

  const filtered = history.filter((item) => {
    const matchesSearch =
      item.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterDecision === 'ALL' || item.inferenceResult.decision === filterDecision;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Application Assessment History</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse previous forward-chaining evaluations and inspect their complete multi-pass reasoning trails.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewApplicationClick}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition self-start sm:self-auto"
        >
          + Submit New Assessment
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by applicant name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          {['ALL', 'ELIGIBLE', 'CONDITIONALLY_ELIGIBLE', 'NOT_ELIGIBLE'].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilterDecision(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterDecision === status
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status === 'ALL'
                ? 'All'
                : status === 'ELIGIBLE'
                ? 'Eligible'
                : status === 'CONDITIONALLY_ELIGIBLE'
                ? 'Conditional'
                : 'Not Eligible'}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Requested Loan</th>
                <th className="py-3 px-4">Score / Income / DTI</th>
                <th className="py-3 px-4">Engine Decision</th>
                <th className="py-3 px-4">Passes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    No matching applications found in history.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const d = item.inferenceResult.decision;
                  const badgeClass =
                    d === 'ELIGIBLE'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : d === 'CONDITIONALLY_ELIGIBLE'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30';

                  return (
                    <tr key={item.id} className="hover:bg-slate-850/50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        {item.id}
                        <div className="text-[10px] text-slate-500 font-normal">
                          {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-white">
                        {item.applicantName}
                        <div className="text-[11px] text-slate-400">
                          Age {item.input.age} • {item.input.employment_duration} yrs emp
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        ${item.input.requested_amount?.toLocaleString()}
                        <div className="text-[10px] text-slate-400">
                          {item.input.loan_tenure_months} Mo
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-300">
                        <div>FICO: <span className="font-bold text-cyan-300">{item.input.credit_score}</span></div>
                        <div className="text-[10px] text-slate-400">
                          ${item.input.monthly_income?.toLocaleString()} / {item.input.debt_to_income_ratio}% DTI
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold font-mono rounded-full border ${badgeClass}`}>
                          {d === 'ELIGIBLE' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {d === 'CONDITIONALLY_ELIGIBLE' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                          {d === 'NOT_ELIGIBLE' && <XCircle className="w-3 h-3 text-rose-400" />}
                          <span>{d}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" />
                          {item.inferenceResult.passesRequired}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectApplication(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-slate-700 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Trail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
