import { Pipe, PipeTransform } from '@angular/core';
import { PayrollFrequency } from '../interfaces/IShared';

export const PAYROLL_FREQUENCY_META: Record<number, { label: string }> = {
  [PayrollFrequency.Biweekly]: { label: 'Quincenal' },
  [PayrollFrequency.Monthly]: { label: 'Mensual' },
};

export function getPayrollFrequencyLabel(value: number): string {
  return PAYROLL_FREQUENCY_META[value]?.label ?? 'Desconocido';
}

export const PAYROLL_FREQUENCY_OPTIONS = [
  { value: PayrollFrequency.Biweekly, label: 'Quincenal' },
  { value: PayrollFrequency.Monthly, label: 'Mensual' },
];

@Pipe({
  name: 'payrollFrequencyLabel',
  standalone: true,
})
export class PayrollFrequencyLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getPayrollFrequencyLabel(value);
  }
}
