import { Pipe, PipeTransform } from '@angular/core';
import { EmployeeContractType } from '../interfaces/IShared';

export const EMPLOYEE_CONTRACT_TYPE_META: Record<number, { label: string }> = {
  [EmployeeContractType.Weekly]: { label: 'Semanal' },
  [EmployeeContractType.Biweekly]: { label: 'Quincenal' },
  [EmployeeContractType.Monthly]: { label: 'Mensual' },
  [EmployeeContractType.Payroll]: { label: 'Planilla' },
  [EmployeeContractType.Services]: { label: 'Recibo por Honorarios' },
};

export function getEmployeeContractTypeLabel(value: number): string {
  return EMPLOYEE_CONTRACT_TYPE_META[value]?.label ?? 'Desconocido';
}

export const EMPLOYEE_CONTRACT_TYPE_OPTIONS = [
  { value: EmployeeContractType.Weekly, label: 'Semanal' },
  { value: EmployeeContractType.Biweekly, label: 'Quincenal' },
  { value: EmployeeContractType.Monthly, label: 'Mensual' },
  { value: EmployeeContractType.Payroll, label: 'Planilla' },
  { value: EmployeeContractType.Services, label: 'Recibo por Honorarios / Servicios' },
];

@Pipe({
  name: 'employeeContractTypeLabel',
  standalone: true,
})
export class EmployeeContractTypeLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getEmployeeContractTypeLabel(value);
  }
}
