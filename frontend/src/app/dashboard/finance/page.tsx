"use client";

import { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Send,
  Bot,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTransactions, useBudgets, useFinanceSummary } from '@/hooks/useFinance';
import { api } from '@/lib/api';
import { TransactionForm } from './components/TransactionForm';
import { BudgetForm } from './components/BudgetForm';
import type {
  Transaction,
  Budget,
  TransactionCreate,
  TransactionUpdate,
  BudgetCreate,
  ChatMessage,
} from '@/types/finance';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'transactions' | 'budgets' | 'ai';

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'ai', label: 'AI Assistant' },
];

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

// ─── Overview Tab ───────────────────────────────────────────────────────────

function OverviewTab() {
  const now = new Date();
  const { data: summary, isLoading } = useFinanceSummary(
    now.getMonth() + 1,
    now.getFullYear()
  );
  const { query: txQuery } = useTransactions(now.getMonth() + 1, now.getFullYear());

  const byCategory = summary?.by_category ?? {};
  const pieData = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Bar chart: use current month as single bar entry (extend later with historical data)
  const barData = [
    {
      month: now.toLocaleString('default', { month: 'short' }),
      Income: summary?.total_income ?? 0,
      Expenses: summary?.total_expenses ?? 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Total Income"
          value={summary?.total_income ?? 0}
          icon={<TrendingUp className="h-5 w-5" />}
          colorClass="text-emerald-400"
          bgClass="bg-emerald-400/10"
        />
        <SummaryCard
          label="Total Expenses"
          value={summary?.total_expenses ?? 0}
          icon={<TrendingDown className="h-5 w-5" />}
          colorClass="text-rose-400"
          bgClass="bg-rose-400/10"
        />
        <SummaryCard
          label="Balance"
          value={summary?.balance ?? 0}
          icon={<Wallet className="h-5 w-5" />}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barGap={4}>
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-card)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  color: 'var(--color-foreground)',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', color: 'var(--color-muted-foreground)' }}
              />
              <Bar dataKey="Income" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Expense Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
              No expense data for this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-foreground)',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', color: 'var(--color-muted-foreground)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent transactions preview */}
      {txQuery.data && txQuery.data.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Transactions</h3>
          <div className="space-y-2">
            {txQuery.data.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">{tx.category}</span>
                  <span className="text-xs text-muted-foreground">
                    {tx.description ?? tx.date.split('T')[0]}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm font-medium tabular-nums',
                    tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  colorClass,
  bgClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={cn('rounded-lg p-2', bgClass, colorClass)}>{icon}</div>
      </div>
      <p className={cn('text-2xl font-semibold tabular-nums', colorClass)}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}

// ─── Transactions Tab ────────────────────────────────────────────────────────

function TransactionsTab() {
  const now = new Date();
  const { query, create, update, remove } = useTransactions(now.getMonth() + 1, now.getFullYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const handleCreate = (data: TransactionCreate | TransactionUpdate) => {
    create.mutate(data as TransactionCreate, {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleUpdate = (data: TransactionCreate | TransactionUpdate) => {
    if (!editing) return;
    update.mutate(
      { id: editing.id, data: data as TransactionUpdate },
      { onSuccess: () => setEditing(null) }
    );
  };

  const handleDelete = (id: string) => {
    remove.mutate(id);
  };

  const transactions = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">This Month</h2>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Transaction
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg h-14 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
          No transactions yet. Add your first one.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">{tx.category}</span>
                    <span
                      className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                        tx.type === 'income'
                          ? 'bg-emerald-400/10 text-emerald-400'
                          : 'bg-rose-400/10 text-rose-400'
                      )}
                    >
                      {tx.type}
                    </span>
                  </div>
                  {tx.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{tx.description}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                  {tx.date.split('T')[0]}
                </span>
                <span
                  className={cn(
                    'text-sm font-medium tabular-nums w-24 text-right',
                    tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </span>
                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => setEditing(tx)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={create.isPending}
      />
      <TransactionForm
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
        loading={update.isPending}
        initial={editing}
      />
    </div>
  );
}

// ─── Budgets Tab ─────────────────────────────────────────────────────────────

function BudgetsTab() {
  const now = new Date();
  const { query, create, update, remove } = useBudgets();
  const { query: txQuery } = useTransactions(now.getMonth() + 1, now.getFullYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  // Build spent per category from transactions
  const spentByCategory: Record<string, number> = {};
  (txQuery.data ?? []).forEach((tx) => {
    if (tx.type === 'expense') {
      spentByCategory[tx.category] = (spentByCategory[tx.category] ?? 0) + tx.amount;
    }
  });

  const handleCreate = (data: BudgetCreate) => {
    create.mutate(data, { onSuccess: () => setFormOpen(false) });
  };

  const handleUpdate = (data: BudgetCreate) => {
    if (!editing) return;
    update.mutate({ id: editing.id, data }, { onSuccess: () => setEditing(null) });
  };

  const budgets = query.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-foreground">Monthly Budgets</h2>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add Budget
        </Button>
      </div>

      {query.isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">
          No budgets yet. Create your first one.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {budgets.map((budget) => {
            const spent = spentByCategory[budget.category] ?? 0;
            const pct = Math.min((spent / budget.monthly_limit) * 100, 100);
            const over = spent > budget.monthly_limit;
            const warn = pct >= 75 && !over;
            const barColor = over
              ? 'bg-destructive'
              : warn
              ? 'bg-amber-400'
              : 'bg-emerald-400';

            return (
              <div key={budget.id} className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{budget.category}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCurrency(spent)} of {formatCurrency(budget.monthly_limit)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditing(budget)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => remove.mutate(budget.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', barColor)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p
                  className={cn(
                    'text-xs mt-1.5',
                    over ? 'text-destructive' : warn ? 'text-amber-400' : 'text-muted-foreground'
                  )}
                >
                  {over
                    ? `Over by ${formatCurrency(spent - budget.monthly_limit)}`
                    : `${formatCurrency(budget.monthly_limit - spent)} remaining`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <BudgetForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        loading={create.isPending}
      />
      <BudgetForm
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleUpdate}
        loading={update.isPending}
        initial={editing}
      />
    </div>
  );
}

// ─── AI Assistant Tab ─────────────────────────────────────────────────────────

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hello! I'm your financial assistant. I can see your spending data and help you analyze it, create budgets, or answer questions about your finances. What would you like to know?",
};

function AIAssistantTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const assistantMsg = await api.finance.chat(nextMessages, true);
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary/20 text-foreground'
                  : 'bg-card border border-border text-foreground'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-2.5">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border pt-4">
        <div className="flex gap-3 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances... (Enter to send)"
            rows={2}
            className="flex-1 resize-none bg-input border-border"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-10 w-10 flex-shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Finance</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track spending, set budgets, and get insights.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'transactions' && <TransactionsTab />}
      {activeTab === 'budgets' && <BudgetsTab />}
      {activeTab === 'ai' && <AIAssistantTab />}
    </div>
  );
}
