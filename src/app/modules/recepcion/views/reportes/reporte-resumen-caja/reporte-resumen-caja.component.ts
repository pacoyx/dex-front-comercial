import { AfterViewInit, Component, inject } from '@angular/core';
import { ReportesEmisionService } from '../../../services/reportes-emision.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IReportResumenCajaPorFechaResponse } from '../../../interfaces/IReports';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../config/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../config/custom-date-formats';
import { map, Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DecimalPipe } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-reporte-resumen-caja',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    FormsModule, MatDatepickerModule, MatFormFieldModule, 
    MatInputModule, DecimalPipe, MatSelectModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './reporte-resumen-caja.component.html',
  styleUrl: './reporte-resumen-caja.component.css'
})
export class ReporteResumenCajaComponent implements AfterViewInit {

  reportsService = inject(ReportesEmisionService);

  fechaHoy: Date = new Date();

  displayedColumns: string[] = [
    'usuario',
    'tipoPago',
    'totalAdelanto',
    'totalImporte',
    'totalCobrado',
  ];

  dataSource = new MatTableDataSource<IReportResumenCajaPorFechaResponse>([]);
  resumenSubscription!: Subscription;
  selectedTP='';
  filterSubscription!: Subscription;

  tiposPago = [
    { id: 'TO', tipo: '[Todos]' },
    { id: 'EF', tipo: 'Efectivo' },
    { id: 'QR', tipo: 'Yape' },
    { id: 'TA', tipo: 'Tarjeta' },
    { id: 'TR', tipo: 'Transferencia' },
  ];


  ngOnDestroy(): void {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {

    // Suscribirse a los cambios en el filtro
    this.filterSubscription = this.dataSource.connect().subscribe(() => {
      this.getTotalAdelanto();
    });
  }

  getTotalAdelanto() {
    // return this.listsItems.map(t => t.adelanto).reduce((acc, value) => acc + value, 0);
    const filteredData = this.dataSource.filteredData;
    return filteredData.reduce((acc, item) => acc + item.totalAdelanto, 0);
  }

  getTotalImporte() {
    // return this.listsItems.map(t => t.importe).reduce((acc, value) => acc + value, 0);
    const filteredData = this.dataSource.filteredData;
    return filteredData.reduce((acc, item) => acc + item.totalImporte, 0);
  }

  applyTipoPagoFilter(event: string): void {
    if (event === 'TO') {
      this.dataSource.filter = '';
      return;
    }

    const filterValue = event.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: IReportResumenCajaPorFechaResponse, filter: string) => {
      return data.tipoPago.toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue;
  }

  cargarReporteResumenCaja() {
    this.selectedTP = 'TO';
    this.resumenSubscription = this.reportsService.obtenerReprteResumenCajaPorFecha(this.fechaHoy.toDateString())
      .pipe(map(response => {
        return response.data;
      })
      )
      .subscribe({
        next: (response) => {
          this.dataSource = new MatTableDataSource<IReportResumenCajaPorFechaResponse>(response);
        },
        error: (error) => {
          console.error(error);
        }
      });
  }


}
