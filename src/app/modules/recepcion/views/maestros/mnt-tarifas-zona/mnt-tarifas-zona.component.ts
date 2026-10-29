import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { WebOrdersService } from '../../../services/web-orders.service';
import { NotificationServiceService } from '../../../services/notification-service.service';
import { IZone } from '../../../interfaces/IDistrict';
import { IZonePriceListSummary } from '../../../interfaces/IZonePriceList';
import { DialogFormTarifaZonaComponent } from './components/dialog-form-tarifa-zona/dialog-form-tarifa-zona.component';
import { DialogQuestionComponent } from '../../../components/dialog-question/dialog-question.component';
import { extractErrorMessage } from '../../../shared/http-error.util';

@Component({
  selector: 'app-mnt-tarifas-zona',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule, MatTabsModule, MatTooltipModule, DatePipe],
  templateUrl: './mnt-tarifas-zona.component.html',
  styleUrl: './mnt-tarifas-zona.component.css'
})
export class MntTarifasZonaComponent implements OnInit {
  webOrdersService = inject(WebOrdersService);
  notificationService = inject(NotificationServiceService);
  dialog = inject(MatDialog);

  zonas: IZone[] = [];
  selectedZoneIndex = 0;
  loadingZonas = false;

  displayedColumns: string[] = ['name', 'version', 'effectiveFrom', 'effectiveTo', 'isActive', 'operaciones'];
  dataSource = new MatTableDataSource<IZonePriceListSummary>([]);

  ngOnInit(): void {
    this.loadingZonas = true;
    this.webOrdersService.obtenerZonas().subscribe({
      next: (resp) => {
        this.zonas = resp.data;
        this.loadingZonas = false;
        this.cargarTarifas();
      },
      error: (err) => {
        this.loadingZonas = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el catálogo de zonas.'));
      }
    });
  }

  get zonaActual(): IZone | null {
    return this.zonas[this.selectedZoneIndex] ?? null;
  }

  onZoneChange(index: number): void {
    this.selectedZoneIndex = index;
    this.cargarTarifas();
  }

  cargarTarifas(): void {
    if (!this.zonaActual) return;

    this.webOrdersService.listarTarifasPorZona(this.zonaActual.id).subscribe({
      next: (resp) => {
        this.dataSource = new MatTableDataSource(resp.data);
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las tarifas de la zona.'));
      }
    });
  }

  nuevaVersion(): void {
    if (!this.zonaActual) return;

    this.dialog.open(DialogFormTarifaZonaComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { esNuevo: true, zoneId: this.zonaActual.id, zoneName: this.zonaActual.name, tarifaId: null }
    }).afterClosed().subscribe((result) => {
      if (result) this.cargarTarifas();
    });
  }

  editarTarifa(item: IZonePriceListSummary): void {
    this.dialog.open(DialogFormTarifaZonaComponent, {
      width: '640px',
      maxWidth: '95vw',
      data: { esNuevo: false, zoneId: item.zoneId, zoneName: item.zoneName, tarifaId: item.id }
    }).afterClosed().subscribe((result) => {
      if (result) this.cargarTarifas();
    });
  }

  activarTarifa(item: IZonePriceListSummary): void {
    this.dialog.open(DialogQuestionComponent, {
      data: { title: 'Activar Tarifa', message: `¿Activar la tarifa "${item.name}" (v${item.version})? Se desactivará la tarifa activa actual de la zona.`, msgButton: 'Activar' }
    }).afterClosed().subscribe((result) => {
      if (result !== 'OK') return;

      this.webOrdersService.activarTarifaPorZona(item.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Tarifa activada correctamente.');
          this.cargarTarifas();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo activar la tarifa.'));
        }
      });
    });
  }

  desactivarTarifa(item: IZonePriceListSummary): void {
    this.dialog.open(DialogQuestionComponent, {
      data: { title: 'Desactivar Tarifa', message: `¿Desactivar la tarifa "${item.name}" (v${item.version})?`, msgButton: 'Desactivar' }
    }).afterClosed().subscribe((result) => {
      if (result !== 'OK') return;

      this.webOrdersService.desactivarTarifaPorZona(item.id).subscribe({
        next: () => {
          this.notificationService.showSuccess('Tarifa desactivada correctamente.');
          this.cargarTarifas();
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo desactivar la tarifa.'));
        }
      });
    });
  }
}
