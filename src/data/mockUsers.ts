import { AuthUser, StoredUserAccount } from '../types';

export const DEFAULT_ACCOUNTS: StoredUserAccount[] = [
  // Admin / Underwriter Accounts
  {
    id: 'USR-ADMIN-001',
    userId: 'admin',
    password: 'admin123',
    name: 'Chief Underwriter',
    email: 'admin@credichain.ai',
    role: 'admin',
    title: 'Senior Credit Risk Administrator',
  },
  {
    id: 'USR-ADMIN-002',
    userId: 'underwriter',
    password: 'underwriter123',
    name: 'Dr. Julian Reed',
    email: 'j.reed@credichain.ai',
    role: 'admin',
    title: 'Principal Underwriter & Risk Modeler',
  },

  // Applicant Accounts
  {
    id: 'USR-APP-001',
    userId: 'applicant',
    password: 'applicant123',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    role: 'applicant',
    title: 'Prime Credit Applicant',
  },
  {
    id: 'USR-APP-002',
    userId: 'marcus',
    password: 'marcus123',
    name: 'Marcus Vance',
    email: 'marcus.vance@example.com',
    role: 'applicant',
    title: 'Applicant (Borderline Profile)',
  },
  {
    id: 'USR-APP-003',
    userId: 'sarah',
    password: 'sarah123',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'applicant',
    title: 'Applicant (High Risk Profile)',
  },
];

const STORAGE_KEY = 'credichain_accounts';

export function getStoredAccounts(): StoredUserAccount[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
  return DEFAULT_ACCOUNTS;
}

export function saveAccount(account: StoredUserAccount): void {
  const accounts = getStoredAccounts();
  const existingIndex = accounts.findIndex(
    (a) => a.userId.toLowerCase() === account.userId.toLowerCase()
  );
  if (existingIndex >= 0) {
    accounts[existingIndex] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function authenticateUser(
  userId: string,
  pass: string,
  expectedRole?: 'applicant' | 'admin'
): { success: boolean; user?: AuthUser; message?: string } {
  const accounts = getStoredAccounts();
  const cleanUserId = userId.trim().toLowerCase();
  const cleanPass = pass.trim();

  const account = accounts.find(
    (a) =>
      a.userId.toLowerCase() === cleanUserId ||
      a.email.toLowerCase() === cleanUserId
  );

  if (!account) {
    return {
      success: false,
      message: `User ID "${userId}" not found in CrediChain user directory.`,
    };
  }

  if (account.password !== cleanPass) {
    return {
      success: false,
      message: 'Incorrect password. Please verify credentials and try again.',
    };
  }

  if (expectedRole && account.role !== expectedRole) {
    return {
      success: false,
      message: `Access denied. Account "${account.userId}" is authorized for the ${account.role.toUpperCase()} portal, not the ${expectedRole.toUpperCase()} portal.`,
    };
  }

  const { password, ...safeUser } = account;
  return {
    success: true,
    user: safeUser,
  };
}
