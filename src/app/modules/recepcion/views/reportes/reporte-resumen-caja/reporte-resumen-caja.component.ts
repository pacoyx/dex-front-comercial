import { AfterViewInit, Component, inject } from '@angular/core';
import { ReportesEmisionService } from '../../../services/reportes-emision.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IReportResumenCajaPorFechaResponse, IResumenCajaDetalle } from '../../../interfaces/IReports';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import { CustomDateAdapter } from '../../../config/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../config/custom-date-formats';
import { map, Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DecimalPipe, NgClass } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TableDetResumenCajaComponent } from './components/table-det-resumen-caja/table-det-resumen-caja.component';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';

@Component({
  selector: 'app-reporte-resumen-caja',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    FormsModule, MatDatepickerModule, MatFormFieldModule, 
    MatInputModule, DecimalPipe, MatSelectModule, TableDetResumenCajaComponent, LoadingComponent,MatRippleModule, NgClass
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
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
  filterSubscription!: Subscription;
  selectedTP='';
  dataDetalle: IResumenCajaDetalle[] = [];
  tipoPagoDetalle: string = '';
  tiposPago = [
    { id: 'TO', tipo: '[Todos]' },
    { id: 'EF', tipo: 'Efectivo' },
    { id: 'QR', tipo: 'Yape' },
    { id: 'TA', tipo: 'Tarjeta' },
    { id: 'TR', tipo: 'Transferencia' },
  ];

  loading = false;


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
    this.dataDetalle=[];
    this.tipoPagoDetalle = event;


    const filterValue = event.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: IReportResumenCajaPorFechaResponse, filter: string) => {
      return data.tipoPago.toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue;
  }

  cargarReporteResumenCaja() {
    this.selectedTP = 'TO';
    this.loading = true;
    this.dataDetalle = [];
    this.resumenSubscription = this.reportsService.obtenerReprteResumenCajaPorFecha(this.fechaHoy.toDateString())
      .pipe(map(response => {
                response.data.forEach(item => item.flag = false);
        return response.data;
      })
      )
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.dataSource = new MatTableDataSource<IReportResumenCajaPorFechaResponse>(response);
        },
        error: (error) => {
          this.loading = false;
          console.error(error);
        }
      });
  }

  limpiarFiltros() {
    this.dataSource.filter = '';
    this.selectedTP = 'TO';
    this.dataDetalle=[];
    this.tipoPagoDetalle = '';
  }

  cargarDetallePorUsuarioyTipoPago(item: IReportResumenCajaPorFechaResponse) {
    this.tipoPagoDetalle = item.tipoPago;
    this.dataSource.data.forEach(item => item.flag = false);
    item.flag = true;
    this.reportsService.obtenerDetalleResumenPorUsuarioYTipoPago(item.cajaId, item.tipoPago)
      .pipe(map(response => {
        return response.data;
      })
      )
      .subscribe({
        next: (response) => {
          this.dataDetalle = response;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }
  
}
