import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../config/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../config/custom-date-formats';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { ReportesEmisionService } from '../../services/reportes-emision.service';
import { IReportGuiasDetalleResponse } from '../../interfaces/IReports';
import { AsyncPipe, DatePipe, DecimalPipe, NgFor, TitleCasePipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { map, startWith, switchMap, debounceTime } from 'rxjs/operators';
import { IClienteBusqueda } from '../../components/dialog-cliente/dialog-cliente.component';
import { EmisionService } from '../../services/emision.service';
import { MatRadioModule } from '@angular/material/radio';
import { RouterModule } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TableDetalleComponent } from './components/table-detalle/table-detalle.component';

@Component({
  selector: 'app-recepcion-consultas',
  standalone: true,
  imports: [
    MatIconModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule,
    MatPaginatorModule, MatButtonModule, FormsModule, MatDatepickerModule,
    MatTableModule, MatSortModule, MatAutocompleteModule,
    TitleCasePipe, AsyncPipe, NgFor, DatePipe, DecimalPipe,
    MatRadioModule, RouterModule, TableDetalleComponent
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  templateUrl: './recepcion-consultas.component.html',
  styleUrl: './recepcion-consultas.component.css',
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
})
export class RecepcionConsultasComponent implements OnInit, AfterViewInit, OnDestroy {
  reportsService = inject(ReportesEmisionService);
  emisionService = inject(EmisionService);

  fechaHoy: Date = new Date();
  customerId: number = 0;
  tipoReporte: string = 'C';

  displayedColumns: string[] = [
    'numeroGuia',
    'fechaOperacion',
    'total',
    'acuenta',
    'saldo',
    'nombreCliente',
    'estadoPago',
    'estadoRegistro',
    'estadoSituacion',
    'fechaRecojo',
    'tipoPagoCancelacion',
  ];

  displayedColumnsWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement!: IReportGuiasDetalleResponse | null;

  dataSource = new MatTableDataSource<IReportGuiasDetalleResponse>([]);
  totalClientes = 0;
  pageSize = 10;

  clienteControl = new FormControl();
  filteredClientes!: Observable<IClienteBusqueda[]>;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  guiasCliente!: Subscription;
  guiasFecha!: Subscription;

  constructor() { }

  ngOnDestroy(): void {
    if (this.guiasCliente) this.guiasCliente.unsubscribe();
    if (this.guiasFecha) this.guiasFecha.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator; 
    this.paginator.page.subscribe(() => {
      this.cargarGuiasPorCliente(this.paginator.pageIndex + 1, this.paginator.pageSize);
    });
  }

  ngOnInit(): void {

    this.filteredClientes = this.clienteControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (value === '') {
          return of([]);
        }
        return this.emisionService.filtrarClientesPorPatron(value).pipe(
          map(response => response.data)
        );
      })
    );

  }

  cargarGuiasPorCliente(pageIndex: number, pageSize: number) {


    if (this.tipoReporte == 'C') {
      this.guiasCliente = this.reportsService.obtenerGuiasPorCliente(this.customerId, pageIndex, pageSize).subscribe({
        next: (response) => {
          this.dataSource.data = response.data.guias;
          this.totalClientes = response.data.totalCount;
          this.paginator.length = this.totalClientes;
        },
        error: (error) => {
          console.log('Error al cargar guias por cliente', error);
        }
      });
    }

    if (this.tipoReporte == 'F') {
      console.log('Fecha hoy', this.fechaHoy.toDateString());

      this.guiasFecha = this.reportsService.obtenerGuiasPorFecha(this.fechaHoy.toDateString(), pageIndex, pageSize).subscribe({
        next: (response) => {
          this.dataSource.data = response.data.guias;
          this.totalClientes = response.data.totalCount;
          this.paginator.length = this.totalClientes;
        },
        error: (error) => {
          console.log('Error al cargar guias por cliente', error);
        }
      });
    }

  }

  BuscarGuias() {
    this.cargarGuiasPorCliente(1, this.pageSize);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onClienteSelected(event: any) {
    const cliente = event.option.value;
    this.customerId = cliente.id;
    this.cargarGuiasPorCliente(1, this.pageSize);
  }

  displayFn(cliente: any): string {
    return cliente && cliente.nombres && cliente.apellidos ? `${cliente.nombres} ${cliente.apellidos}` : cliente;
  }

  limpiarResultados() {
    this.dataSource.data = [];
    this.totalClientes = 0;
    this.paginator.length = this.totalClientes;
  }

}
