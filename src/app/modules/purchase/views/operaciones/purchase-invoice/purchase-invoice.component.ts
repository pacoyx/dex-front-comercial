import { Component, effect, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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
import { LoginService } from '../../../../../core/services/login.service';
import { PermissionsStoreService } from '../../../../../core/services/permissions-store.service';
import { InventarioService } from '../../../../inventario/services/inventario.service';
import { IWarehouse } from '../../../../inventario/interfaces/IInventario';
import { extractErrorMessage } from '../../../shared/http-error.util';

@Component({
  selector: 'app-purchase-invoice',
  standalone: true,
  imports: [
    MatIconModule, MatInputModule, MatFormFieldModule, MatAutocompleteModule,
    MatButtonModule, MatCardModule, FormsModule, ReactiveFormsModule,
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
  guardando = false;

  private inventarioService = inject(InventarioService);
  private loginService = inject(LoginService);
  private permissionsStore = inject(PermissionsStoreService);
  almacenes: IWarehouse[] = [];
  private almacenPorDefecto: number | null = null;

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
      warehouseId: [null as number | null],
    });

    // Link the supplierControl to the supplierId FormControl
    this.frmInvoice.get('supplierId')?.setValue(this.supplierControl.value);
    this.supplierControl.valueChanges.subscribe(value => {
      this.frmInvoice.get('supplierId')?.setValue(value);
    });

    this.frmInvoice.get('invoiceExpirationDate')?.valueChanges.subscribe(() => {
      this.actualizarFormaPagoPorVencimiento();
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

      this.cargarAlmacenes();
  }

  /**
   * Almacenes activos para el ingreso de la compra. Se propone el almacén por defecto de la sucursal del
   * usuario. Si el usuario no tiene acceso a Inventarios, la lista queda vacía y la compra se graba sin
   * ingreso a almacén (como antes).
   */
  private cargarAlmacenes(): void {
    // Sin permiso de Inventarios no se consulta (evita el aviso de "sin permiso" del interceptor).
    if (!this.permissionsStore.hasPermission('inventory.access')) {
      return;
    }
    this.inventarioService.listarAlmacenes(true).subscribe({
      next: (resp) => {
        this.almacenes = resp.data;
        const branchId = this.loginService.getLoginData()?.branchSales?.[0]?.branchSalesId;
        const porDefecto = resp.data.find(a => a.isDefault && a.branchSalesId === branchId)
          ?? resp.data.find(a => a.isDefault)
          ?? null;
        this.almacenPorDefecto = porDefecto?.id ?? null;
        this.frmInvoice.get('warehouseId')?.setValue(this.almacenPorDefecto);
      },
      error: () => this.almacenes = []
    });
  }

  private actualizarFormaPagoPorVencimiento(): void {
    const fechaEmision = this.frmInvoice.get('invoiceIssueDate')?.value;
    const fechaVencimiento = this.frmInvoice.get('invoiceExpirationDate')?.value;

    if (!fechaEmision || !fechaVencimiento) {
      return;
    }

    const emision = new Date(fechaEmision);
    const vencimiento = new Date(fechaVencimiento);
    emision.setHours(0, 0, 0, 0);
    vencimiento.setHours(0, 0, 0, 0);

    if (vencimiento.getTime() < emision.getTime()) {
      this.notificationService.showError('La fecha de vencimiento no puede ser menor a la fecha de emisión.');
      // Se difiere para que corra fuera del ciclo de escritura del propio datepicker,
      // de lo contrario el input queda mostrando la fecha invalida aunque el control ya tenga el valor correcto.
      setTimeout(() => {
        this.frmInvoice.get('invoiceExpirationDate')?.setValue(new Date(fechaEmision));
      });
      return;
    }

    if (emision.getTime() === vencimiento.getTime()) {
      this.frmInvoice.get('typePayment')?.setValue('CO');
      this.frmInvoice.get('creditDays')?.setValue(0);
    } else {
      const diffDays = Math.round((vencimiento.getTime() - emision.getTime()) / (1000 * 60 * 60 * 24));
      this.frmInvoice.get('typePayment')?.setValue('CR');
      this.frmInvoice.get('creditDays')?.setValue(diffDays);
    }
  }

  onClienteSelected(event: any) {
    const supplier = event.option.value;
    // this.clienteTelefono = cliente.telefono;
    // this.clienteNombre = cliente.nombres + ' ' + cliente.apellidos;
    // this.store.addCliente({ codigo: cliente.id, nombre: cliente.nombres + ' ' + cliente.apellidos, telefono: cliente.telefono });
  }

  clearSupplier(event: Event): void {
    event.stopPropagation();
    this.supplierControl.setValue(null);
    this.frmInvoice.get('supplierId')?.setValue(null);
  }

  displayFn(supplier: any): string {
    var returnDisplay = supplier && supplier.name ? `${supplier.name} — RUC ${supplier.ruc}` : supplier;
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
    if (this.guardando) {
      return;
    }

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
      warehouseId: this.frmInvoice.get('warehouseId')?.value ?? null,

    }
    // Call the service to create the invoice
    console.log('IInvoiceCreateRequest', IInvoiceCreateRequest);

    this.guardando = true;
    this.operacionesService.crearInvoice(IInvoiceCreateRequest).subscribe({
      next: (response) => {
        this.guardando = false;
        console.log('Invoice created successfully:', response);

        this.notificationService.showSuccessDialog('Se grabó correctamente la guía de trabajo.', '# ' + response.data.id, true);
        this.frmInvoice.disable();
        this.supplierControl.disable();
        this.invoiceStoreService.setStateEmit(true);

      },
      error: (error) => {
        this.guardando = false;
        console.error('Error creating invoice:', error);
        // Muestra el motivo del backend (p. ej. almacén inactivo); si no hay, el mensaje genérico.
        this.notificationService.showErrorDialog(extractErrorMessage(error, 'Ocurrio un error al intentar grabar la compra'));
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
      invoiceComments: '',
      warehouseId: this.almacenPorDefecto
    });


    this.supplierControl.setValue(null);

    this.invoiceStoreService.resetState();
  }




}
