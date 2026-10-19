import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, NgFor, TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { ClientesService } from '../../../services/clientes.service';
import { ValuationReportService } from '../../../services/valuation-report.service';
import { ICompanySearchResult } from '../../../interfaces/ICustomer';
import { IValuationReportFilters, IValuationReportResponse } from '../../../interfaces/IValuationReport';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { descargarArchivo } from '../../../shared/file-download.util';

const ESTADO_META: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Borrador', color: '#757575' },
  Collected: { label: 'Recolectada', color: '#1565c0' },
  Processed: { label: 'Procesada', color: '#6a1b9a' },
  Invoiced: { label: 'Facturada', color: '#2e7d32' },
  Cancelled: { label: 'Anulada', color: '#c62828' },
};

@Component({
  selector: 'app-valorizacion-mensual',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatAutocompleteModule, MatTableModule, MatDatepickerModule, MatTooltipModule,
    ReactiveFormsModule, FormsModule,
    AsyncPipe, CurrencyPipe, DatePipe, DecimalPipe, TitleCasePipe, NgFor, LoadingComponent,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './valorizacion-mensual.component.html',
  styleUrl: './valorizacion-mensual.component.css'
})
export class ValorizacionMensualComponent {

  private clientesService = inject(ClientesService);
  private valuationReportService = inject(ValuationReportService);
  private notificationService = inject(NotificationsSystemService);

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null, Validators.required),
    end: new FormControl<Date | null>(null, Validators.required),
  });

  customerControl = new FormControl<string | ICompanySearchResult>('');
  filteredCustomers!: Observable<ICompanySearchResult[]>;
  selectedCustomerId: number | null = null;

  guideColumns: string[] = ['guideNumber', 'pickupDate', 'status', 'totalAmount', 'hasPhysicalGuidePhoto'];

  resultado: IValuationReportResponse | null = null;
  private filtrosConsultados: IValuationReportFilters | null = null;

  consultando = false;
  loadingFotosPdf = false;
  loadingResumenPdf = false;
  loadingResumenExcel = false;
  validationErrors: string[] = [];

  constructor() {
    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return of([]);
        }
        return this.clientesService.buscarEmpresas({ businessName: value }).pipe(
          map(resp => resp.data ?? [])
        );
      })
    );
  }

  get pivotColumns(): string[] {
    if (!this.resultado) {
      return [];
    }
    return ['fecha', ...this.resultado.pivot.services.map(s => 'srv_' + s.serviceItemId), 'rowTotal'];
  }

  displayCustomerFn(customer: ICompanySearchResult | string): string {
    return typeof customer === 'string' ? customer : (customer?.businessName ?? '');
  }

  onCustomerSelected(event: { option: { value: ICompanySearchResult } }): void {
    this.selectedCustomerId = event.option.value.customerId;
  }

  clearCustomer(event: Event): void {
    event.stopPropagation();
    this.customerControl.setValue('');
    this.selectedCustomerId = null;
    this.resultado = null;
    this.filtrosConsultados = null;
  }

  estadoLabel(status: string): string {
    return ESTADO_META[status]?.label ?? status;
  }

  estadoColor(status: string): string {
    return ESTADO_META[status]?.color ?? '#757575';
  }

  private formatearFecha(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private obtenerFiltrosValidos(): IValuationReportFilters | null {
    this.validationErrors = [];

    if (!this.selectedCustomerId) {
      this.validationErrors = ['Debes seleccionar un cliente.'];
      return null;
    }

    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;
    if (!start || !end) {
      this.validationErrors = ['Debes seleccionar el rango de fechas (Desde / Hasta).'];
      return null;
    }
    if (end < start) {
      this.validationErrors = ['La fecha "Hasta" debe ser mayor o igual a la fecha "Desde".'];
      return null;
    }

    return {
      customerId: this.selectedCustomerId,
      fromDate: this.formatearFecha(start),
      toDate: this.formatearFecha(end),
    };
  }

  consultar(): void {
    const filtros = this.obtenerFiltrosValidos();
    if (!filtros) {
      return;
    }

    this.consultando = true;
    this.valuationReportService.consultar(filtros).subscribe({
      next: (resp) => {
        this.resultado = resp.data;
        this.filtrosConsultados = filtros;
      },
      error: (err) => {
        this.resultado = null;
        this.filtrosConsultados = null;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al consultar la valorización.'));
        }
      },
      complete: () => {
        this.consultando = false;
      },
    });
  }

  limpiar(): void {
    this.rangeFrm.reset();
    this.customerControl.setValue('');
    this.selectedCustomerId = null;
    this.resultado = null;
    this.filtrosConsultados = null;
    this.validationErrors = [];
  }

  private nombreArchivo(tipo: 'Fotos' | 'Resumen', extension: string): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `Valorizacion_${tipo}_${this.filtrosConsultados?.customerId}_${yyyy}${mm}${dd}.${extension}`;
  }

  exportarFotosPdf(): void {
    if (!this.filtrosConsultados) {
      return;
    }
    this.loadingFotosPdf = true;
    this.valuationReportService.descargarFotosPdf(this.filtrosConsultados).subscribe({
      next: (resp) => descargarArchivo(resp, this.nombreArchivo('Fotos', 'pdf')),
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al exportar las fotos.'));
      },
      complete: () => {
        this.loadingFotosPdf = false;
      },
    });
  }

  exportarResumenPdf(): void {
    if (!this.filtrosConsultados) {
      return;
    }
    this.loadingResumenPdf = true;
    this.valuationReportService.descargarResumenPdf(this.filtrosConsultados).subscribe({
      next: (resp) => descargarArchivo(resp, this.nombreArchivo('Resumen', 'pdf')),
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al exportar el resumen en PDF.'));
      },
      complete: () => {
        this.loadingResumenPdf = false;
      },
    });
  }

  exportarResumenExcel(): void {
    if (!this.filtrosConsultados) {
      return;
    }
    this.loadingResumenExcel = true;
    this.valuationReportService.descargarResumenExcel(this.filtrosConsultados).subscribe({
      next: (resp) => descargarArchivo(resp, this.nombreArchivo('Resumen', 'xlsx')),
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al exportar el resumen en Excel.'));
      },
      complete: () => {
        this.loadingResumenExcel = false;
      },
    });
  }

}
