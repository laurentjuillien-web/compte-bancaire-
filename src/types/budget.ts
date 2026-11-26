export type TransactionType = 'credit' | 'debit';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  label: string;
  createdAt: string; // ISO string
}

export interface BudgetState {
  initialBalance: number;
  transactions: Transaction[];
  updatedAt: string;
}

export const STORAGE_KEY = 'mon_solde_budget_v1';

export const QUICK_LABELS: readonly string[] = [
  'Courses',
  'Carburant',
  'Resto',
  'Facture',
  'Virement',
  'Prime',
];

export function formatEuro(value: number, showSign = false): string {
  const absFormatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  if (showSign) {
    if (value > 0) return `+ ${absFormatted}`;
    if (value < 0) return `- ${absFormatted}`;
    return absFormatted;
  }

  return value < 0 ? `-${absFormatted}` : absFormatted;
}

export function parseFrenchAmount(raw: string): number | null {
  const cleaned = raw
    .trim()
    .replace(/\s+/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '');

  if (!cleaned) return null;

  // Handle multiple dots by keeping only the first decimal separator
  const parts = cleaned.split('.');
  const normalized =
    parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return Math.round(parsed * 100) / 100;
}

export function parseInitialAmount(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s+/g, '').replace(',', '.');
  if (trimmed === '') return 0;
  const isNegative = trimmed.startsWith('-');
  const cleaned = trimmed.replace(/[^\d.]/g, '');
  if (!cleaned) return null;

  const parts = cleaned.split('.');
  const normalized =
    parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleaned;

  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) return null;

  const rounded = Math.round(parsed * 100) / 100;
  return isNegative ? -rounded : rounded;
}

export function formatOperationDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)
  );

  const timeStr = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  if (diffDays === 0) {
    return `Aujourd'hui · ${timeStr}`;
  }
  if (diffDays === 1) {
    return `Hier · ${timeStr}`;
  }

  const dayStr = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
  }).format(date);

  return `${dayStr} · ${timeStr}`;
}

export function loadBudgetState(): BudgetState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        initialBalance: 0,
        transactions: [],
        updatedAt: new Date().toISOString(),
      };
    }
    const parsed = JSON.parse(raw) as Partial<BudgetState>;
    const initialBalance =
      typeof parsed.initialBalance === 'number' &&
      Number.isFinite(parsed.initialBalance)
        ? parsed.initialBalance
        : 0;
    const transactions = Array.isArray(parsed.transactions)
      ? parsed.transactions.filter(
          (item): item is Transaction =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            (item.type === 'credit' || item.type === 'debit') &&
            typeof item.amount === 'number' &&
            Number.isFinite(item.amount) &&
            item.amount > 0 &&
            typeof item.label === 'string' &&
            typeof item.createdAt === 'string'
        )
      : [];

    return {
      initialBalance,
      transactions,
      updatedAt:
        typeof parsed.updatedAt === 'string'
          ? parsed.updatedAt
          : new Date().toISOString(),
    };
  } catch {
    return {
      initialBalance: 0,
      transactions: [],
      updatedAt: new Date().toISOString(),
    };
  }
}

export function saveBudgetState(state: BudgetState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}
