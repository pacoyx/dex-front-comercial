import { Pipe, PipeTransform } from '@angular/core';

export enum FixedAssetStatus {
  Active = 1,
  InMaintenance = 2,
  Disposed = 3,
  Sold = 4,
}

export const FIXED_ASSET_STATUS_META: Record<number, { label: string; color: string }> = {
  [FixedAssetStatus.Active]: { label: 'Activo', color: '#2e7d32' },
  [FixedAssetStatus.InMaintenance]: { label: 'En Mantenimiento', color: '#ef6c00' },
  [FixedAssetStatus.Disposed]: { label: 'De Baja', color: '#c62828' },
  [FixedAssetStatus.Sold]: { label: 'Vendido', color: '#757575' },
};

export function getFixedAssetStatusMeta(status: number): { label: string; color: string } {
  return FIXED_ASSET_STATUS_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'fixedAssetStatusLabel',
  standalone: true,
})
export class FixedAssetStatusLabelPipe implements PipeTransform {
  transform(status: number): string {
    return getFixedAssetStatusMeta(status).label;
  }
}

@Pipe({
  name: 'fixedAssetStatusColor',
  standalone: true,
})
export class FixedAssetStatusColorPipe implements PipeTransform {
  transform(status: number): string {
    return getFixedAssetStatusMeta(status).color;
  }
}

export enum FixedAssetMaintenanceType {
  Preventive = 1,
  Corrective = 2,
}

export const FIXED_ASSET_MAINTENANCE_TYPE_LABELS: Record<number, string> = {
  [FixedAssetMaintenanceType.Preventive]: 'Preventivo',
  [FixedAssetMaintenanceType.Corrective]: 'Correctivo',
};

@Pipe({
  name: 'fixedAssetMaintenanceTypeLabel',
  standalone: true,
})
export class FixedAssetMaintenanceTypeLabelPipe implements PipeTransform {
  transform(type: number): string {
    return FIXED_ASSET_MAINTENANCE_TYPE_LABELS[type] ?? 'Desconocido';
  }
}
