import { Pipe, PipeTransform } from '@angular/core';
import { LoanType } from '../interfaces/IShared';
import { ILoan } from '../interfaces/ILoans';

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

export const LOAN_NO_MODIFICABLE_MSG = 'No se puede modificar: ya tiene cuotas cobradas';

/**
 * Un préstamo/adelanto solo puede editarse o eliminarse si ninguna cuota ha sido cobrada
 * (misma regla que el backend).
 */
export function loanTieneCuotasCobradas(loan: ILoan): boolean {
  return loan.paidInstallments > 0
    || loan.isClosed
    || loan.balance < loan.amount
    || (loan.installments ?? []).some(c => c.isPaid || c.payrollId != null);
}

@Pipe({
  name: 'loanTypeLabel',
  standalone: true,
})
export class LoanTypeLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getLoanTypeLabel(value);
  }
}
