import { Pipe, PipeTransform } from '@angular/core';

export const SALES_REGISTER_STATUS_META: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Borrador', color: '#757575' },
  Issued: { label: 'Emitida', color: '#1565c0' },
  PartiallyPaid: { label: 'Pago Parcial', color: '#ef6c00' },
  Paid: { label: 'Pagada', color: '#2e7d32' },
  Cancelled: { label: 'Anulada', color: '#c62828' },
};

export function getSalesRegisterStatusMeta(status: string): { label: string; color: string } {
  return SALES_REGISTER_STATUS_META[status] ?? { label: status, color: '#757575' };
}

export const SALES_REGISTER_STATUS_OPTIONS: { value: string | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'Draft', label: 'Borrador' },
  { value: 'Issued', label: 'Emitida' },
  { value: 'PartiallyPaid', label: 'Pago Parcial' },
  { value: 'Paid', label: 'Pagada' },
  { value: 'Cancelled', label: 'Anulada' },
];

@Pipe({
  name: 'salesRegisterStatusLabel',
  standalone: true,
})
export class SalesRegisterStatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    return getSalesRegisterStatusMeta(status).label;
  }
}

@Pipe({
  name: 'salesRegisterStatusColor',
  standalone: true,
})
export class SalesRegisterStatusColorPipe implements PipeTransform {
  transform(status: string): string {
    return getSalesRegisterStatusMeta(status).color;
  }
}
