import { Pipe, PipeTransform } from '@angular/core';

export enum InvoiceStatus {
  Draft = 1,
  Issued = 2,
  PartiallyPaid = 3,
  Paid = 4,
  Cancelled = 5,
}

export const INVOICE_STATUS_META: Record<number, { label: string; color: string }> = {
  [InvoiceStatus.Draft]: { label: 'Borrador', color: '#757575' },
  [InvoiceStatus.Issued]: { label: 'Emitida', color: '#1565c0' },
  [InvoiceStatus.PartiallyPaid]: { label: 'Pago Parcial', color: '#ef6c00' },
  [InvoiceStatus.Paid]: { label: 'Pagada', color: '#2e7d32' },
  [InvoiceStatus.Cancelled]: { label: 'Anulada', color: '#c62828' },
};

export function getInvoiceStatusMeta(status: number): { label: string; color: string } {
  return INVOICE_STATUS_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'invoiceStatusLabel',
  standalone: true,
})
export class InvoiceStatusLabelPipe implements PipeTransform {
  transform(status: number): string {
    return getInvoiceStatusMeta(status).label;
  }
}

@Pipe({
  name: 'invoiceStatusColor',
  standalone: true,
})
export class InvoiceStatusColorPipe implements PipeTransform {
  transform(status: number): string {
    return getInvoiceStatusMeta(status).color;
  }
}
