import { Pipe, PipeTransform } from '@angular/core';

export enum PurchaseInvoiceStatus {
  Pending = 1,
  PartiallyPaid = 2,
  Paid = 3,
  Cancelled = 4,
}

export const PURCHASE_INVOICE_STATUS_META: Record<number, { label: string; color: string }> = {
  [PurchaseInvoiceStatus.Pending]: { label: 'Pendiente', color: '#757575' },
  [PurchaseInvoiceStatus.PartiallyPaid]: { label: 'Pago Parcial', color: '#ef6c00' },
  [PurchaseInvoiceStatus.Paid]: { label: 'Pagada', color: '#2e7d32' },
  [PurchaseInvoiceStatus.Cancelled]: { label: 'Anulada', color: '#c62828' },
};

export function getPurchaseInvoiceStatusMeta(status: number): { label: string; color: string } {
  return PURCHASE_INVOICE_STATUS_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'purchaseInvoiceStatusLabel',
  standalone: true,
})
export class PurchaseInvoiceStatusLabelPipe implements PipeTransform {
  transform(status: number): string {
    return getPurchaseInvoiceStatusMeta(status).label;
  }
}

@Pipe({
  name: 'purchaseInvoiceStatusColor',
  standalone: true,
})
export class PurchaseInvoiceStatusColorPipe implements PipeTransform {
  transform(status: number): string {
    return getPurchaseInvoiceStatusMeta(status).color;
  }
}
