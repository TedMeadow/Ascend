import { http } from './_base';
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
  Budget,
  BudgetCreate,
  BudgetUpdate,
  FinanceSummary,
  ChatMessage,
} from '@/types/finance';

export const financeService = {
  getSummary: (month?: number, year?: number): Promise<FinanceSummary> => {
    const params = new URLSearchParams();
    if (month !== undefined) params.set('month', String(month));
    if (year !== undefined) params.set('year', String(year));
    const query = params.toString();
    return http.request<FinanceSummary>(`/finance/summary${query ? `?${query}` : ''}`);
  },

  getTransactions: (month?: number, year?: number): Promise<Transaction[]> => {
    const params = new URLSearchParams();
    if (month !== undefined) params.set('month', String(month));
    if (year !== undefined) params.set('year', String(year));
    const query = params.toString();
    return http.request<Transaction[]>(`/finance/transactions${query ? `?${query}` : ''}`);
  },

  createTransaction: (data: TransactionCreate): Promise<Transaction> =>
    http.request<Transaction>('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTransaction: (id: string, data: TransactionUpdate): Promise<Transaction> =>
    http.request<Transaction>(`/finance/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTransaction: (id: string): Promise<null> =>
    http.request<null>(`/finance/transactions/${id}`, { method: 'DELETE' }),

  getBudgets: (): Promise<Budget[]> =>
    http.request<Budget[]>('/finance/budgets'),

  createBudget: (data: BudgetCreate): Promise<Budget> =>
    http.request<Budget>('/finance/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateBudget: (id: string, data: BudgetUpdate): Promise<Budget> =>
    http.request<Budget>(`/finance/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteBudget: (id: string): Promise<null> =>
    http.request<null>(`/finance/budgets/${id}`, { method: 'DELETE' }),

  chat: (messages: ChatMessage[], includeContext = true): Promise<ChatMessage> =>
    http.request<ChatMessage>('/finance/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, include_context: includeContext }),
    }),
};
