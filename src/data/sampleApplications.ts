import { ApplicationRecord, LoanApplicationInput } from '../types';
import { DEFAULT_RULES } from './defaultRules';
import { runForwardChainingEngine } from '../engine/inferenceEngine';

export interface ApplicantPreset {
  id: string;
  label: string;
  badge: string;
  expectedOutcome: 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NOT_ELIGIBLE';
  description: string;
  data: LoanApplicationInput;
}

export const APPLICANT_PRESETS: ApplicantPreset[] = [
  {
    id: 'prime_eligible',
    label: 'Prime Borrower (Eligible)',
    badge: 'Outcome: ELIGIBLE',
    expectedOutcome: 'ELIGIBLE',
    description: 'All 6 mandatory criteria satisfied. Demonstrates multi-pass execution: R7 is placed first, waits for pass 2, and fires.',
    data: {
      applicantName: 'Elena Rostova',
      age: 34,
      monthly_income: 52000,
      credit_score: 765,
      employment_duration: 4.5,
      previous_default: false,
      debt_to_income_ratio: 26,
      active_loans: 1,
      requested_amount: 350000,
      loan_tenure_months: 60,
      loan_purpose: 'Home Improvement & Expansion',
      marital_status: 'Married',
      dependents: 1,
    },
  },
  {
    id: 'borderline_conditional',
    label: 'Borderline Applicant (Conditionally Eligible)',
    badge: 'Outcome: CONDITIONALLY_ELIGIBLE',
    expectedOutcome: 'CONDITIONALLY_ELIGIBLE',
    description: 'Exactly ONE mandatory failure (Credit Score 670 < 700). Qualifies for conditional secondary underwriter review.',
    data: {
      applicantName: 'Marcus Vance',
      age: 29,
      monthly_income: 48000,
      credit_score: 670, // Fails R3 only!
      employment_duration: 3.5,
      previous_default: false,
      debt_to_income_ratio: 31,
      active_loans: 2,
      requested_amount: 180000,
      loan_tenure_months: 48,
      loan_purpose: 'Vehicle Purchase',
      marital_status: 'Single',
      dependents: 0,
    },
  },
  {
    id: 'high_risk_not_eligible',
    label: 'High Risk Applicant (Not Eligible)',
    badge: 'Outcome: NOT_ELIGIBLE',
    expectedOutcome: 'NOT_ELIGIBLE',
    description: 'Multiple mandatory failures (Low income $22k, prior default = true, DTI 52%). Rejected under forward chaining rules.',
    data: {
      applicantName: 'Derrick Hall',
      age: 44,
      monthly_income: 22000, // Fails R2
      credit_score: 615,   // Fails R3
      employment_duration: 1.2, // Fails R4
      previous_default: true,   // Fails R5
      debt_to_income_ratio: 52, // Fails R6
      active_loans: 3,
      requested_amount: 250000,
      loan_tenure_months: 36,
      loan_purpose: 'Debt Consolidation',
      marital_status: 'Divorced',
      dependents: 2,
    },
  },
];

// Helper to construct initial sample historical applications
export function generateInitialHistory(): ApplicationRecord[] {
  const records: ApplicationRecord[] = [];

  // Seed with the 3 canonical preset applications so history is immediately rich and demonstrable
  APPLICANT_PRESETS.forEach((preset, idx) => {
    const facts = {
      age: preset.data.age,
      monthly_income: preset.data.monthly_income,
      credit_score: preset.data.credit_score,
      employment_duration: preset.data.employment_duration,
      previous_default: preset.data.previous_default,
      debt_to_income_ratio: preset.data.debt_to_income_ratio,
      active_loans: preset.data.active_loans,
      requested_amount: preset.data.requested_amount,
    };

    const inferenceResult = runForwardChainingEngine(facts, DEFAULT_RULES);
    const date = new Date(Date.now() - (idx + 1) * 3600000 * 4).toISOString();

    records.push({
      id: `APP-2026-${1000 + idx}`,
      applicantId: `USR-${10 + idx}`,
      applicantName: preset.data.applicantName,
      input: preset.data,
      inferenceResult,
      timestamp: date,
    });
  });

  return records;
}
