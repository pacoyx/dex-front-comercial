import { Pipe, PipeTransform } from '@angular/core';
import { InvoiceReminderLogStatus } from '../interfaces/IInvoiceReminder';

export const INVOICE_REMINDER_STATUS_META: Record<number, { label: string; color: string }> = {
  [InvoiceReminderLogStatus.Sent]: { label: 'Enviado', color: '#2e7d32' },
  [InvoiceReminderLogStatus.Failed]: { label: 'Fallido', color: '#c62828' },
  [InvoiceReminderLogStatus.Skipped]: { label: 'Omitido', color: '#757575' },
};

export function getInvoiceReminderStatusMeta(status: number): { label: string; color: string } {
  return INVOICE_REMINDER_STATUS_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'invoiceReminderStatusLabel',
  standalone: true,
})
export class InvoiceReminderStatusLabelPipe implements PipeTransform {
  transform(status: number): string {
    return getInvoiceReminderStatusMeta(status).label;
  }
}

@Pipe({
  name: 'invoiceReminderStatusColor',
  standalone: true,
})
export class InvoiceReminderStatusColorPipe implements PipeTransform {
  transform(status: number): string {
    return getInvoiceReminderStatusMeta(status).color;
  }
}
