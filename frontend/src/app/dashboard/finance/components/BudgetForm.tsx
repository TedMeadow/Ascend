"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Budget, BudgetCreate } from '@/types/finance';

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BudgetCreate) => void;
  loading?: boolean;
  initial?: Budget | null;
}

export function BudgetForm({ open, onClose, onSubmit, loading, initial }: BudgetFormProps) {
  const [category, setCategory] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');

  useEffect(() => {
    if (initial) {
      setCategory(initial.category);
      setMonthlyLimit(String(initial.monthly_limit));
    } else {
      setCategory('');
      setMonthlyLimit('');
    }
  }, [initial, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category,
      monthly_limit: parseFloat(monthlyLimit),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="budget-category">Category</Label>
            <Input
              id="budget-category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food & Dining"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monthly-limit">Monthly Limit</Label>
            <Input
              id="monthly-limit"
              type="number"
              min="1"
              step="0.01"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : initial ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
