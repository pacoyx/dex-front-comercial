import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AsyncPipe, JsonPipe, NgFor, TitleCasePipe } from '@angular/common';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { MatSelectModule } from '@angular/material/select';

import { PurchaseOperationsService } from '../../../services/purchase-operations.service';
import { ISupplierListarPorPatronResponse } from '../../../interfaces/IMaestros';
import { TableDetailInvoicePurchaseComponent } from './components/table-detail-invoice-purchase/table-detail-invoice-purchase.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddItemInvoicePurchaseComponent } from './components/dialog-add-item-invoice-purchase/dialog-add-item-invoice-purchase.component';
import { PurchaseInvoiceStoreService } from '../../../services/purchase-invoice-store.service';
import { IInvoiceCreateRequest } from '../../../interfaces/IOperaciones';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';

@Component({
  selector: 'app-purchase-invoice',
  standalone: true,
  imports: [
    MatIconModule, MatInputModule, MatFormFieldModule, MatAutocompleteModule,
    MatButtonModule, FormsModule, ReactiveFormsModule,
    MatDatepickerModule, MatSelectModule, TableDetailInvoicePurchaseComponent,
    TitleCasePipe, AsyncPipe, NgFor
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './purchase-invoice.component.html',
  styleUrl: './purchase-invoice.component.css'
})
export class PurchaseInvoiceComponent implements OnInit, OnDestroy {
  operacionesService = inject(PurchaseOperationsService);
  purchaseSettingService = inject(PurchaseSettingServiceService);
  invoiceStoreService = inject(PurchaseInvoiceStoreService);
  dialog = inject(MatDialog);
  notificationService = inject(NotificationsSystemService);

  supplierControl = new FormControl();
  filteredSuppliers!: Observable<ISupplierListarPorPatronResponse[]>;
  frmInvoice: FormGroup;

  constructor(private fb: FormBuilder) {
    this.frmInvoice = this.fb.group({
      supplierId: [null, Validators.required], // Use null as the initial value for supplierId
      invoiceType: ['FT', Validators.required],
      invoiceSerie: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      invoiceIssueDate: [new Date(), Validators.required],
      invoiceExpirationDate: [new Date(), Validators.required],
      typePayment: ['CO', Validators.required],
      creditDays: [0, Validators.required],
      paymentMethod: ['EF', Validators.required],
      invoiceCurrency: ['PEN', Validators.required],
      exchangeRate: [1.00, Validators.required],
      invoiceComments: ['', Validators.required],
      igv: [0, Validators.required],
      subtotal: [0, Validators.required],
      total: [0, Validators.required],
    });

    // Link the supplierControl to the supplierId FormControl
    this.frmInvoice.get('supplierId')?.setValue(this.supplierControl.value);
    this.supplierControl.valueChanges.subscribe(value => {
      this.frmInvoice.get('supplierId')?.setValue(value);
    });


    effect(() => {

      const total = this.invoiceStoreService.itemSumTotal();
      const subtotal = parseFloat((this.invoiceStoreService.itemSumTotal() / 1.18).toFixed(2));
      const igv = parseFloat((total - subtotal).toFixed(2));

      this.frmInvoice.get('total')?.setValue(total);
      this.frmInvoice.get('subtotal')?.setValue(subtotal);
      this.frmInvoice.get('igv')?.setValue(igv);
    });

  }
  ngOnDestroy(): void {
    this.invoiceStoreService.resetState();
  }

  ngOnInit(): void {
    this.filteredSuppliers = this.supplierControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (value === '' || value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
          console.log('vacio');
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        this.frmInvoice.get('supplierId')?.setValue(value);
        return this.purchaseSettingService.listarProveedoresPorPatron(value).pipe(
          map(response => response.data),
        );
      }));

      this.invoiceStoreService.setStateEmit(false);

  }

  onClienteSelected(event: any) {
    const supplier = event.option.value;
    // this.clienteTelefono = cliente.telefono;
    // this.clienteNombre = cliente.nombres + ' ' + cliente.apellidos;
    // this.store.addCliente({ codigo: cliente.id, nombre: cliente.nombres + ' ' + cliente.apellidos, telefono: cliente.telefono });
  }

  displayFn(supplier: any): string {
    var returnDisplay = supplier && supplier.name ? supplier.name : supplier;
    return returnDisplay;
  }

  addItem() {
    const dialogRef = this.dialog.open(DialogAddItemInvoicePurchaseComponent, {
      data: { isAdd: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the result from the dialog
        console.log('Dialog result:', result);
        // You can add the new item to your invoice here
      }
    });
  }


  saveInvoice() {
    // Logic to save the invoice
    console.log('Invoice saved');

    if (this.frmInvoice.invalid) {
      console.log('Formulario invalido');
      this.notificationService.showError('Formulario invalido');
      return;
    }
    if (this.invoiceStoreService.items().length === 0) {
      console.log('No hay items en la factura');
      this.notificationService.showError('No hay items en la factura');
      return;
    }
    if (this.supplierControl.value === null || this.supplierControl.value === undefined) {
      console.log('No hay proveedor seleccionado');
      this.notificationService.showError('No hay proveedor seleccionado');
      return;
    }
    if (this.supplierControl.value.id === null || this.supplierControl.value.id === undefined) {
      console.log('No hay proveedor seleccionado');
      this.notificationService.showError('No hay proveedor seleccionado');
      return;
    }
    if (this.supplierControl.value.id === 0) {
      console.log('No hay proveedor seleccionado');
      this.notificationService.showError('No hay proveedor seleccionado');
      return;
    }



    let fechaEmision = new Date(this.frmInvoice.get('invoiceIssueDate')?.value).toISOString();
    let fechaVencimiento = new Date(this.frmInvoice.get('invoiceExpirationDate')?.value).toISOString();


    let IInvoiceCreateRequest: IInvoiceCreateRequest = {
      supplierId: this.supplierControl.value.id,
      invoiceType: this.frmInvoice.get('invoiceType')?.value,
      invoiceSerie: this.frmInvoice.get('invoiceSerie')?.value,
      invoiceNumber: this.frmInvoice.get('invoiceNumber')?.value,
      invoiceIssueDate: fechaEmision,
      invoiceExpirationDate: fechaVencimiento,
      typePayment: this.frmInvoice.get('typePayment')?.value,
      daysCredit: this.frmInvoice.get('creditDays')?.value,
      paymentMethod: this.frmInvoice.get('paymentMethod')?.value,
      total: this.frmInvoice.get('total')?.value,
      currencyId: this.frmInvoice.get('invoiceCurrency')?.value,
      exchangeRate: this.frmInvoice.get('exchangeRate')?.value,
      comments: this.frmInvoice.get('invoiceComments')?.value,
      subtotal: this.frmInvoice.get('subtotal')?.value,
      igv: this.frmInvoice.get('igv')?.value,
      purchaseInvoiceDetails: this.invoiceStoreService.items().map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),

    }
    // Call the service to create the invoice
    console.log('IInvoiceCreateRequest', IInvoiceCreateRequest);

    this.operacionesService.crearInvoice(IInvoiceCreateRequest).subscribe({
      next: (response) => {
        console.log('Invoice created successfully:', response);

        this.notificationService.showSuccessDialog('Se grabó correctamente la guía de trabajo.', '# ' + response.data.id, true);
        this.frmInvoice.disable();
        this.supplierControl.disable();
        this.invoiceStoreService.setStateEmit(true);

      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.notificationService.showErrorDialog('Ocurrio un error al intentar grabar la guia');
      }
    });


  }

  limpiar() {
    this.supplierControl.enable();
    this.frmInvoice.enable();
    this.invoiceStoreService.setStateEmit(false);
    this.frmInvoice.reset({
      invoiceType: 'FT',
      invoiceSerie: '',
      invoiceNumber: '',
      invoiceIssueDate: new Date(),
      invoiceExpirationDate: new Date(),
      typePayment: 'CO',
      creditDays: 0,
      paymentMethod: 'EF',
      invoiceCurrency: 'PEN',
      exchangeRate: 1.00,
      invoiceComments: ''
    });


    this.supplierControl.setValue(null);

    this.invoiceStoreService.resetState();
  }




}
