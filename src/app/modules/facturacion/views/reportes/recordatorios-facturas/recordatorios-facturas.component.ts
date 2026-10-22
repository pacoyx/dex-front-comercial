import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Observable, debounceTime, of, startWith, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { ClientesService } from '../../../services/clientes.service';
import { InvoiceRemindersService } from '../../../services/invoice-reminders.service';
import { ICompanySearchResult } from '../../../interfaces/ICustomer';
import { IInvoiceReminderLog, InvoiceReminderLogStatus } from '../../../interfaces/IInvoiceReminder';
import { InvoiceReminderStatusColorPipe, InvoiceReminderStatusLabelPipe } from '../../../shared/invoice-reminder-status';
import { extractErrorMessage } from '../../../shared/http-error.util';

@Component({
  selector: 'app-recordatorios-facturas',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatDatepickerModule, MatTableModule, ReactiveFormsModule, FormsModule,
    AsyncPipe, CurrencyPipe, DatePipe, LoadingComponent, InvoiceReminderStatusLabelPipe, InvoiceReminderStatusColorPipe,
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
  templateUrl: './recordatorios-facturas.component.html',
  styleUrl: './recordatorios-facturas.component.css'
})
export class RecordatoriosFacturasComponent implements OnInit {

  private clientesService = inject(ClientesService);
  private invoiceRemindersService = inject(InvoiceRemindersService);
  private notificationService = inject(NotificationsSystemService);

  readonly InvoiceReminderLogStatus = InvoiceReminderLogStatus;
  readonly statusOptions = [
    { value: InvoiceReminderLogStatus.Sent, label: 'Enviado' },
    { value: InvoiceReminderLogStatus.Failed, label: 'Fallido' },
    { value: InvoiceReminderLogStatus.Skipped, label: 'Omitido' },
  ];

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  customerControl = new FormControl<string | ICompanySearchResult>('');
  filteredCustomers!: Observable<ICompanySearchResult[]>;
  selectedCustomer: ICompanySearchResult | null = null;

  selectedStatus: InvoiceReminderLogStatus | null = null;

  displayedColumns: string[] = ['customerName', 'runAt', 'status', 'invoiceCount', 'totalAmount', 'recipients'];
  displayedColumnsWithExpand = [...this.displayedColumns, 'expand'];
  expandedElement: IInvoiceReminderLog | null = null;

  registros: IInvoiceReminderLog[] = [];
  loading = false;

  ngOnInit(): void {
    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        this.selectedCustomer = typeof value === 'string' || !value ? null : value;
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return of([]);
        }
        return this.clientesService.buscarEmpresas({ businessName: value }).pipe(
          switchMap(resp => of(resp.data ?? []))
        );
      })
    );

    this.buscar();
  }

  displayCustomerFn(customer: ICompanySearchResult | string): string {
    return typeof customer === 'string' ? customer : (customer?.businessName ?? '');
  }

  onCustomerSelected(event: { option: { value: ICompanySearchResult } }): void {
    this.selectedCustomer = event.option.value;
  }

  clearCustomer(event: Event): void {
    event.stopPropagation();
    this.customerControl.setValue('');
    this.selectedCustomer = null;
  }

  private formatearFecha(fecha: Date | null): string | undefined {
    if (!fecha) return undefined;
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  buscar(): void {
    this.loading = true;
    this.expandedElement = null;
    this.invoiceRemindersService.listarHistorial({
      customerId: this.selectedCustomer?.customerId,
      fromDate: this.formatearFecha(this.rangeFrm.get('start')?.value ?? null),
      toDate: this.formatearFecha(this.rangeFrm.get('end')?.value ?? null),
      status: this.selectedStatus ?? undefined,
    }).subscribe({
      next: (resp) => {
        this.registros = resp.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.registros = [];
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el historial de recordatorios.'));
      },
    });
  }

  limpiar(): void {
    this.rangeFrm.reset();
    this.customerControl.setValue('');
    this.selectedCustomer = null;
    this.selectedStatus = null;
    this.buscar();
  }

}
