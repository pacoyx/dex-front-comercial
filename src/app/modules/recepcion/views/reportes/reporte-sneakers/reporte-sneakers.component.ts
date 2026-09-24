import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { CustomDateAdapter } from '../../../config/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../config/custom-date-formats';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { InspeccionService } from '../../../services/inspeccion.service';
import { MaestrosService } from '../../../services/maestros.service';
import { SneakerBrandResponse, SneakerReportFilters, SneakerReportRowResponse } from '../../../interfaces/IInspeccion';
import { ISucursalesCombo } from '../../../interfaces/IReports';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';

const DELIVERY_STATUS_LABEL: Record<string, string> = {
  Pending: 'Pendiente',
  Delivered: 'Entregado',
  Returned: 'Devuelto',
  Unknown: 'Desconocido'
};

@Component({
  selector: 'app-reporte-sneakers',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatCheckboxModule, MatDatepickerModule,
    MatTableModule, MatCardModule, LoadingComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './reporte-sneakers.component.html',
  styleUrl: './reporte-sneakers.component.css'
})
export class ReporteSneakersComponent implements OnInit {

  private inspeccionService = inject(InspeccionService);
  private maestrosService = inject(MaestrosService);

  dateFrom: Date | null = null;
  dateTo: Date | null = null;
  branchId: number | null = null;
  brandId: number | null = null;
  ticketStatus: 'P' | 'E' | 'F' | null = null;
  pendingDelivery = false;

  sucursales: ISucursalesCombo[] = [];
  marcas: SneakerBrandResponse[] = [];

  displayedColumns: string[] = [
    'workGuideNumber', 'customerName', 'brand', 'primaryColor',
    'hasLaces', 'hasInsoles', 'deliveryStatus', 'photoCount'
  ];
  dataSource = new MatTableDataSource<SneakerReportRowResponse>([]);

  loading = false;
  errorMessage = '';
  validationErrors: string[] = [];

  ngOnInit(): void {
    this.maestrosService.obtenerSucursalesCombo().subscribe({
      next: (resp) => this.sucursales = resp.data,
      error: (err) => console.log(err)
    });
    this.inspeccionService.listarMarcasZapatilla().subscribe({
      next: (resp) => this.marcas = resp.data,
      error: (err) => console.log(err)
    });
  }

  traducirEstadoEntrega(estado: string): string {
    return DELIVERY_STATUS_LABEL[estado] ?? estado;
  }

  private toIsoDate(date: Date | null): string | null {
    if (!date) return null;
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  buscar(): void {
    this.errorMessage = '';
    this.validationErrors = [];

    if (this.dateFrom && this.dateTo && this.dateTo < this.dateFrom) {
      this.validationErrors = ['La fecha "Hasta" debe ser mayor o igual a la fecha "Desde".'];
      return;
    }

    const filtros: SneakerReportFilters = {
      dateFrom: this.toIsoDate(this.dateFrom),
      dateTo: this.toIsoDate(this.dateTo),
      branchId: this.branchId,
      brandId: this.brandId,
      ticketStatus: this.ticketStatus,
      pendingDelivery: this.pendingDelivery || null
    };

    this.loading = true;
    this.inspeccionService.obtenerReporteZapatillas(filtros).subscribe({
      next: (resp) => {
        this.loading = false;
        this.dataSource.data = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.dataSource.data = [];
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.errorMessage = extractErrorMessage(err, 'Ocurrió un error al obtener el reporte de zapatillas.');
        }
      }
    });
  }

  limpiar(): void {
    this.dateFrom = null;
    this.dateTo = null;
    this.branchId = null;
    this.brandId = null;
    this.ticketStatus = null;
    this.pendingDelivery = false;
    this.errorMessage = '';
    this.validationErrors = [];
    this.dataSource.data = [];
  }
}
