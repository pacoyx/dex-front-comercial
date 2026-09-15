import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { CatalogosService } from '../../services/catalogos.service';
import { InvoicesService } from '../../services/invoices.service';
import { ICustomerSearchResult } from '../../interfaces/ICatalogos';
import { IInvoiceListItem } from '../../interfaces/IInvoices';
import { InvoiceStatus, InvoiceStatusColorPipe, InvoiceStatusLabelPipe } from '../../shared/invoice-status';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatTableModule, MatDatepickerModule, ReactiveFormsModule, FormsModule,
    RouterModule, AsyncPipe, CurrencyPipe, DatePipe, TitleCasePipe, NgFor,
    InvoiceStatusLabelPipe, InvoiceStatusColorPipe
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './facturas.component.html',
  styleUrl: './facturas.component.css'
})
export class FacturasComponent implements OnInit {

  private catalogosService = inject(CatalogosService);
  private invoicesService = inject(InvoicesService);
  private notificationService = inject(NotificationsSystemService);

  customerControl = new FormControl();
  filteredCustomers!: Observable<ICustomerSearchResult[]>;
  selectedCustomer: ICustomerSearchResult | null = null;

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  statusOptions = [
    { value: null, label: 'Todos' },
    { value: InvoiceStatus.Draft, label: 'Borrador' },
    { value: InvoiceStatus.Issued, label: 'Emitida' },
    { value: InvoiceStatus.PartiallyPaid, label: 'Pago Parcial' },
    { value: InvoiceStatus.Paid, label: 'Pagada' },
    { value: InvoiceStatus.Cancelled, label: 'Anulada' },
  ];
  selectedStatus: number | null = null;

  displayedColumns: string[] = ['cliente', 'factura', 'emision', 'vencimiento', 'total', 'moneda', 'saldo', 'estado'];
  dataSource = new MatTableDataSource<IInvoiceListItem>([]);

  ngOnInit(): void {
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

    this.buscar();
  }

  onCustomerSelected(event: any) {
    this.selectedCustomer = event.option.value;
  }

  displayFn(customer: ICustomerSearchResult): string {
    return customer ? `${customer.nombres} ${customer.apellidos}` : '';
  }

  buscar() {
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    this.invoicesService.listarFacturas({
      customerId: this.selectedCustomer?.id,
      dateFrom: start ? start.toISOString() : undefined,
      dateTo: end ? end.toISOString() : undefined,
      status: this.selectedStatus ?? undefined,
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar las facturas.'));
      }
    });
  }

  limpiar() {
    this.customerControl.setValue(null);
    this.selectedCustomer = null;
    this.rangeFrm.reset();
    this.selectedStatus = null;
    this.buscar();
  }

}
