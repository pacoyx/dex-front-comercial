import { Pipe, PipeTransform } from '@angular/core';

export enum ExpenseSourceType {
  Cash = 'Cash',
  BankTransfer = 'BankTransfer',
  DebitCard = 'DebitCard',
  CreditCard = 'CreditCard',
  CashBox = 'CashBox',
  Other = 'Other',
}

export const EXPENSE_SOURCE_TYPE_META: Record<string, { label: string; color: string }> = {
  [ExpenseSourceType.Cash]: { label: 'Efectivo', color: '#2e7d32' },
  [ExpenseSourceType.BankTransfer]: { label: 'Transferencia bancaria', color: '#1565c0' },
  [ExpenseSourceType.DebitCard]: { label: 'Tarjeta de débito', color: '#6a1b9a' },
  [ExpenseSourceType.CreditCard]: { label: 'Tarjeta de crédito', color: '#ef6c00' },
  [ExpenseSourceType.CashBox]: { label: 'Caja chica', color: '#00838f' },
  [ExpenseSourceType.Other]: { label: 'Otro', color: '#757575' },
};

export const EXPENSE_SOURCE_TYPE_OPTIONS = Object.entries(EXPENSE_SOURCE_TYPE_META).map(([value, meta]) => ({
  value: value as ExpenseSourceType,
  label: meta.label,
}));

export function getExpenseSourceTypeMeta(sourceType: string): { label: string; color: string } {
  return EXPENSE_SOURCE_TYPE_META[sourceType] ?? { label: sourceType, color: '#757575' };
}

@Pipe({
  name: 'expenseSourceTypeLabel',
  standalone: true,
})
export class ExpenseSourceTypeLabelPipe implements PipeTransform {
  transform(sourceType: string): string {
    return getExpenseSourceTypeMeta(sourceType).label;
  }
}

@Pipe({
  name: 'expenseSourceTypeColor',
  standalone: true,
})
export class ExpenseSourceTypeColorPipe implements PipeTransform {
  transform(sourceType: string): string {
    return getExpenseSourceTypeMeta(sourceType).color;
  }
}
