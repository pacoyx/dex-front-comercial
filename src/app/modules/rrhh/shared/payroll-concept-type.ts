import { Pipe, PipeTransform } from '@angular/core';
import { PayrollConceptType } from '../interfaces/IShared';

export const PAYROLL_CONCEPT_TYPE_META: Record<number, { label: string }> = {
  [PayrollConceptType.BaseSalary]: { label: 'Sueldo Base' },
  [PayrollConceptType.ExtraHours]: { label: 'Horas Extras' },
  [PayrollConceptType.Bonus]: { label: 'Bono' },
  [PayrollConceptType.LoanDiscount]: { label: 'Descuento por Préstamo' },
  [PayrollConceptType.AdvanceDiscount]: { label: 'Descuento por Adelanto' },
  [PayrollConceptType.AbsenceDiscount]: { label: 'Descuento por Falta' },
  [PayrollConceptType.LateArrivalDiscount]: { label: 'Descuento por Tardanza' },
};

export function getPayrollConceptTypeLabel(value: number): string {
  return PAYROLL_CONCEPT_TYPE_META[value]?.label ?? 'Otro';
}

@Pipe({
  name: 'payrollConceptTypeLabel',
  standalone: true,
})
export class PayrollConceptTypeLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getPayrollConceptTypeLabel(value);
  }
}
