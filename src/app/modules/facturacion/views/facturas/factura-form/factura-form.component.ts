import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, TitleCasePipe } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { InvoicesService } from '../../../services/invoices.service';
import {
  IBranchSales,
  ICustomerSearchResult,
  ITypeDocument,
} from '../../../interfaces/ICatalogos';
import { IInvoiceCreateRequest } from '../../../interfaces/IInvoices';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { InvoiceDetailStoreService } from './invoice-detail-store.service';
import { TableDetalleFacturaComponent } from './components/table-detalle-factura/table-detalle-factura.component';
import { DialogAddItemFacturaComponent } from './components/dialog-add-item-factura/dialog-add-item-factura.component';

@Component({
  selector: 'app-factura-form',
  standalone: true,
  imports: [
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSelectModule,
    TableDetalleFacturaComponent,
    TitleCasePipe,
    AsyncPipe,
    NgFor,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './factura-form.component.html',
  styleUrl: './factura-form.component.css',
})
export class FacturaFormComponent implements OnInit, OnDestroy {
  catalogosService = inject(CatalogosService);
  invoicesService = inject(InvoicesService);
  invoiceStoreService = inject(InvoiceDetailStoreService);
  dialog = inject(MatDialog);
  notificationService = inject(NotificationsSystemService);
  router = inject(Router);

  customerControl = new FormControl();
  filteredCustomers!: Observable<ICustomerSearchResult[]>;

  branches: IBranchSales[] = [];
  documentTypes: ITypeDocument[] = [];

  frmInvoice: FormGroup;
  saved = false;

  constructor(private fb: FormBuilder) {
    this.frmInvoice = this.fb.group({
      customerId: [null, Validators.required],
      branchId: [null, Validators.required],
      documentTypeId: [null, Validators.required],
      serie: ['', Validators.required],
      numero: ['', Validators.required],
      issueDate: [new Date(), Validators.required],
      dueDate: [new Date(), Validators.required],
      currencyId: ['PEN', [Validators.required, Validators.maxLength(3)]],
      exchangeRate: [1.0, [Validators.required, Validators.min(0.000001)]],
      notes: [''],
    });

    this.customerControl.valueChanges.subscribe((value) => {
      this.frmInvoice
        .get('customerId')
        ?.setValue(typeof value === 'object' && value ? value.id : null);
    });
  }

  ngOnDestroy(): void {
    this.invoiceStoreService.resetState();
  }

  ngOnInit(): void {
    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => {
        if (!value || typeof value !== 'string' || value.trim().length < 3) {
          return of([]);
        }
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        return this.catalogosService
          .buscarClientesPorPatron(value)
          .pipe(map((response) => response.data));
      }),
    );

    this.catalogosService.obtenerSucursales().subscribe({
      next: (response) => (this.branches = response.data),
      error: () =>
        this.notificationService.showError(
          'No se pudieron cargar las sucursales.',
        ),
    });

    this.catalogosService.obtenerTiposDocumento().subscribe({
      next: (response) => (this.documentTypes = response.data),
      error: () =>
        this.notificationService.showError(
          'No se pudieron cargar los tipos de documento.',
        ),
    });
  }

  onCustomerSelected(event: any) {
    this.frmInvoice.get('customerId')?.setValue(event.option.value.id);
  }

  displayFn(customer: ICustomerSearchResult): string {
    return customer ? `${customer.nombres} ${customer.apellidos}` : '';
  }

  addItem() {
    this.dialog.open(DialogAddItemFacturaComponent, { data: { isAdd: true } });
  }

  guardarFactura() {
    if (this.frmInvoice.invalid) {
      this.notificationService.showError(
        'Debe completar todos los campos obligatorios.',
      );
      return;
    }

    if (this.invoiceStoreService.items().length === 0) {
      this.notificationService.showError(
        'Debe agregar al menos un producto o servicio a la factura.',
      );
      return;
    }

    const req: IInvoiceCreateRequest = {
      customerId: this.frmInvoice.get('customerId')?.value,
      branchId: this.frmInvoice.get('branchId')?.value,
      documentTypeId: this.frmInvoice.get('documentTypeId')?.value,
      serie: this.frmInvoice.get('serie')?.value,
      numero: this.frmInvoice.get('numero')?.value,
      issueDate: new Date(
        this.frmInvoice.get('issueDate')?.value,
      ).toISOString(),
      dueDate: new Date(this.frmInvoice.get('dueDate')?.value).toISOString(),
      currencyId: this.frmInvoice.get('currencyId')?.value,
      exchangeRate: this.frmInvoice.get('exchangeRate')?.value,
      notes: this.frmInvoice.get('notes')?.value,
      details: this.invoiceStoreService.items().map((item) => ({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
      })),
    };

    this.invoicesService.crearFactura(req).subscribe({
      next: (response) => {
        this.notificationService.showSuccessDialog(
          `Factura ${response.data.serie}-${response.data.numero} registrada. Total: ${response.data.total}`,
          '# ' + response.data.id,
        );
        this.frmInvoice.disable();
        this.customerControl.disable();
        this.router.navigate(['/facturacion/facturas', response.data.id]);
      },
      error: (err) => {
        this.notificationService.showError(
          extractErrorMessage(err, 'Ocurrió un error al registrar la factura.'),
        );
      },
    });
  }

  limpiar() {
    this.frmInvoice.enable();
    this.customerControl.enable();
    this.frmInvoice.reset({
      issueDate: new Date(),
      dueDate: new Date(),
      currencyId: 'PEN',
      exchangeRate: 1.0,
    });
    this.customerControl.setValue(null);
    this.invoiceStoreService.resetState();
  }
}
