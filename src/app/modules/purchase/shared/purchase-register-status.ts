import { Pipe, PipeTransform } from '@angular/core';

export const PURCHASE_REGISTER_STATUS_META: Record<string, { label: string; color: string }> = {
  Pending: { label: 'Pendiente', color: '#757575' },
  PartiallyPaid: { label: 'Pago Parcial', color: '#ef6c00' },
  Paid: { label: 'Pagada', color: '#2e7d32' },
  Cancelled: { label: 'Anulada', color: '#c62828' },
};

export function getPurchaseRegisterStatusMeta(status: string): { label: string; color: string } {
  return PURCHASE_REGISTER_STATUS_META[status] ?? { label: status, color: '#757575' };
}

export const PURCHASE_REGISTER_STATUS_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 1, label: 'Pendiente' },
  { value: 2, label: 'Pago Parcial' },
  { value: 3, label: 'Pagada' },
  { value: 4, label: 'Anulada' },
];

@Pipe({
  name: 'purchaseRegisterStatusLabel',
  standalone: true,
})
export class PurchaseRegisterStatusLabelPipe implements PipeTransform {
  transform(status: string): string {
    return getPurchaseRegisterStatusMeta(status).label;
  }
}

@Pipe({
  name: 'purchaseRegisterStatusColor',
  standalone: true,
})
export class PurchaseRegisterStatusColorPipe implements PipeTransform {
  transform(status: string): string {
    return getPurchaseRegisterStatusMeta(status).color;
  }
}
