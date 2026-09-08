import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  Power, 
  AlertCircle, 
  CheckCircle, 
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import { Rule } from '../../types';
import { RuleEditorModal } from './RuleEditorModal';

interface RuleManagerProps {
  rules: Rule[];
  onUpdateRule: (updatedRule: Rule) => void;
  onAddRule: (newRule: Rule) => void;
  onDeleteRule: (ruleId: string) => void;
  onToggleRuleActive: (ruleId: string) => void;
  onResetToDefaults: () => void;
}

export const RuleManager: React.FC<RuleManagerProps> = ({
  rules,
  onUpdateRule,
  onAddRule,
  onDeleteRule,
  onToggleRuleActive,
  onResetToDefaults,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const handleOpenAddModal = () => {
    setEditingRule(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (rule: Rule) => {
    setEditingRule(rule);
    setModalOpen(true);
  };

  const handleSaveRule = (rule: Rule) => {
    if (editingRule) {
      onUpdateRule(rule);
    } else {
      onAddRule(rule);
    }
  };

  return (
    <div className="space-y-6">
      {/* Knowledge Base Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Underwriting Knowledge Base Management</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rules are stored as DATA, not code. Modify condition rows, thresholds, and aggregator relationships without altering the inference engine.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={onResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            Reset Seed Rules (R7 First)
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Rule
          </button>
        </div>
      </div>

      {/* Rules Notice */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Layers className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Multi-Pass Ordering Proof: </span>
          Notice that Master Aggregator rule <code className="text-indigo-300 font-mono">R7</code> is placed at index 0 of this rule list. Because the engine does not evaluate in a single hardcoded sweep, R7 gracefully postpones firing until Pass 2 when all 6 of its condition facts have been derived.
        </div>
      </div>

      {/* Rules Cards List */}
      <div className="grid grid-cols-1 gap-3">
        {rules.map((rule, index) => {
          const isR7 = rule.id === 'R7' || rule.isAggregator;

          return (
            <div
              key={rule.id}
              className={`p-4 rounded-xl border transition-all ${
                rule.active
                  ? isR7
                    ? 'bg-slate-900/95 border-indigo-500/60 shadow-md shadow-indigo-950/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/60 border-slate-850 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                      {rule.id}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-white">{rule.name}</h4>
                      {isR7 && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                          Aggregator Rule
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                        rule.mandatory
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {rule.mandatory ? 'Mandatory Base' : 'Advisory Rule'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Priority: {rule.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">
                      {rule.description || rule.explanation}
                    </p>

                    {/* Condition formula preview */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs font-mono">
                      <span className="text-slate-400">IF:</span>
                      {rule.conditions.map((c, cIdx) => (
                        <span
                          key={cIdx}
                          className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 text-cyan-300 flex items-center gap-1"
                        >
                          <span className="text-slate-300">{c.fact}</span>
                          <span className="text-indigo-400">{c.op}</span>
                          <span className="text-emerald-400">
                            {Array.isArray(c.value) ? `[${c.value.join(', ')}]` : String(c.value)}
                          </span>
                        </span>
                      ))}
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 mx-1" />
                      <span className="text-slate-400">THEN DERIVE:</span>
                      <span className="px-2 py-0.5 bg-indigo-950/70 border border-indigo-800 text-indigo-300 font-bold rounded">
                        +{rule.conclusionFact} = {String(rule.conclusionValue)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onToggleRuleActive(rule.id)}
                    title={rule.active ? 'Disable Rule' : 'Enable Rule'}
                    className={`p-2 rounded-lg text-xs font-medium border transition ${
                      rule.active
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(rule)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 border border-transparent hover:border-slate-700 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor Modal */}
      <RuleEditorModal
        isOpen={modalOpen}
        ruleToEdit={editingRule}
        onClose={() => setModalOpen(false)}
        onSaveRule={handleSaveRule}
        existingRuleIds={rules.map((r) => r.id)}
      />
    </div>
  );
};
