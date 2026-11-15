import { Pipe, PipeTransform } from '@angular/core';
import { InventoryMovementStatus, InventoryMovementType } from '../interfaces/IInventario';

/** Etiqueta, ícono y sentido de cada tipo de movimiento (in = ingresa, out = sale, both = transferencia). */
export const MOVEMENT_TYPE_META: Record<number, { label: string; icon: string; direction: 'in' | 'out' | 'both' | 'reverse'; manual: boolean }> = {
  [InventoryMovementType.InitialBalance]: { label: 'Inventario inicial', icon: 'inventory', direction: 'in', manual: true },
  [InventoryMovementType.PurchaseIn]: { label: 'Ingreso por compra', icon: 'shopping_cart', direction: 'in', manual: false },
  [InventoryMovementType.AdjustmentIn]: { label: 'Ajuste de ingreso', icon: 'add_circle', direction: 'in', manual: true },
  [InventoryMovementType.AdjustmentOut]: { label: 'Ajuste de salida', icon: 'remove_circle', direction: 'out', manual: true },
  [InventoryMovementType.Consumption]: { label: 'Consumo interno', icon: 'local_laundry_service', direction: 'out', manual: true },
  [InventoryMovementType.Transfer]: { label: 'Transferencia', icon: 'swap_horiz', direction: 'both', manual: true },
  [InventoryMovementType.Reversal]: { label: 'Anulación', icon: 'undo', direction: 'reverse', manual: false },
  [InventoryMovementType.SaleOut]: { label: 'Salida por venta', icon: 'point_of_sale', direction: 'out', manual: false },
};

export const MANUAL_MOVEMENT_TYPES = Object.entries(MOVEMENT_TYPE_META)
  .filter(([, meta]) => meta.manual)
  .map(([value, meta]) => ({ value: Number(value) as InventoryMovementType, label: meta.label, icon: meta.icon }));

export const ALL_MOVEMENT_TYPES = Object.entries(MOVEMENT_TYPE_META)
  .filter(([value]) => Number(value) !== InventoryMovementType.SaleOut)
  .map(([value, meta]) => ({ value: Number(value) as InventoryMovementType, label: meta.label }));

export function getMovementTypeLabel(type: number): string {
  return MOVEMENT_TYPE_META[type]?.label ?? 'Movimiento';
}

@Pipe({ name: 'movementTypeLabel', standalone: true })
export class MovementTypeLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getMovementTypeLabel(value);
  }
}

@Pipe({ name: 'movementTypeIcon', standalone: true })
export class MovementTypeIconPipe implements PipeTransform {
  transform(value: number): string {
    return MOVEMENT_TYPE_META[value]?.icon ?? 'sync_alt';
  }
}

@Pipe({ name: 'movementStatusLabel', standalone: true })
export class MovementStatusLabelPipe implements PipeTransform {
  transform(value: number): string {
    return value === InventoryMovementStatus.Cancelled ? 'Anulado' : 'Registrado';
  }
}

/** Fecha local yyyy-MM-dd para los parámetros de la API. */
export function toIsoDate(date: Date | null | undefined): string | null {
  if (!date) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function firstDayOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}
