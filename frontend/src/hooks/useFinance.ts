import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { TransactionCreate, TransactionUpdate, BudgetCreate, BudgetUpdate } from '@/types/finance';

// Query keys
const KEYS = {
  transactions: (month?: number, year?: number) =>
    ['finance', 'transactions', month, year] as const,
  summary: (month?: number, year?: number) =>
    ['finance', 'summary', month, year] as const,
  budgets: () => ['finance', 'budgets'] as const,
};

export function useTransactions(month?: number, year?: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: KEYS.transactions(month, year),
    queryFn: () => api.finance.getTransactions(month, year),
  });

  const create = useMutation({
    mutationFn: (data: TransactionCreate) => api.finance.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Transaction added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add transaction');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransactionUpdate }) =>
      api.finance.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Transaction updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update transaction');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.finance.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      toast.success('Transaction deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete transaction');
    },
  });

  return { query, create, update, remove };
}

export function useBudgets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: KEYS.budgets(),
    queryFn: () => api.finance.getBudgets(),
  });

  const create = useMutation({
    mutationFn: (data: BudgetCreate) => api.finance.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      toast.success('Budget created');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create budget');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BudgetUpdate }) =>
      api.finance.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      toast.success('Budget updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update budget');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.finance.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
      toast.success('Budget deleted');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete budget');
    },
  });

  return { query, create, update, remove };
}

export function useFinanceSummary(month?: number, year?: number) {
  return useQuery({
    queryKey: KEYS.summary(month, year),
    queryFn: () => api.finance.getSummary(month, year),
  });
}
