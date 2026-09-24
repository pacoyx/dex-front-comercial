import { Pipe, PipeTransform } from '@angular/core';
import { LoanType } from '../interfaces/IShared';

export const LOAN_TYPE_META: Record<number, { label: string }> = {
  [LoanType.Loan]: { label: 'Préstamo' },
  [LoanType.SalaryAdvance]: { label: 'Adelanto de Sueldo' },
};

export function getLoanTypeLabel(value: number): string {
  return LOAN_TYPE_META[value]?.label ?? 'Desconocido';
}

export const LOAN_TYPE_OPTIONS = [
  { value: LoanType.Loan, label: 'Préstamo' },
  { value: LoanType.SalaryAdvance, label: 'Adelanto de Sueldo' },
];

@Pipe({
  name: 'loanTypeLabel',
  standalone: true,
})
export class LoanTypeLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getLoanTypeLabel(value);
  }
}
