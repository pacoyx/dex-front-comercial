import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { PICKUP_GUIDE_STATUS_OPTIONS, PickupGuideStatus } from '../../../../../shared/pickup-guide-status';

const FLUJO_LINEAL: PickupGuideStatus[] = [
  PickupGuideStatus.Draft,
  PickupGuideStatus.Collected,
  PickupGuideStatus.Processed,
  PickupGuideStatus.Invoiced,
];

@Component({
  selector: 'app-status-selector',
  standalone: true,
  imports: [MatChipsModule, MatIconModule],
  templateUrl: './status-selector.component.html',
  styleUrl: './status-selector.component.css'
})
export class StatusSelectorComponent {
  @Input() current: PickupGuideStatus = PickupGuideStatus.Draft;
  @Input() disabled = false;
  @Output() select = new EventEmitter<PickupGuideStatus>();

  readonly pasos = FLUJO_LINEAL.map(value => ({
    value,
    label: PICKUP_GUIDE_STATUS_OPTIONS.find(o => o.value === value)?.label ?? '',
  }));

  get isCancelled(): boolean {
    return this.current === PickupGuideStatus.Cancelled;
  }

  estadoPaso(value: PickupGuideStatus): 'completado' | 'actual' | 'pendiente' {
    if (this.isCancelled) return 'pendiente';
    if (value < this.current) return 'completado';
    if (value === this.current) return 'actual';
    return 'pendiente';
  }

  esSiguiente(value: PickupGuideStatus): boolean {
    const idx = FLUJO_LINEAL.indexOf(this.current);
    return !this.isCancelled && !this.disabled && FLUJO_LINEAL[idx + 1] === value;
  }

  onPasoClick(value: PickupGuideStatus): void {
    if (this.esSiguiente(value)) {
      this.select.emit(value);
    }
  }

}
