import {
  ConditionTrace,
  DecisionOutcome,
  InferenceResult,
  PassTrace,
  Rule,
  RuleEvaluationTrace,
  WorkingMemory,
} from '../types';
import { evaluateCondition } from './evaluator';

export interface RunInferenceOptions {
  maxPasses?: number;
}

/**
 * Pure Forward Chaining Inference Engine
 * - Represents applicant data as working memory `facts`.
 * - Executes iterative passes over rules data until fixpoint (no new facts derived).
 * - Only fires rules when all condition facts exist in working memory AND all evaluate to true.
 * - Accumulates full explainability trace with pass-by-pass snapshots.
 */
export function runForwardChainingEngine(
  initialFacts: WorkingMemory,
  rules: Rule[],
  options: RunInferenceOptions = {}
): InferenceResult {
  const maxPasses = options.maxPasses ?? 20;

  // Initialize working memory with initial input facts
  const workingMemory: WorkingMemory = { ...initialFacts };
  const initialKeys = new Set(Object.keys(initialFacts));

  // Sort rules if priority is specified (or keep existing order; R7 is intentionally first in default rules)
  // Active rules only
  const activeRules = rules.filter((r) => r.active !== false);

  const firedRuleIds = new Set<string>();
  const ruleTracesMap = new Map<string, RuleEvaluationTrace>();
  const passHistory: PassTrace[] = [];

  let currentPass = 1;
  let fixpointReached = false;
  let totalEvaluations = 0;

  while (!fixpointReached && currentPass <= maxPasses) {
    let factsDerivedInPassCount = 0;
    const rulesFiredInThisPass: string[] = [];
    const newFactsInPass: Record<string, any> = {};

    for (const rule of activeRules) {
      // If rule already fired in an earlier pass, skip re-evaluating for firing,
      // but it remains marked as fired
      if (firedRuleIds.has(rule.id)) {
        continue;
      }

      totalEvaluations++;

      // Check condition facts existence in working memory
      const conditionTraces: ConditionTrace[] = [];
      let allFactsExist = true;

      for (const cond of rule.conditions) {
        const trace = evaluateCondition(cond, workingMemory);
        conditionTraces.push(trace);
        if (!trace.existsInMemory) {
          allFactsExist = false;
        }
      }

      if (!allFactsExist) {
        // Missing precursor facts (e.g. an aggregator waiting for derived facts)
        ruleTracesMap.set(rule.id, {
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          mandatory: rule.mandatory,
          isAggregator: rule.isAggregator,
          passNumber: currentPass,
          status: 'missing_facts',
          conditions: conditionTraces,
          explanation: `Awaiting prior derived facts from working memory (${conditionTraces
            .filter((c) => !c.existsInMemory)
            .map((c) => c.fact)
            .join(', ')})`,
        });
        continue;
      }

      // All facts exist, check if all conditions evaluate to true
      const allConditionsSatisfied = conditionTraces.every((c) => c.satisfied);

      if (allConditionsSatisfied) {
        // Fire the rule!
        firedRuleIds.add(rule.id);
        rulesFiredInThisPass.push(rule.id);
        workingMemory[rule.conclusionFact] = rule.conclusionValue;
        newFactsInPass[rule.conclusionFact] = rule.conclusionValue;
        factsDerivedInPassCount++;

        ruleTracesMap.set(rule.id, {
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          mandatory: rule.mandatory,
          isAggregator: rule.isAggregator,
          passNumber: currentPass,
          status: 'fired',
          conditions: conditionTraces,
          derivedFact: {
            name: rule.conclusionFact,
            value: rule.conclusionValue,
          },
          explanation: rule.explanation,
        });
      } else {
        // Evaluated and failed (one or more conditions not satisfied)
        ruleTracesMap.set(rule.id, {
          ruleId: rule.id,
          ruleName: rule.name,
          priority: rule.priority,
          mandatory: rule.mandatory,
          isAggregator: rule.isAggregator,
          passNumber: currentPass,
          status: 'failed',
          conditions: conditionTraces,
          explanation: rule.failExplanation,
        });
      }
    }

    passHistory.push({
      passNumber: currentPass,
      rulesEvaluatedCount: activeRules.filter((r) => !firedRuleIds.has(r.id)).length + rulesFiredInThisPass.length,
      rulesFiredInThisPass,
      newFactsDerived: newFactsInPass,
      workingMemorySnapshot: { ...workingMemory },
    });

    // If no new facts were derived in this entire pass, fixpoint is reached!
    if (factsDerivedInPassCount === 0) {
      fixpointReached = true;
    } else {
      currentPass++;
    }
  }

  // Identify derived facts
  const derivedFacts: Record<string, any> = {};
  for (const [key, val] of Object.entries(workingMemory)) {
    if (!initialKeys.has(key)) {
      derivedFacts[key] = val;
    }
  }

  // --- THREE-WAY DECISION LOGIC ---
  // Mandatory base rules: mandatory === true, but excluding the aggregator rule itself
  // (to prevent double counting aggregator failure as a second base-rule failure)
  const isAggregatorRule = (r: Rule) =>
    r.isAggregator === true || r.id === 'R7' || r.conclusionFact === 'loan_eligible';

  const mandatoryBaseRules = activeRules.filter((r) => r.mandatory && !isAggregatorRule(r));
  const advisoryRules = activeRules.filter((r) => !r.mandatory);

  const mandatoryBaseRulesFailed: string[] = [];
  for (const rule of mandatoryBaseRules) {
    if (!firedRuleIds.has(rule.id)) {
      mandatoryBaseRulesFailed.push(rule.id);
    }
  }

  const advisoryRulesFailed: string[] = [];
  for (const rule of advisoryRules) {
    if (!firedRuleIds.has(rule.id)) {
      advisoryRulesFailed.push(rule.id);
    }
  }

  const isLoanEligible = workingMemory['loan_eligible'] === true;

  let decision: DecisionOutcome;
  let decisionReason = '';

  if (isLoanEligible) {
    decision = 'ELIGIBLE';
    decisionReason =
      'All mandatory eligibility rules satisfied and the master loan aggregator successfully fired.';
  } else {
    // Count how many MANDATORY base rules failed
    const failCount = mandatoryBaseRulesFailed.length;
    if (failCount === 1) {
      const failedRule = rules.find((r) => r.id === mandatoryBaseRulesFailed[0]);
      decision = 'CONDITIONALLY_ELIGIBLE';
      decisionReason = `Applicant meets standard baseline requirements with exactly 1 mandatory exception: ${
        failedRule ? failedRule.name : mandatoryBaseRulesFailed[0]
      }. Eligible under conditional terms (manual underwriting / secondary guarantor required).`;
    } else {
      const failedNames = mandatoryBaseRulesFailed
        .map((id) => rules.find((r) => r.id === id)?.name || id)
        .join(', ');
      decision = 'NOT_ELIGIBLE';
      decisionReason = `Applicant failed ${failCount} mandatory base eligibility requirements (${failedNames}), exceeding the allowable single-exception threshold.`;
    }
  }

  // Convert ruleTracesMap to ordered array matching activeRules order
  const ruleTraces: RuleEvaluationTrace[] = activeRules.map((rule) => {
    const trace = ruleTracesMap.get(rule.id);
    if (trace) return trace;
    return {
      ruleId: rule.id,
      ruleName: rule.name,
      priority: rule.priority,
      mandatory: rule.mandatory,
      isAggregator: rule.isAggregator,
      passNumber: 0,
      status: 'failed',
      conditions: [],
      explanation: rule.failExplanation,
    };
  });

  return {
    decision,
    decisionReason,
    passesRequired: passHistory.length,
    totalRulesEvaluated: totalEvaluations,
    rulesFired: Array.from(firedRuleIds),
    mandatoryBaseRulesFailed,
    advisoryRulesFailed,
    initialFacts,
    finalFacts: workingMemory,
    derivedFacts,
    passHistory,
    ruleTraces,
    evaluatedAt: new Date().toISOString(),
  };
}
