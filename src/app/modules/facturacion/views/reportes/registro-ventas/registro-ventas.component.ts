import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { CatalogosService } from '../../../services/catalogos.service';
import { ReportsService } from '../../../services/reports.service';
import { IBranchSales, ICustomerSearchResult } from '../../../interfaces/ICatalogos';
import { ISalesRegisterFilters, ISalesRegisterRow, ISalesRegisterTotals } from '../../../interfaces/IReports';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { descargarArchivo } from '../../../shared/file-download.util';
import {
  SALES_REGISTER_STATUS_OPTIONS,
  SalesRegisterStatusColorPipe,
  SalesRegisterStatusLabelPipe,
} from '../../../shared/sales-register-status';

@Component({
  selector: 'app-registro-ventas',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatTableModule, MatDatepickerModule, ReactiveFormsModule, FormsModule,
    AsyncPipe, CurrencyPipe, DatePipe, TitleCasePipe, NgFor, LoadingComponent,
    SalesRegisterStatusLabelPipe, SalesRegisterStatusColorPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './registro-ventas.component.html',
  styleUrl: './registro-ventas.component.css'
})
export class RegistroVentasComponent implements OnInit {

  private catalogosService = inject(CatalogosService);
  private reportsService = inject(ReportsService);
  private notificationService = inject(NotificationsSystemService);

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required),
  });

  branches: IBranchSales[] = [];
  selectedBranchId: number | null = null;

  customerControl = new FormControl();
  filteredCustomers!: Observable<ICustomerSearchResult[]>;
  selectedCustomer: ICustomerSearchResult | null = null;

  statusOptions = SALES_REGISTER_STATUS_OPTIONS;
  selectedStatus: string | null = null;

  displayedColumns: string[] = [
    'fecha', 'cliente', 'documento', 'subTotal', 'igv', 'total',
    'pagado', 'saldo', 'moneda', 'tipoCambio', 'estado',
  ];
  dataSource = new MatTableDataSource<ISalesRegisterRow>([]);
  totals: ISalesRegisterTotals | null = null;

  loading = false;
  loadingPdf = false;
  loadingExcel = false;
  validationErrors: string[] = [];

  ngOnInit(): void {
    this.cargarSucursales();

    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        return this.catalogosService.buscarClientesPorPatron(value).pipe(
          map(response => response.data),
        );
      })
    );

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.rangeFrm.setValue({ start: inicioMes, end: hoy });

    this.buscar();
  }

  private cargarSucursales(): void {
    this.catalogosService.obtenerSucursales().subscribe({
      next: (response) => {
        if (response.success) {
          this.branches = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar las sucursales', error);
      },
    });
  }

  onCustomerSelected(event: any) {
    this.selectedCustomer = event.option.value;
  }

  displayFn(customer: ICustomerSearchResult): string {
    return customer ? `${customer.nombres} ${customer.apellidos}` : '';
  }

  private obtenerFiltrosValidos(): ISalesRegisterFilters | null {
    this.validationErrors = [];
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    if (!start || !end) {
      this.validationErrors = ['Debe seleccionar el rango de fechas (Desde / Hasta).'];
      return null;
    }
    if (end < start) {
      this.validationErrors = ['La fecha "Hasta" debe ser mayor o igual a la fecha "Desde".'];
      return null;
    }

    return {
      fromDate: start.toISOString(),
      toDate: end.toISOString(),
      branchId: this.selectedBranchId ?? undefined,
      customerId: this.selectedCustomer?.id,
      status: this.selectedStatus ?? undefined,
    };
  }

  buscar(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loading = true;
    this.reportsService.obtenerRegistroVentas(filtros).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.rows;
        this.totals = response.data.totals;
      },
      error: (err) => {
        this.dataSource.data = [];
        this.totals = null;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al obtener el registro de ventas.'));
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  limpiar(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.rangeFrm.setValue({ start: inicioMes, end: hoy });
    this.selectedBranchId = null;
    this.customerControl.setValue(null);
    this.selectedCustomer = null;
    this.selectedStatus = null;
    this.validationErrors = [];
    this.buscar();
  }

  private nombreArchivoPorDefecto(extension: string): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `RegistroVentas_${yyyy}${mm}${dd}.${extension}`;
  }

  exportarPdf(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loadingPdf = true;
    this.reportsService.descargarRegistroVentasPdf(filtros).subscribe({
      next: (response) => descargarArchivo(response, this.nombreArchivoPorDefecto('pdf')),
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al exportar el PDF.'));
      },
      complete: () => {
        this.loadingPdf = false;
      },
    });
  }

  exportarExcel(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loadingExcel = true;
    this.reportsService.descargarRegistroVentasExcel(filtros).subscribe({
      next: (response) => descargarArchivo(response, this.nombreArchivoPorDefecto('xlsx')),
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al exportar el Excel.'));
      },
      complete: () => {
        this.loadingExcel = false;
      },
    });
  }
}
