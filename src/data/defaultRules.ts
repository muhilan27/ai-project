import { Rule } from '../types';

/**
 * Default Seeded Rules for the Forward Chaining Expert System.
 * NOTE: R7 (Aggregator Rule) is DELIBERATELY placed FIRST in array evaluation order
 * to prove multi-pass inference: in Pass 1, R7 cannot fire because its 6 derived
 * facts do not yet exist in working memory. It only fires in Pass 2 after R1-R6
 * have fired in Pass 1!
 */
export const DEFAULT_RULES: Rule[] = [
  {
    id: 'R7',
    name: 'Master Loan Eligibility Aggregator',
    description: 'Aggregates all 6 core derived eligibility milestones to approve standard loan issuance',
    conditions: [
      { fact: 'age_eligible', op: '==', value: true },
      { fact: 'income_eligible', op: '==', value: true },
      { fact: 'credit_eligible', op: '==', value: true },
      { fact: 'employment_stable', op: '==', value: true },
      { fact: 'repayment_history_good', op: '==', value: true },
      { fact: 'debt_eligible', op: '==', value: true },
    ],
    conclusionFact: 'loan_eligible',
    conclusionValue: true,
    explanation: 'All 6 mandatory base eligibility milestones have been established in working memory. Master loan approval criteria satisfied.',
    failExplanation: 'One or more required derived facts (age, income, credit, employment, repayment, or debt eligibility) are absent or false.',
    mandatory: true,
    priority: 100, // High priority / evaluated first
    active: true,
    isAggregator: true,
  },
  {
    id: 'R1',
    name: 'Age Threshold Verification',
    description: 'Applicant must be between legal and working age boundaries (21 to 60)',
    conditions: [
      { fact: 'age', op: 'between', value: [21, 60] },
    ],
    conclusionFact: 'age_eligible',
    conclusionValue: true,
    explanation: 'Applicant age is within the eligible operational threshold (21–60 years).',
    failExplanation: 'Applicant age is outside the standard operating window (21–60 years).',
    mandatory: true,
    priority: 80,
    active: true,
    isAggregator: false,
  },
  {
    id: 'R2',
    name: 'Monthly Income Baseline',
    description: 'Applicant must meet or exceed minimum monthly income ($30,000)',
    conditions: [
      { fact: 'monthly_income', op: '>=', value: 30000 },
    ],
    conclusionFact: 'income_eligible',
    conclusionValue: true,
    explanation: 'Monthly income meets or exceeds the mandatory baseline of $30,000.',
    failExplanation: 'Monthly income falls below the minimum required threshold of $30,000.',
    mandatory: true,
    priority: 80,
    active: true,
    isAggregator: false,
  },
  {
    id: 'R3',
    name: 'Prime Credit Score Check',
    description: 'Applicant credit score must indicate prime creditworthiness (700+)',
    conditions: [
      { fact: 'credit_score', op: '>=', value: 700 },
    ],
    conclusionFact: 'credit_eligible',
    conclusionValue: true,
    explanation: 'Credit score is 700 or above, indicating prime creditworthiness and low default probability.',
    failExplanation: 'Credit score is below the prime benchmark of 700.',
    mandatory: true,
    priority: 80,
    active: true,
    isAggregator: false,
  },
  {
    id: 'R4',
    name: 'Employment Stability Tenet',
    description: 'Applicant must have at least 2 consecutive years of employment history',
    conditions: [
      { fact: 'employment_duration', op: '>=', value: 2 },
    ],
    conclusionFact: 'employment_stable',
    conclusionValue: true,
    explanation: 'Employment duration is at least 2 years, establishing occupational and income stability.',
    failExplanation: 'Employment duration is less than 2 years, failing career stability guidelines.',
    mandatory: true,
    priority: 70,
    active: true,
    isAggregator: false,
  },
  {
    id: 'R5',
    name: 'Repayment History Standard',
    description: 'Applicant must possess a clean track record with zero previous loan defaults',
    conditions: [
      { fact: 'previous_default', op: '==', value: false },
    ],
    conclusionFact: 'repayment_history_good',
    conclusionValue: true,
    explanation: 'Applicant has no recorded past defaults, verifying exemplary repayment integrity.',
    failExplanation: 'Prior loan default on record, demonstrating past delinquency risk.',
    mandatory: true,
    priority: 90,
    active: true,
    isAggregator: false,
  },
  {
    id: 'R6',
    name: 'Debt-to-Income Prudence Rule',
    description: 'Debt-to-Income (DTI) ratio must not exceed 40%',
    conditions: [
      { fact: 'debt_to_income_ratio', op: '<=', value: 40 },
    ],
    conclusionFact: 'debt_eligible',
    conclusionValue: true,
    explanation: 'Debt-to-Income ratio is at or below 40%, confirming adequate debt service coverage.',
    failExplanation: 'Debt-to-Income ratio exceeds the allowable 40% cap, suggesting debt strain.',
    mandatory: true,
    priority: 75,
    active: true,
    isAggregator: false,
  },
  {
    id: 'R8',
    name: 'Active Debt Portfolio Advisory',
    description: 'Advisory guideline: applicant holds 2 or fewer existing active loans',
    conditions: [
      { fact: 'active_loans', op: '<=', value: 2 },
    ],
    conclusionFact: 'active_loans_acceptable',
    conclusionValue: true,
    explanation: 'Applicant has 2 or fewer active loans, satisfying portfolio concentration guidelines.',
    failExplanation: 'Applicant currently manages more than 2 active loans, signaling high leverage (advisory).',
    mandatory: false, // Advisory rule
    priority: 50,
    active: true,
    isAggregator: false,
  },
];
