import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Sliders, AlertCircle } from 'lucide-react';
import { ComparisonOperator, Condition, Rule } from '../../types';

interface RuleEditorModalProps {
  isOpen: boolean;
  ruleToEdit: Rule | null;
  onClose: () => void;
  onSaveRule: (rule: Rule) => void;
  existingRuleIds: string[];
}

const COMMON_FACT_SUGGESTIONS = [
  'age',
  'monthly_income',
  'credit_score',
  'employment_duration',
  'previous_default',
  'debt_to_income_ratio',
  'active_loans',
  'requested_amount',
  // Derived facts
  'age_eligible',
  'income_eligible',
  'credit_eligible',
  'employment_stable',
  'repayment_history_good',
  'debt_eligible',
  'active_loans_acceptable',
  'loan_eligible',
];

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  isOpen,
  ruleToEdit,
  onClose,
  onSaveRule,
  existingRuleIds,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([
    { fact: 'credit_score', op: '>=', value: 700 },
  ]);
  const [conclusionFact, setConclusionFact] = useState('loan_eligible');
  const [conclusionValue, setConclusionValue] = useState<any>(true);
  const [explanation, setExplanation] = useState('');
  const [failExplanation, setFailExplanation] = useState('');
  const [mandatory, setMandatory] = useState(true);
  const [priority, setPriority] = useState(70);
  const [active, setActive] = useState(true);
  const [isAggregator, setIsAggregator] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (ruleToEdit) {
      setId(ruleToEdit.id);
      setName(ruleToEdit.name);
      setDescription(ruleToEdit.description || '');
      setConditions(
        ruleToEdit.conditions.map((c) => ({
          fact: c.fact,
          op: c.op,
          value: Array.isArray(c.value) ? c.value.join(', ') : c.value,
        }))
      );
      setConclusionFact(ruleToEdit.conclusionFact);
      setConclusionValue(ruleToEdit.conclusionValue);
      setExplanation(ruleToEdit.explanation);
      setFailExplanation(ruleToEdit.failExplanation);
      setMandatory(ruleToEdit.mandatory);
      setPriority(ruleToEdit.priority);
      setActive(ruleToEdit.active);
      setIsAggregator(ruleToEdit.isAggregator || false);
      setErrorMsg('');
    } else {
      // New rule defaults
      const nextIdNum = existingRuleIds.length + 1;
      setId(`R${nextIdNum}`);
      setName('');
      setDescription('');
      setConditions([{ fact: 'monthly_income', op: '>=', value: 30000 }]);
      setConclusionFact('income_eligible');
      setConclusionValue(true);
      setExplanation('Criteria satisfied according to updated underwriting policy.');
      setFailExplanation('Criteria not satisfied.');
      setMandatory(true);
      setPriority(80);
      setActive(true);
      setIsAggregator(false);
      setErrorMsg('');
    }
  }, [ruleToEdit, isOpen, existingRuleIds.length]);

  if (!isOpen) return null;

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { fact: 'credit_score', op: '>=', value: 700 },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length <= 1) {
      setErrorMsg('A rule must contain at least one condition.');
      return;
    }
    setConditions(conditions.filter((_, idx) => idx !== index));
  };

  const handleConditionChange = (
    index: number,
    field: keyof Condition,
    val: any
  ) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: val };
    setConditions(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!id.trim()) {
      setErrorMsg('Rule ID is required.');
      return;
    }

    if (!ruleToEdit && existingRuleIds.includes(id.trim())) {
      setErrorMsg(`Rule ID "${id}" already exists. Please pick a unique ID.`);
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Rule Name is required.');
      return;
    }

    if (!conclusionFact.trim()) {
      setErrorMsg('Conclusion fact name is required.');
      return;
    }

    // Format condition values safely
    const formattedConditions: Condition[] = conditions.map((c) => {
      let parsedValue: any = c.value;

      if (c.op === 'between') {
        if (typeof c.value === 'string') {
          parsedValue = c.value.split(',').map((v) => Number(v.trim()));
        }
      } else if (c.op === 'in') {
        if (typeof c.value === 'string') {
          parsedValue = c.value.split(',').map((v) => v.trim());
        }
      } else if (typeof c.value === 'string') {
        if (c.value.toLowerCase() === 'true') parsedValue = true;
        else if (c.value.toLowerCase() === 'false') parsedValue = false;
        else if (!isNaN(Number(c.value)) && c.value.trim() !== '') {
          parsedValue = Number(c.value);
        }
      }

      return {
        fact: c.fact.trim(),
        op: c.op,
        value: parsedValue,
      };
    });

    const rule: Rule = {
      id: id.trim(),
      name: name.trim(),
      description: description.trim(),
      conditions: formattedConditions,
      conclusionFact: conclusionFact.trim(),
      conclusionValue: conclusionValue === 'true' ? true : conclusionValue === 'false' ? false : conclusionValue,
      explanation: explanation.trim() || `${name} criteria satisfied.`,
      failExplanation: failExplanation.trim() || `${name} criteria failed.`,
      mandatory,
      priority: Number(priority),
      active,
      isAggregator,
    };

    onSaveRule(rule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              {ruleToEdit ? `Edit Rule: ${ruleToEdit.id}` : 'Create New Underwriting Rule'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Top metadata grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Rule ID</label>
              <input
                type="text"
                required
                disabled={!!ruleToEdit}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. R9"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono disabled:opacity-50"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Rule Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Collateral Valuation Standard"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Underwriting guideline intent and business rationale"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* CONDITIONS BUILDER (FACT / OP / VALUE ROWS) */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white">Rule Conditions (AND-combined)</span>
                <p className="text-[11px] text-slate-400">
                  Every condition must evaluate to true using current working memory facts for the rule to fire.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCondition}
                className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 font-medium transition"
              >
                <Plus className="w-3 h-3" />
                Add Condition
              </button>
            </div>

            <div className="space-y-2">
              {conditions.map((cond, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 bg-slate-900 rounded-lg border border-slate-800"
                >
                  {/* Fact selection */}
                  <div className="flex-1">
                    <input
                      type="text"
                      list="fact-suggestions"
                      required
                      placeholder="Fact Name (e.g. credit_score)"
                      value={cond.fact}
                      onChange={(e) => handleConditionChange(idx, 'fact', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  {/* Operator */}
                  <div className="w-full sm:w-28">
                    <select
                      value={cond.op}
                      onChange={(e) =>
                        handleConditionChange(idx, 'op', e.target.value as ComparisonOperator)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white font-mono"
                    >
                      <option value="==">== (equals)</option>
                      <option value="!=">!= (not equal)</option>
                      <option value=">">&gt; (greater)</option>
                      <option value=">=">&gt;= (greater or equal)</option>
                      <option value="<">&lt; (less)</option>
                      <option value="<=">&lt;= (less or equal)</option>
                      <option value="between">between [min, max]</option>
                      <option value="in">in [list]</option>
                    </select>
                  </div>

                  {/* Expected Value */}
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder={cond.op === 'between' ? '21, 60' : 'Value (e.g. 700 or true)'}
                      value={
                        Array.isArray(cond.value)
                          ? cond.value.join(', ')
                          : String(cond.value ?? '')
                      }
                      onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveCondition(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition self-end sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Fact suggestions datalist */}
            <datalist id="fact-suggestions">
              {COMMON_FACT_SUGGESTIONS.map((fact) => (
                <option key={fact} value={fact} />
              ))}
            </datalist>
          </div>

          {/* CONCLUSION FACT & VALUE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Conclusion Fact to Add to Working Memory
              </label>
              <input
                type="text"
                required
                value={conclusionFact}
                onChange={(e) => setConclusionFact(e.target.value)}
                placeholder="e.g. loan_eligible or credit_eligible"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Conclusion Value
              </label>
              <select
                value={String(conclusionValue)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'true') setConclusionValue(true);
                  else if (val === 'false') setConclusionValue(false);
                  else setConclusionValue(val);
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
              >
                <option value="true">true (boolean)</option>
                <option value="false">false (boolean)</option>
              </select>
            </div>
          </div>

          {/* EXPLANATIONS (AUDIT TRAIL) */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Explanation (When Rule Fires)
              </label>
              <textarea
                rows={2}
                required
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Human-readable audit explanation describing why this criterion was satisfied"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Fail Explanation (When Rule Fails)
              </label>
              <textarea
                rows={2}
                required
                value={failExplanation}
                onChange={(e) => setFailExplanation(e.target.value)}
                placeholder="Human-readable audit explanation explaining why applicant failed this rule"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>

          {/* TOGGLES & PRIORITY */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Priority</label>
              <input
                type="number"
                min={1}
                max={200}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={mandatory}
                  onChange={(e) => setMandatory(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-200">Mandatory Rule</span>
              </label>
            </div>

            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={isAggregator}
                  onChange={(e) => setIsAggregator(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-200">Master Aggregator</span>
              </label>
            </div>

            <div className="flex flex-col justify-end">
              <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span className="text-slate-200">Rule Active</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold rounded-xl shadow transition"
            >
              Save Rule to Knowledge Base
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
