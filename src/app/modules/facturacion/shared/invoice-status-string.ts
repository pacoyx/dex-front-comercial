import { Pipe, PipeTransform } from '@angular/core';
import { InvoiceStatusString } from '../interfaces/IInvoiceDashboard';

export const INVOICE_STATUS_STRING_META: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Borrador', color: '#757575' },
  Issued: { label: 'Emitida', color: '#1565c0' },
  PartiallyPaid: { label: 'Pago Parcial', color: '#ef6c00' },
  Paid: { label: 'Pagada', color: '#2e7d32' },
  Cancelled: { label: 'Anulada', color: '#c62828' },
};

export function getInvoiceStatusStringMeta(status: InvoiceStatusString | string): { label: string; color: string } {
  return INVOICE_STATUS_STRING_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'invoiceStatusStringLabel',
  standalone: true,
})
export class InvoiceStatusStringLabelPipe implements PipeTransform {
  transform(status: string): string {
    return getInvoiceStatusStringMeta(status).label;
  }
}

@Pipe({
  name: 'invoiceStatusStringColor',
  standalone: true,
})
export class InvoiceStatusStringColorPipe implements PipeTransform {
  transform(status: string): string {
    return getInvoiceStatusStringMeta(status).color;
  }
}
