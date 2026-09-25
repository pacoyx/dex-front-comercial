import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor } from '@angular/common';
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
import { Observable, debounceTime, map, of, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { PurchaseOperationsService } from '../../../services/purchase-operations.service';
import { ISupplierListarPorPatronResponse } from '../../../interfaces/IMaestros';
import { IPurchaseRegisterFilters, IPurchaseRegisterRow, IPurchaseRegisterTotals } from '../../../interfaces/IReportes';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { descargarArchivo } from '../../../shared/file-download.util';
import {
  PURCHASE_REGISTER_STATUS_OPTIONS,
  PurchaseRegisterStatusColorPipe,
  PurchaseRegisterStatusLabelPipe,
} from '../../../shared/purchase-register-status';

@Component({
  selector: 'app-purchase-registro-compras',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatTableModule, MatDatepickerModule, ReactiveFormsModule, FormsModule,
    AsyncPipe, CurrencyPipe, DatePipe, NgFor, LoadingComponent,
    PurchaseRegisterStatusLabelPipe, PurchaseRegisterStatusColorPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './purchase-registro-compras.component.html',
  styleUrl: './purchase-registro-compras.component.css'
})
export class PurchaseRegistroComprasComponent implements OnInit {

  private purchaseSettingService = inject(PurchaseSettingServiceService);
  private purchaseOperationsService = inject(PurchaseOperationsService);
  private notificationService = inject(NotificationsSystemService);

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required),
  });

  supplierControl = new FormControl();
  filteredSuppliers!: Observable<ISupplierListarPorPatronResponse[]>;
  selectedSupplier: ISupplierListarPorPatronResponse | null = null;

  statusOptions = PURCHASE_REGISTER_STATUS_OPTIONS;
  selectedStatus: number | null = null;

  displayedColumns: string[] = [
    'fecha', 'proveedor', 'documento', 'subTotal', 'igv', 'total',
    'pagado', 'saldo', 'moneda', 'tipoCambio', 'estado',
  ];
  dataSource = new MatTableDataSource<IPurchaseRegisterRow>([]);
  totals: IPurchaseRegisterTotals | null = null;

  loading = false;
  loadingPdf = false;
  loadingExcel = false;
  validationErrors: string[] = [];

  ngOnInit(): void {
    this.filteredSuppliers = this.supplierControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        return this.purchaseSettingService.listarProveedoresPorPatron(value).pipe(
          map(response => response.data),
        );
      })
    );

    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.rangeFrm.setValue({ start: inicioMes, end: hoy });

    this.buscar();
  }

  onSupplierSelected(event: any) {
    this.selectedSupplier = event.option.value;
  }

  clearSupplier(event: Event): void {
    event.stopPropagation();
    this.supplierControl.setValue(null);
    this.selectedSupplier = null;
  }

  displayFn(supplier: ISupplierListarPorPatronResponse): string {
    return supplier ? `${supplier.name} — RUC ${supplier.ruc}` : '';
  }

  private obtenerFiltrosValidos(): IPurchaseRegisterFilters | null {
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
      supplierId: this.selectedSupplier?.id,
      status: this.selectedStatus ?? undefined,
    };
  }

  buscar(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loading = true;
    this.purchaseOperationsService.obtenerRegistroCompras(filtros).subscribe({
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
          this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al obtener el registro de compras.'));
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
    this.supplierControl.setValue(null);
    this.selectedSupplier = null;
    this.selectedStatus = null;
    this.validationErrors = [];
    this.buscar();
  }

  private nombreArchivoPorDefecto(extension: string): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `RegistroCompras_${yyyy}${mm}${dd}.${extension}`;
  }

  exportarPdf(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.loadingPdf = true;
    this.purchaseOperationsService.descargarRegistroComprasPdf(filtros).subscribe({
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
    this.purchaseOperationsService.descargarRegistroComprasExcel(filtros).subscribe({
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
