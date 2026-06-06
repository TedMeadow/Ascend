export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string | null;
  date: string; // ISO
}

export interface TransactionCreate {
  type: TransactionType;
  amount: number;
  category: string;
  description?: string | null;
  date?: string;
}

export interface TransactionUpdate {
  type?: TransactionType;
  amount?: number;
  category?: string;
  description?: string | null;
  date?: string;
}

export interface Budget {
  id: string;
  category: string;
  monthly_limit: number;
}

export interface BudgetCreate {
  category: string;
  monthly_limit: number;
}

export interface BudgetUpdate {
  category?: string;
  monthly_limit?: number;
}

export interface FinanceSummary {
  total_income: number;
  total_expenses: number;
  balance: number;
  by_category: Record<string, number>;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
