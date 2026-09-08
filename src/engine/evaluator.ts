import { ComparisonOperator, Condition, ConditionTrace, WorkingMemory } from '../types';

/**
 * Safely evaluates a single condition against current working memory.
 */
export function evaluateCondition(
  condition: Condition,
  workingMemory: WorkingMemory
): ConditionTrace {
  const factName = condition.fact.trim();
  const existsInMemory = Object.prototype.hasOwnProperty.call(workingMemory, factName) && workingMemory[factName] !== undefined;
  const actualValue = existsInMemory ? workingMemory[factName] : undefined;
  const expectedValue = condition.value;

  if (!existsInMemory) {
    return {
      fact: factName,
      op: condition.op,
      expectedValue,
      actualValue: undefined,
      existsInMemory: false,
      satisfied: false,
    };
  }

  let satisfied = false;

  switch (condition.op) {
    case '==':
      // Loose or strict equality considering boolean & numeric coercion
      satisfied = String(actualValue).toLowerCase() === String(expectedValue).toLowerCase();
      break;

    case '!=':
      satisfied = String(actualValue).toLowerCase() !== String(expectedValue).toLowerCase();
      break;

    case '>':
      satisfied = Number(actualValue) > Number(expectedValue);
      break;

    case '>=':
      satisfied = Number(actualValue) >= Number(expectedValue);
      break;

    case '<':
      satisfied = Number(actualValue) < Number(expectedValue);
      break;

    case '<=':
      satisfied = Number(actualValue) <= Number(expectedValue);
      break;

    case 'between': {
      // Handles [min, max] or string "min,max"
      let min = 0;
      let max = 0;
      if (Array.isArray(expectedValue) && expectedValue.length === 2) {
        min = Number(expectedValue[0]);
        max = Number(expectedValue[1]);
      } else if (typeof expectedValue === 'string') {
        const parts = expectedValue.split(',').map((s) => Number(s.trim()));
        min = parts[0] ?? 0;
        max = parts[1] ?? 0;
      }
      const numVal = Number(actualValue);
      satisfied = numVal >= min && numVal <= max;
      break;
    }

    case 'in': {
      if (Array.isArray(expectedValue)) {
        satisfied = expectedValue.some((v) => String(v).toLowerCase() === String(actualValue).toLowerCase());
      } else if (typeof expectedValue === 'string') {
        const parts = expectedValue.split(',').map((s) => s.trim().toLowerCase());
        satisfied = parts.includes(String(actualValue).toLowerCase());
      }
      break;
    }

    default:
      satisfied = false;
  }

  return {
    fact: factName,
    op: condition.op,
    expectedValue,
    actualValue,
    existsInMemory: true,
    satisfied,
  };
}
