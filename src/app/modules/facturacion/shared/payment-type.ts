import { Pipe, PipeTransform } from '@angular/core';

export const PAYMENT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'contado', label: 'Contado' },
  { value: 'credito', label: 'Crédito' },
];

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  contado: 'Contado',
  credito: 'Crédito',
};

@Pipe({
  name: 'paymentTypeLabel',
  standalone: true,
})
export class PaymentTypeLabelPipe implements PipeTransform {
  transform(typePayment: string): string {
    return PAYMENT_TYPE_LABELS[typePayment] ?? typePayment;
  }
}
