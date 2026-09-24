import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { ReportesEmisionService } from '../../../services/reportes-emision.service';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../config/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../config/custom-date-formats';
import { MaestrosService } from '../../../services/maestros.service';
import { IDashboardCashWeekDayDto, ISucursalesCombo } from '../../../interfaces/IReports';
import { ChartdashcajaComponent } from '../../../components/chartdashcaja/chartdashcaja.component';

interface IDataGraficoCaja {
  sucursal: string;
  tipoPagos: string[];
  importes: number[];
}

function obtenerLunesDeLaSemana(fecha: Date): Date {
  const date = new Date(fecha);
  const dia = date.getDay(); // 0 = domingo ... 6 = sabado
  const diff = dia === 0 ? -6 : 1 - dia;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function obtenerDomingoDeLaSemana(lunes: Date): Date {
  const date = new Date(lunes);
  date.setDate(date.getDate() + 6);
  return date;
}

@Component({
  selector: 'app-dashboardcaja',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    DecimalPipe,
    MatSelectModule,
    LoadingComponent,
    ChartdashcajaComponent,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dashboardcaja.component.html',
  styleUrl: './dashboardcaja.component.css',
})
export class DashboardcajaComponent implements OnInit {
  reportsService = inject(ReportesEmisionService);
  maestroService = inject(MaestrosService);

  sucursales: ISucursalesCombo[] = [];
  selectedSucursal = 0;

  meses = [
    { value: 1, viewValue: 'Enero' },
    { value: 2, viewValue: 'Febrero' },
    { value: 3, viewValue: 'Marzo' },
    { value: 4, viewValue: 'Abril' },
    { value: 5, viewValue: 'Mayo' },
    { value: 6, viewValue: 'Junio' },
    { value: 7, viewValue: 'Julio' },
    { value: 8, viewValue: 'Agosto' },
    { value: 9, viewValue: 'Septiembre' },
    { value: 10, viewValue: 'Octubre' },
    { value: 11, viewValue: 'Noviembre' },
    { value: 12, viewValue: 'Diciembre' },
  ];

  // ---------- Diario ----------
  loadingDiario = false;
  fechaHoy: Date = new Date();
  dataGraficoDiario: IDataGraficoCaja[] = [];

  // ---------- Semanal ----------
  loadingSemanal = false;
  dataGraficoSemanal: IDashboardCashWeekDayDto[] = [];
  semanaLabels: string[] = [];
  semanaValores: number[] = [];
  readonly rangeSemanaFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  // ---------- Mensual ----------
  loadingMensual = false;
  selectedMes = new Date().getMonth() + 1;
  selectedAnio = new Date().getFullYear();
  dataGraficoMensual: IDataGraficoCaja[] = [];

  ngOnInit(): void {
    const lunes = obtenerLunesDeLaSemana(new Date());
    const domingo = obtenerDomingoDeLaSemana(lunes);
    this.rangeSemanaFrm.setValue({ start: lunes, end: domingo });

    this.cargarSucursales();
    this.cargarDashboardDiario();
    this.cargarDashboardSemanal();
    this.cargarDashboardMensual();
  }

  cargarSucursales() {
    this.maestroService.obtenerSucursalesCombo().subscribe({
      next: (response) => {
        if (response.success) {
          this.sucursales = [
            { id: 0, description: '[Todas]' },
            ...response.data,
          ];
        }
      },
      error: (error) => {
        console.error('Error al cargar las sucursales', error);
      },
    });
  }

  private mapearData(items: { descripcion: string; detalles: { tipoPago: string; montoTotal: number }[] }[]): IDataGraficoCaja[] {
    return items.map((item) => ({
      sucursal: 'Sucursal ' + item.descripcion,
      tipoPagos: item.detalles.map((detalle) => detalle.tipoPago),
      importes: item.detalles.map((detalle) => detalle.montoTotal),
    }));
  }

  cargarDashboardDiario() {
    this.dataGraficoDiario = [];
    this.loadingDiario = true;
    this.reportsService
      .obtenerCajaDashboard(this.fechaHoy.toDateString(), this.selectedSucursal)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataGraficoDiario = this.mapearData(response.data);
          } else {
            console.error('Error al cargar el dashboard diario', response.message);
          }
        },
        error: (error) => {
          console.error('Error al cargar el dashboard diario', error);
        },
        complete: () => {
          this.loadingDiario = false;
        },
      });
  }

  cargarDashboardSemanal() {
    const inicio = this.rangeSemanaFrm.value.start;
    const fin = this.rangeSemanaFrm.value.end;
    if (!inicio || !fin) {
      return;
    }

    this.dataGraficoSemanal = [];
    this.semanaLabels = [];
    this.semanaValores = [];
    this.loadingSemanal = true;
    this.reportsService
      .obtenerCajaDashboardSemana(inicio.toDateString(), fin.toDateString(), this.selectedSucursal)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataGraficoSemanal = response.data;
            this.semanaLabels = response.data.map((dia) => dia.diaSemana);
            this.semanaValores = response.data.map((dia) => dia.montoTotal);
          } else {
            console.error('Error al cargar el dashboard semanal', response.message);
          }
        },
        error: (error) => {
          console.error('Error al cargar el dashboard semanal', error);
        },
        complete: () => {
          this.loadingSemanal = false;
        },
      });
  }

  formatDetallesDia(detalles: { tipoPago: string; montoTotal: number }[]): string {
    if (!detalles || detalles.length === 0) {
      return '-';
    }
    return detalles.map((d) => `${d.tipoPago}: ${d.montoTotal.toFixed(2)}`).join(' | ');
  }

  cargarDashboardMensual() {
    this.dataGraficoMensual = [];
    this.loadingMensual = true;
    this.reportsService
      .obtenerCajaDashboardMes(this.selectedMes, this.selectedAnio, this.selectedSucursal)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dataGraficoMensual = this.mapearData(response.data);
          } else {
            console.error('Error al cargar el dashboard mensual', response.message);
          }
        },
        error: (error) => {
          console.error('Error al cargar el dashboard mensual', error);
        },
        complete: () => {
          this.loadingMensual = false;
        },
      });
  }

  getTotal(importes: number[]): number {
    return importes.reduce((sum, current) => sum + current, 0);
  }
}
