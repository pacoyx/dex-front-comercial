import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { InventarioService } from '../../services/inventario.service';
import { IAreaOption, IConsumptionRow, IStockItem, IWarehouse } from '../../interfaces/IInventario';
import { firstDayOfMonth, toIsoDate } from '../../shared/movement-type';
import { mensajeError } from '../../shared/http-error.util';
import { descargarArchivo } from '../../shared/file-download.util';

type Reporte = 'stock-valued' | 'consumption' | 'reorder';

@Component({
  selector: 'app-reportes-inventario',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatIconModule, MatInputModule,
    MatSelectModule, MatTabsModule, LoadingComponent, DecimalPipe
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './reportes-inventario.component.html',
  styleUrls: ['../../shared/inventario-page.css', './reportes-inventario.component.css']
})
export class ReportesInventarioComponent implements OnInit {

  private inventarioService = inject(InventarioService);
  private notifications = inject(NotificationsSystemService);

  almacenes: IWarehouse[] = [];
  areas: IAreaOption[] = [];
  exportando: string | null = null;

  // Stock valorizado
  stockWarehouseId: number | null = null;
  stock: IStockItem[] = [];
  cargandoStock = false;

  // Consumo
  desde: Date = firstDayOfMonth();
  hasta: Date = new Date();
  consumoWarehouseId: number | null = null;
  consumoAreaId: number | null = null;
  consumo: IConsumptionRow[] = [];
  cargandoConsumo = false;

  // Reposición
  reposicionWarehouseId: number | null = null;
  reposicion: IStockItem[] = [];
  cargandoReposicion = false;

  errorMessage = '';

  get valorStock(): number {
    return this.stock.reduce((s, i) => s + i.totalValue, 0);
  }

  get costoConsumo(): number {
    return this.consumo.reduce((s, i) => s + i.totalCost, 0);
  }

  ngOnInit(): void {
    this.inventarioService.listarAlmacenes(true).subscribe({ next: (resp) => this.almacenes = resp.data });
    this.inventarioService.listarAreas().subscribe({ next: (resp) => this.areas = resp.data });
    this.cargarStock();
    this.cargarConsumo();
    this.cargarReposicion();
  }

  cargarStock(): void {
    this.cargandoStock = true;
    this.inventarioService.consultarStock(this.stockWarehouseId, false, null).subscribe({
      next: (resp) => {
        this.cargandoStock = false;
        this.stock = resp.data.filter(s => s.quantity !== 0);
      },
      error: (err) => {
        this.cargandoStock = false;
        this.errorMessage = mensajeError(err, 'No se pudo cargar el stock.');
      }
    });
  }

  cargarConsumo(): void {
    if (this.hasta < this.desde) {
      this.errorMessage = 'La fecha "Hasta" no puede ser anterior a "Desde".';
      return;
    }
    this.errorMessage = '';
    this.cargandoConsumo = true;
    this.inventarioService.consumoPorArea(toIsoDate(this.desde)!, toIsoDate(this.hasta)!, this.consumoWarehouseId, this.consumoAreaId).subscribe({
      next: (resp) => {
        this.cargandoConsumo = false;
        this.consumo = resp.data;
      },
      error: (err) => {
        this.cargandoConsumo = false;
        this.errorMessage = mensajeError(err, 'No se pudo cargar el consumo.');
      }
    });
  }

  cargarReposicion(): void {
    this.cargandoReposicion = true;
    this.inventarioService.consultarStock(this.reposicionWarehouseId, true, null).subscribe({
      next: (resp) => {
        this.cargandoReposicion = false;
        this.reposicion = resp.data;
      },
      error: (err) => {
        this.cargandoReposicion = false;
        this.errorMessage = mensajeError(err, 'No se pudo cargar la reposición.');
      }
    });
  }

  exportar(reporte: Reporte, formato: 'excel' | 'pdf'): void {
    const filtros: Record<string, string | number | null> =
      reporte === 'stock-valued' ? { warehouseId: this.stockWarehouseId }
        : reporte === 'consumption' ? { from: toIsoDate(this.desde), to: toIsoDate(this.hasta), warehouseId: this.consumoWarehouseId, areaId: this.consumoAreaId }
          : { warehouseId: this.reposicionWarehouseId };

    this.exportando = `${reporte}-${formato}`;
    this.inventarioService.descargarReporte(reporte, formato, filtros).subscribe({
      next: (resp) => {
        this.exportando = null;
        descargarArchivo(resp, `${reporte}.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
      },
      error: (err) => {
        this.exportando = null;
        this.notifications.showError(mensajeError(err, 'No se pudo exportar el reporte.'));
      }
    });
  }
}
