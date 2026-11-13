import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CatalogosService } from '../../../facturacion/services/catalogos.service';
import { IBranchSales } from '../../../facturacion/interfaces/ICatalogos';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { descargarArchivo } from '../../../gastos/shared/file-download.util';
import { FixedAssetsService } from '../../services/fixed-assets.service';
import {
  FixedAssetHistoryEventType,
  IFixedAssetCategory,
  IFixedAssetHistoryEvent,
  IFixedAssetHistoryFilters,
  IFixedAssetHistorySummary,
  IFixedAssetHistoryTotals,
  IFixedAssetListItem,
} from '../../interfaces/IFixedAsset';
import { FIXED_ASSET_STATUS_META, FixedAssetStatusColorPipe, FixedAssetStatusLabelPipe } from '../../shared/fixed-asset-status';
import { extractErrorMessage } from '../../shared/http-error.util';

interface TipoEvento {
  type: FixedAssetHistoryEventType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-fixed-assets-report',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, FormsModule, MatButtonModule, MatCardModule, MatChipsModule, MatFormFieldModule,
    MatIconModule, MatInputModule, MatProgressSpinnerModule, MatSelectModule, MatSortModule, MatTableModule,
    MatTabsModule, MatTooltipModule, FixedAssetStatusLabelPipe, FixedAssetStatusColorPipe,
  ],
  templateUrl: './fixed-assets-report.component.html',
  styleUrl: './fixed-assets-report.component.css',
})
export class FixedAssetsReportComponent implements OnInit {
  private fixedAssetsService = inject(FixedAssetsService);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private router = inject(Router);

  readonly estados = Object.entries(FIXED_ASSET_STATUS_META).map(([value, meta]) => ({ value: Number(value), label: meta.label }));
  readonly tiposEvento: TipoEvento[] = [
    { type: 'acquisition', label: 'Adquisición', icon: 'add_shopping_cart' },
    { type: 'reassignment', label: 'Reasignación', icon: 'swap_horiz' },
    { type: 'maintenance', label: 'Mantenimiento', icon: 'build' },
    { type: 'out-of-service', label: 'En mantenimiento (parada)', icon: 'engineering' },
    { type: 'disposal', label: 'Baja / venta', icon: 'delete_forever' },
  ];
  private readonly iconos = Object.fromEntries(this.tiposEvento.map(t => [t.type, t.icon])) as Record<string, string>;

  branches: IBranchSales[] = [];
  categories: IFixedAssetCategory[] = [];
  activos: IFixedAssetListItem[] = [];

  filtros: IFixedAssetHistoryFilters = this.filtrosVacios();
  tiposSeleccionados = new Set<FixedAssetHistoryEventType>(this.tiposEvento.map(t => t.type));

  cargando = false;
  exportando = false;
  descargandoFichaId: number | null = null;
  totals: IFixedAssetHistoryTotals | null = null;

  private eventos: IFixedAssetHistoryEvent[] = [];
  eventosFiltrados: IFixedAssetHistoryEvent[] = [];

  readonly columnasResumen = [
    'code', 'name', 'branchName', 'status', 'acquisitionCost', 'bookValue',
    'maintenanceCount', 'maintenanceCost', 'daysOutOfService', 'nextMaintenanceDate', 'acciones',
  ];
  resumen = new MatTableDataSource<IFixedAssetHistorySummary>([]);

  @ViewChild(MatSort) set sort(sort: MatSort) {
    if (sort) this.resumen.sort = sort;
  }

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({ next: (resp) => this.branches = resp.data });
    this.fixedAssetsService.listarCategorias().subscribe({ next: (resp) => this.categories = resp.data });
    this.fixedAssetsService.listar({}).subscribe({ next: (resp) => this.activos = resp.data });
    this.buscar();
  }

  private filtrosVacios(): IFixedAssetHistoryFilters {
    return { fromDate: '', toDate: '', branchId: null, categoryId: null, status: null, fixedAssetId: null };
  }

  buscar(): void {
    if (this.filtros.fromDate && this.filtros.toDate && this.filtros.fromDate > this.filtros.toDate) {
      this.notificationService.showError('La fecha "desde" no puede ser posterior a la fecha "hasta".');
      return;
    }

    this.cargando = true;
    this.fixedAssetsService.obtenerReporteHistorial(this.filtros).subscribe({
      next: (resp) => {
        this.cargando = false;
        this.totals = resp.data.totals;
        this.resumen.data = resp.data.assets;
        this.eventos = resp.data.events;
        this.aplicarFiltroEventos();
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar el reporte.'));
      },
    });
  }

  limpiar(): void {
    this.filtros = this.filtrosVacios();
    this.buscar();
  }

  toggleTipo(tipo: FixedAssetHistoryEventType): void {
    if (this.tiposSeleccionados.has(tipo)) this.tiposSeleccionados.delete(tipo);
    else this.tiposSeleccionados.add(tipo);
    this.aplicarFiltroEventos();
  }

  contarTipo(tipo: FixedAssetHistoryEventType): number {
    return this.eventos.filter(e => e.eventType === tipo).length;
  }

  private aplicarFiltroEventos(): void {
    this.eventosFiltrados = this.eventos.filter(e => this.tiposSeleccionados.has(e.eventType));
  }

  icono(tipo: string): string {
    return this.iconos[tipo] ?? 'event';
  }

  verActivo(id: number): void {
    this.router.navigate(['/fixed-assets', id]);
  }

  exportarExcel(): void {
    this.exportando = true;
    this.fixedAssetsService.descargarReporteHistorialExcel(this.filtros).subscribe({
      next: (resp) => {
        this.exportando = false;
        descargarArchivo(resp, 'HistorialActivosFijos.xlsx');
      },
      error: (err) => {
        this.exportando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo exportar el reporte.'));
      },
    });
  }

  descargarFicha(event: Event, activo: IFixedAssetHistorySummary): void {
    event.stopPropagation();
    this.descargandoFichaId = activo.fixedAssetId;
    this.fixedAssetsService.descargarFichaPdf(activo.fixedAssetId).subscribe({
      next: (resp) => {
        this.descargandoFichaId = null;
        descargarArchivo(resp, `FichaActivo_${activo.code}.pdf`);
      },
      error: (err) => {
        this.descargandoFichaId = null;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar la ficha.'));
      },
    });
  }

  volver(): void {
    this.router.navigate(['/fixed-assets']);
  }
}
