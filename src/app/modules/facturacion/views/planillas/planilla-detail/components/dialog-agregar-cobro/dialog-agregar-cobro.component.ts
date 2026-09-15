import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CatalogosService } from '../../../../../services/catalogos.service';
import { InvoicesService } from '../../../../../services/invoices.service';
import { CollectionSheetsService } from '../../../../../services/collection-sheets.service';
import { ICustomerSearchResult, IPaymentMethod } from '../../../../../interfaces/ICatalogos';
import { IInvoiceListItem } from '../../../../../interfaces/IInvoices';
import { extractErrorMessage } from '../../../../../shared/http-error.util';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';

@Component({
  selector: 'app-dialog-agregar-cobro',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatButtonModule, ReactiveFormsModule,
    FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule,
    AsyncPipe, NgFor, TitleCasePipe, CurrencyPipe
  ],
  templateUrl: './dialog-agregar-cobro.component.html',
  styleUrl: './dialog-agregar-cobro.component.css'
})
export class DialogAgregarCobroComponent implements OnInit {
  readonly data = inject<{ collectionSheetId: number }>(MAT_DIALOG_DATA);
  catalogosService = inject(CatalogosService);
  invoicesService = inject(InvoicesService);
  collectionSheetsService = inject(CollectionSheetsService);
  notificationService = inject(NotificationsSystemService);

  customerControl = new FormControl();
  filteredCustomers!: Observable<ICustomerSearchResult[]>;
  invoicesForCustomer: IInvoiceListItem[] = [];
  selectedInvoice: IInvoiceListItem | null = null;

  paymentMethods: IPaymentMethod[] = [];
  frmCobro: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAgregarCobroComponent>,
  ) {
    this.frmCobro = this.fb.group({
      paymentMethodId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      operationNumber: [''],
      observation: [''],
    });
  }

  ngOnInit(): void {
    this.catalogosService.obtenerMetodosPago().subscribe({
      next: (response) => this.paymentMethods = response.data.filter(m => m.isActive),
      error: () => this.notificationService.showError('No se pudieron cargar los métodos de pago.')
    });

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
  }

  onCustomerSelected(event: any) {
    const customer: ICustomerSearchResult = event.option.value;
    this.selectedInvoice = null;
    this.invoicesForCustomer = [];
    this.invoicesService.listarFacturas({ customerId: customer.id }).subscribe({
      next: (response) => this.invoicesForCustomer = response.data.filter(inv => inv.balance > 0),
      error: () => this.notificationService.showError('No se pudieron cargar las facturas del cliente.')
    });
  }

  displayFn(customer: ICustomerSearchResult): string {
    return customer ? `${customer.nombres} ${customer.apellidos}` : '';
  }

  selectInvoice(invoice: IInvoiceListItem) {
    this.selectedInvoice = invoice;
    this.frmCobro.get('amount')?.setValidators([Validators.required, Validators.min(0.01), Validators.max(invoice.balance)]);
    this.frmCobro.get('amount')?.updateValueAndValidity();
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (!this.selectedInvoice) {
      this.notificationService.showError('Debe seleccionar una factura.');
      return;
    }
    if (this.frmCobro.invalid) {
      this.notificationService.showError('Verifique los datos del cobro. El monto no puede exceder el saldo pendiente.');
      return;
    }

    this.saving = true;
    this.collectionSheetsService.agregarCobro(this.data.collectionSheetId, {
      invoiceId: this.selectedInvoice.id,
      ...this.frmCobro.value,
    }).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.showSuccess('Cobro agregado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo agregar el cobro.'));
      }
    });
  }

}
