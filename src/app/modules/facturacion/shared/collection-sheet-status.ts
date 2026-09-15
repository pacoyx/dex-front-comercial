import { Pipe, PipeTransform } from '@angular/core';

export enum CollectionSheetStatus {
  Open = 1,
  Closed = 2,
  Cancelled = 3,
}

export const COLLECTION_SHEET_STATUS_META: Record<number, { label: string; color: string }> = {
  [CollectionSheetStatus.Open]: { label: 'Abierta', color: '#1565c0' },
  [CollectionSheetStatus.Closed]: { label: 'Cerrada', color: '#2e7d32' },
  [CollectionSheetStatus.Cancelled]: { label: 'Anulada', color: '#c62828' },
};

export function getCollectionSheetStatusMeta(status: number): { label: string; color: string } {
  return COLLECTION_SHEET_STATUS_META[status] ?? { label: 'Desconocido', color: '#757575' };
}

@Pipe({
  name: 'collectionSheetStatusLabel',
  standalone: true,
})
export class CollectionSheetStatusLabelPipe implements PipeTransform {
  transform(status: number): string {
    return getCollectionSheetStatusMeta(status).label;
  }
}

@Pipe({
  name: 'collectionSheetStatusColor',
  standalone: true,
})
export class CollectionSheetStatusColorPipe implements PipeTransform {
  transform(status: number): string {
    return getCollectionSheetStatusMeta(status).color;
  }
}
