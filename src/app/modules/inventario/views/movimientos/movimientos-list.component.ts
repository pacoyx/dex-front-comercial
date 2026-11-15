import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { InventarioService } from '../../services/inventario.service';
import { IMovementListItem, InventoryMovementStatus, InventoryMovementType, IWarehouse } from '../../interfaces/IInventario';
import { ALL_MOVEMENT_TYPES, MovementStatusLabelPipe, MovementTypeIconPipe, MovementTypeLabelPipe, toIsoDate } from '../../shared/movement-type';
import { mensajeError } from '../../shared/http-error.util';

@Component({
  selector: 'app-movimientos-list',
  standalone: true,
  imports: [
    FormsModule, RouterModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatTableModule, LoadingComponent, DatePipe, DecimalPipe,
    MovementTypeLabelPipe, MovementTypeIconPipe, MovementStatusLabelPipe
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './movimientos-list.component.html',
  styleUrl: '../../shared/inventario-page.css'
})
export class MovimientosListComponent implements OnInit {

  private inventarioService = inject(InventarioService);
  private router = inject(Router);

  readonly tipos = ALL_MOVEMENT_TYPES;
  readonly Cancelled = InventoryMovementStatus.Cancelled;

  almacenes: IWarehouse[] = [];
  desde: Date = new Date(new Date().setDate(new Date().getDate() - 30));
  hasta: Date = new Date();
  tipo: InventoryMovementType | null = null;
  warehouseId: number | null = null;
  estado: InventoryMovementStatus | null = null;

  movimientos: IMovementListItem[] = [];
  columnas = ['number', 'date', 'type', 'warehouse', 'detail', 'lines', 'total', 'status'];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.inventarioService.listarAlmacenes().subscribe({ next: (resp) => this.almacenes = resp.data });
    this.buscar();
  }

  buscar(): void {
    if (this.desde && this.hasta && this.hasta < this.desde) {
      this.errorMessage = 'La fecha "Hasta" no puede ser anterior a "Desde".';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.inventarioService.listarMovimientos({
      from: toIsoDate(this.desde), to: toIsoDate(this.hasta), type: this.tipo, warehouseId: this.warehouseId, status: this.estado
    }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.movimientos = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.movimientos = [];
        this.errorMessage = mensajeError(err, 'No se pudieron cargar los movimientos.');
      }
    });
  }

  limpiar(): void {
    this.desde = new Date(new Date().setDate(new Date().getDate() - 30));
    this.hasta = new Date();
    this.tipo = null;
    this.warehouseId = null;
    this.estado = null;
    this.buscar();
  }

  detalle(m: IMovementListItem): string {
    if (m.type === InventoryMovementType.PurchaseIn) return `Compra ${m.purchaseInvoiceRef ?? ''}`;
    if (m.type === InventoryMovementType.Transfer) return `→ ${m.targetWarehouseName ?? ''}${m.reason ? ' · ' + m.reason : ''}`;
    if (m.type === InventoryMovementType.Consumption) return `${m.areaName ?? ''}${m.reason ? ' · ' + m.reason : ''}`;
    return m.reason ?? '';
  }

  abrir(m: IMovementListItem): void {
    this.router.navigate(['/inventario/movimientos', m.id]);
  }
}
