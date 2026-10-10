import { Pipe, PipeTransform } from '@angular/core';
import { PickupGuideStatus } from '../interfaces/IPickupGuide';

export { PickupGuideStatus };

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
