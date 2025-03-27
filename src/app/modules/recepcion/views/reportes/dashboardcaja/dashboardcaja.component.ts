import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { ISucursalesCombo } from '../../../interfaces/IReports';


@Component({
  selector: 'app-dashboardcaja',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, FormsModule, MatDatepickerModule, MatFormFieldModule,
    MatInputModule, DecimalPipe, MatSelectModule, LoadingComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dashboardcaja.component.html',
  styleUrl: './dashboardcaja.component.css'
})
export class DashboardcajaComponent implements OnInit {
  reportsService = inject(ReportesEmisionService);
  maestroService = inject(MaestrosService);

  loading = false;
  fechaHoy: Date = new Date();
  selectedSucursal = 0;
  sucursales: ISucursalesCombo[] = [];


  ngOnInit(): void {
    this.cargarSucursales();
    this.cargarDashboard();
  }

  cargarSucursales() {
    this.maestroService.obtenerSucursalesCombo().subscribe({
      next: (response) => {
        if (response.success) {
          this.sucursales = [{ id: 0, description: '[Todas]' }, ...response.data];
        }
      },
      error: (error) => {
        console.error('Error al cargar las sucursales', error);
      }
    });
  }

  cargarDashboard() {
    this.loading = true;
    this.reportsService.obtenerCajaDashboard(this.fechaHoy.toDateString(), this.selectedSucursal).subscribe({
      next: (response) => {
        if (response.success) {
          // Procesar los datos de la respuesta
          console.log('Datos del dashboard:', response.data);
        } else {
          console.error('Error al cargar el dashboard', response.message);
        }
      },
      error: (error) => {
        console.error('Error al cargar el dashboard', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  applyFilterSucursal(event: any) {
  }
}
