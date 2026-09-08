export type ComparisonOperator = 
  | '==' 
  | '!=' 
  | '>' 
  | '>=' 
  | '<' 
  | '<=' 
  | 'between' 
  | 'in';

export interface Condition {
  id?: string;
  fact: string;
  op: ComparisonOperator;
  value: any; // e.g. 30000, [21, 60], true, etc.
}

export interface Rule {
  id: string;
  name: string;
  description?: string;
  conditions: Condition[]; // AND-combined
  conclusionFact: string;
  conclusionValue: any;
  explanation: string;
  failExplanation: string;
  mandatory: boolean;
  priority: number;
  active: boolean;
  isAggregator?: boolean;
}

export type WorkingMemory = Record<string, any>;

export interface ConditionTrace {
  fact: string;
  op: ComparisonOperator;
  expectedValue: any;
  actualValue: any;
  existsInMemory: boolean;
  satisfied: boolean;
}

export interface RuleEvaluationTrace {
  ruleId: string;
  ruleName: string;
  priority: number;
  mandatory: boolean;
  isAggregator?: boolean;
  passNumber: number;
  status: 'fired' | 'failed' | 'missing_facts' | 'already_fired';
  conditions: ConditionTrace[];
  derivedFact?: {
    name: string;
    value: any;
  };
  explanation: string;
}

export interface PassTrace {
  passNumber: number;
  rulesEvaluatedCount: number;
  rulesFiredInThisPass: string[]; // rule IDs
  newFactsDerived: Record<string, any>;
  workingMemorySnapshot: Record<string, any>;
}

export type DecisionOutcome = 'ELIGIBLE' | 'CONDITIONALLY_ELIGIBLE' | 'NOT_ELIGIBLE';

export interface InferenceResult {
  decision: DecisionOutcome;
  decisionReason: string;
  passesRequired: number;
  totalRulesEvaluated: number;
  rulesFired: string[];
  mandatoryBaseRulesFailed: string[];
  advisoryRulesFailed: string[];
  initialFacts: WorkingMemory;
  finalFacts: WorkingMemory;
  derivedFacts: Record<string, any>;
  passHistory: PassTrace[];
  ruleTraces: RuleEvaluationTrace[];
  evaluatedAt: string;
}

export interface LoanApplicationInput {
  applicantName: string;
  age: number;
  monthly_income: number;
  credit_score: number;
  employment_duration: number;
  previous_default: boolean;
  debt_to_income_ratio: number;
  active_loans: number;
  requested_amount: number;
  loan_tenure_months: number;
  loan_purpose: string;
  marital_status?: string;
  dependents?: number;
}

export interface ApplicationRecord {
  id: string;
  applicantId: string;
  applicantName: string;
  input: LoanApplicationInput;
  inferenceResult: InferenceResult;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'applicant' | 'admin';
}

export interface AuthUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'applicant' | 'admin';
  title?: string;
}

export interface StoredUserAccount extends AuthUser {
  password: string;
}
