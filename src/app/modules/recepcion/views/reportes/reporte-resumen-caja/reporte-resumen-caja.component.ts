import { AfterViewInit, Component, inject } from '@angular/core';
import { ReportesEmisionService } from '../../../services/reportes-emision.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DataResumenCajaExpenseBox, ICajasPorFecha, IReportResumenCajaPorFechaResponse, IResumenCajaDetalle } from '../../../interfaces/IReports';
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
import { TableResumenGastosComponent } from './components/table-resumen-gastos/table-resumen-gastos.component';
import { TableResumenUsuarioComponent } from './components/table-resumen-usuario/table-resumen-usuario.component';

@Component({
  selector: 'app-reporte-resumen-caja',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    FormsModule, MatDatepickerModule, MatFormFieldModule,
    MatInputModule, DecimalPipe, MatSelectModule, TableDetResumenCajaComponent,
    LoadingComponent, MatRippleModule, NgClass, TableResumenGastosComponent, TableResumenUsuarioComponent
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
  cajasXFechaSubscription!: Subscription;

  selectedTP = '';
  dataDetalle: IResumenCajaDetalle[] = [];
  dataDetalleExpense: DataResumenCajaExpenseBox[] = [];
  tipoPagoDetalle: string = '';
  tiposPago = [
    { id: 'TO', tipo: '[Todos]' },
    { id: 'EF', tipo: 'Efectivo' },
    { id: 'QR', tipo: 'Yape' },
    { id: 'TA', tipo: 'Tarjeta' },
    { id: 'TR', tipo: 'Transferencia' },
  ];
  dataResumenUsuario: { usuario: string, totalIngreso: number }[] = [];
  dataCajaXfecha: ICajasPorFecha[] = [];

  loading = false;
  loadingDetalle = false;


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
    this.dataDetalle = [];
    this.dataDetalleExpense = [];
    this.tipoPagoDetalle = event;


    const filterValue = event.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: IReportResumenCajaPorFechaResponse, filter: string) => {
      return data.tipoPago.toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue;
  }

  applyFilterByUser(event: string): void {

    this.dataDetalle = [];
    this.dataDetalleExpense = [];

    const filterValue = event.trim().toLowerCase();
    this.dataSource.filterPredicate = (data: IReportResumenCajaPorFechaResponse, filter: string) => {
      return data.usuario.toLowerCase().includes(filter);
    };
    this.dataSource.filter = filterValue;
  }

  cargarCajasPorFecha() {
    this.loading = true;
    this.cajasXFechaSubscription = this.reportsService.obtenerCajasPorFecha(this.fechaHoy.toDateString())
      .subscribe({
        next: (response) => {
          this.loading = false;
          this.dataCajaXfecha = response.data;
        },
        error: (error) => {
          this.loading = false;
          console.error(error);
        }
      });
  }

  cargarReporteResumenCaja(userId: number) {
    this.selectedTP = 'TO';
    this.loadingDetalle = true;
    this.dataDetalle = [];
    this.dataDetalleExpense = [];
    this.resumenSubscription = this.reportsService.obtenerReprteResumenCajaPorFecha(this.fechaHoy.toDateString(), userId)
      .pipe(map(response => {
        response.data.forEach(item => item.flag = false);
        return response.data;
      })
      )
      .subscribe({
        next: (response) => {
          this.loadingDetalle = false;

          console.log('watch response ==>', response);


          // const groupedResponse = response.reduce((acc: { [key: string]: { usuario: string, totalIngreso: number } }, item) => {
          //   const key = item.cajaId;
          //   if (!acc[key]) {
          //     acc[key] = { usuario: item.usuario, totalIngreso: 0 };
          //   }
          //   acc[key].totalIngreso += item.totalImporte + item.totalAdelanto;
          //   return acc;
          // }, {});



          // const groupedData = Object.values(groupedResponse) as { usuario: string, totalIngreso: number }[];
          // this.dataResumenUsuario = groupedData;

          this.dataSource = new MatTableDataSource<IReportResumenCajaPorFechaResponse>(response);
        },
        error: (error) => {
          this.loadingDetalle = false;
          console.error(error);
        }
      });
  }

  limpiarFiltros() {
    this.dataSource.filter = '';
    this.selectedTP = 'TO';
    this.dataDetalle = [];
    this.dataDetalleExpense = [];
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
          this.dataDetalle = response.cashBoxDetail;
          this.dataDetalleExpense = response.expenseBox;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

}
