import { Pipe, PipeTransform } from '@angular/core';
import { PickupGuideEmailStatus, PickupGuideStatus } from '../interfaces/IPickupGuide';

export { PickupGuideStatus, PickupGuideEmailStatus };

export const PICKUP_GUIDE_STATUS_META: Record<number, { label: string; color: string }> = {
  [PickupGuideStatus.Draft]: { label: 'Borrador', color: '#757575' },
  [PickupGuideStatus.Collected]: { label: 'Recolectada', color: '#1565c0' },
  [PickupGuideStatus.Processed]: { label: 'Procesada', color: '#6a1b9a' },
  [PickupGuideStatus.Invoiced]: { label: 'Facturada', color: '#2e7d32' },
  [PickupGuideStatus.Cancelled]: { label: 'Anulada', color: '#c62828' },
};

export const PICKUP_GUIDE_STATUS_OPTIONS: { value: PickupGuideStatus; label: string }[] = [
  { value: PickupGuideStatus.Draft, label: 'Borrador' },
  { value: PickupGuideStatus.Collected, label: 'Recolectada' },
  { value: PickupGuideStatus.Processed, label: 'Procesada' },
  { value: PickupGuideStatus.Invoiced, label: 'Facturada' },
  { value: PickupGuideStatus.Cancelled, label: 'Anulada' },
];

export function getPickupGuideStatusMeta(status: number): { label: string; color: string } {
  return PICKUP_GUIDE_STATUS_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'pickupGuideStatusLabel',
  standalone: true,
})
export class PickupGuideStatusLabelPipe implements PipeTransform {
  transform(status: number): string {
    return getPickupGuideStatusMeta(status).label;
  }
}

@Pipe({
  name: 'pickupGuideStatusColor',
  standalone: true,
})
export class PickupGuideStatusColorPipe implements PipeTransform {
  transform(status: number): string {
    return getPickupGuideStatusMeta(status).color;
  }
}

export const PICKUP_GUIDE_EMAIL_STATUS_META: Record<number, { label: string; color: string }> = {
  [PickupGuideEmailStatus.Pending]: { label: 'Pendiente', color: '#f9a825' },
  [PickupGuideEmailStatus.Sent]: { label: 'Enviado', color: '#2e7d32' },
  [PickupGuideEmailStatus.Failed]: { label: 'Fallido', color: '#c62828' },
};

export function getPickupGuideEmailStatusMeta(status: number): { label: string; color: string } {
  return PICKUP_GUIDE_EMAIL_STATUS_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'pickupGuideEmailStatusLabel',
  standalone: true,
})
export class PickupGuideEmailStatusLabelPipe implements PipeTransform {
  transform(status: number): string {
    return getPickupGuideEmailStatusMeta(status).label;
  }
}

@Pipe({
  name: 'pickupGuideEmailStatusColor',
  standalone: true,
})
export class PickupGuideEmailStatusColorPipe implements PipeTransform {
  transform(status: number): string {
    return getPickupGuideEmailStatusMeta(status).color;
  }
}
