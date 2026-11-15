import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { InventarioService } from '../../services/inventario.service';
import { IAreaOption, InventoryMovementType, IProductOption, IWarehouse } from '../../interfaces/IInventario';
import { MANUAL_MOVEMENT_TYPES, MOVEMENT_TYPE_META } from '../../shared/movement-type';
import { mensajeError } from '../../shared/http-error.util';
import { ProductPickerComponent } from '../../shared/product-picker/product-picker.component';

interface LineaMovimiento {
  product: IProductOption;
  quantity: number;
  unitCost: number | null;
}

@Component({
  selector: 'app-movimiento-nuevo',
  standalone: true,
  imports: [
    FormsModule, RouterModule, MatButtonModule, MatButtonToggleModule, MatCardModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatTableModule, MatTooltipModule, LoadingComponent, DecimalPipe, ProductPickerComponent
  ],
  templateUrl: './movimiento-nuevo.component.html',
  styleUrls: ['../../shared/inventario-page.css', './movimiento-nuevo.component.css']
})
export class MovimientoNuevoComponent implements OnInit {

  private inventarioService = inject(InventarioService);
  private notifications = inject(NotificationsSystemService);
  private router = inject(Router);

  readonly tipos = MANUAL_MOVEMENT_TYPES;
  readonly T = InventoryMovementType;

  almacenes: IWarehouse[] = [];
  areas: IAreaOption[] = [];

  tipo: InventoryMovementType = InventoryMovementType.Consumption;
  warehouseId: number | null = null;
  targetWarehouseId: number | null = null;
  areaId: number | null = null;
  reason = '';

  // Fila de captura
  productoNuevo: IProductOption | null = null;
  cantidadNueva: number | null = null;
  costoNuevo: number | null = null;

  lineas: LineaMovimiento[] = [];
  columnas = ['product', 'available', 'quantity', 'unitCost', 'actions'];

  guardando = false;
  errores: string[] = [];

  ngOnInit(): void {
    this.inventarioService.listarAlmacenes(true).subscribe({
      next: (resp) => {
        this.almacenes = resp.data;
        this.warehouseId = resp.data.find(a => a.isDefault)?.id ?? resp.data[0]?.id ?? null;
      }
    });
    this.inventarioService.listarAreas().subscribe({ next: (resp) => this.areas = resp.data });
  }

  get esIngreso(): boolean {
    return MOVEMENT_TYPE_META[this.tipo]?.direction === 'in';
  }

  /** El costo se pide en el inventario inicial (obligatorio) y en el ajuste de ingreso (opcional). */
  get pideCosto(): boolean {
    return this.tipo === InventoryMovementType.InitialBalance || this.tipo === InventoryMovementType.AdjustmentIn;
  }

  get destinos(): IWarehouse[] {
    return this.almacenes.filter(a => a.id !== this.warehouseId);
  }

  get valorEstimado(): number {
    return this.lineas.reduce((sum, l) => sum + l.quantity * (l.unitCost ?? 0), 0);
  }

  cambiarTipo(): void {
    this.errores = [];
    if (!this.pideCosto) {
      this.lineas.forEach(l => l.unitCost = null);
    }
  }

  cambiarAlmacen(): void {
    // El stock mostrado depende del almacén: se reinicia la captura para no mezclar saldos.
    this.lineas = [];
    this.productoNuevo = null;
    if (this.targetWarehouseId === this.warehouseId) this.targetWarehouseId = null;
  }

  /** Valida la fila de captura; devuelve el error o null si es válida. */
  private validarCaptura(): string | null {
    if (!this.productoNuevo) return 'Seleccione un producto.';
    if (!this.cantidadNueva || this.cantidadNueva <= 0) return 'Ingrese una cantidad mayor a cero.';
    if (this.tipo === InventoryMovementType.InitialBalance && (this.costoNuevo === null || this.costoNuevo < 0)) {
      return 'El inventario inicial requiere el costo unitario.';
    }
    const yaAgregado = this.lineas.find(l => l.product.id === this.productoNuevo!.id)?.quantity ?? 0;
    if (!this.esIngreso && this.cantidadNueva + yaAgregado > (this.productoNuevo.stock ?? 0)) {
      return `Stock insuficiente: disponible ${this.productoNuevo.stock ?? 0}.`;
    }
    return null;
  }

  agregarLinea(): void {
    const error = this.validarCaptura();
    this.errores = error ? [error] : [];
    if (error || !this.productoNuevo || !this.cantidadNueva) return;

    const existente = this.lineas.find(l => l.product.id === this.productoNuevo!.id);
    if (existente) {
      existente.quantity += this.cantidadNueva;
      if (this.costoNuevo !== null) existente.unitCost = this.costoNuevo;
    } else {
      this.lineas = [...this.lineas, { product: this.productoNuevo, quantity: this.cantidadNueva, unitCost: this.pideCosto ? this.costoNuevo : null }];
    }

    this.productoNuevo = null;
    this.cantidadNueva = null;
    this.costoNuevo = null;
  }

  quitarLinea(linea: LineaMovimiento): void {
    this.lineas = this.lineas.filter(l => l !== linea);
  }

  grabar(): void {
    this.errores = [];
    if (!this.warehouseId) this.errores.push('Seleccione el almacén.');
    if (this.tipo === InventoryMovementType.Transfer && !this.targetWarehouseId) this.errores.push('Seleccione el almacén destino.');
    if (this.tipo === InventoryMovementType.Consumption && !this.areaId) this.errores.push('Seleccione el área que consume.');
    if ((this.tipo === InventoryMovementType.AdjustmentIn || this.tipo === InventoryMovementType.AdjustmentOut) && !this.reason.trim()) {
      this.errores.push('Indique el motivo del ajuste.');
    }
    if (this.lineas.length === 0) this.errores.push('Agregue al menos un producto.');
    if (this.errores.length > 0) return;

    this.guardando = true;
    this.inventarioService.crearMovimiento({
      type: this.tipo,
      warehouseId: this.warehouseId!,
      targetWarehouseId: this.tipo === InventoryMovementType.Transfer ? this.targetWarehouseId : null,
      areaId: this.tipo === InventoryMovementType.Consumption ? this.areaId : null,
      reason: this.reason.trim() || null,
      lines: this.lineas.map(l => ({ productId: l.product.id, quantity: l.quantity, unitCost: this.pideCosto ? l.unitCost : null }))
    }).subscribe({
      next: (resp) => {
        this.guardando = false;
        this.notifications.showSuccess(resp.message || 'Movimiento registrado.');
        this.router.navigate(['/inventario/movimientos', resp.data.id]);
      },
      error: (err) => {
        this.guardando = false;
        this.errores = [mensajeError(err, 'No se pudo registrar el movimiento.')];
      }
    });
  }
}
