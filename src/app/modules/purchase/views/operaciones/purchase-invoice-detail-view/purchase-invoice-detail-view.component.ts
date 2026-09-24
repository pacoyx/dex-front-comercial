import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PurchaseOperationsService } from '../../../services/purchase-operations.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IListInvoiceByIdDetail, IListInvoiceByIdResponse } from '../../../interfaces/IReportes';
import { IPurchaseInvoicePayment } from '../../../interfaces/IOperaciones';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { PurchaseInvoiceStatus, PurchaseInvoiceStatusColorPipe, PurchaseInvoiceStatusLabelPipe } from '../../../shared/purchase-invoice-status';
import { DialogRegistrarPagoCompraComponent } from './components/dialog-registrar-pago-compra/dialog-registrar-pago-compra.component';

@Component({
  selector: 'app-purchase-invoice-detail-view',
  standalone: true,
  imports: [
    MatTableModule, CurrencyPipe, DatePipe, MatIconModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatDatepickerModule, ReactiveFormsModule, MatCardModule,
    PurchaseInvoiceStatusLabelPipe, PurchaseInvoiceStatusColorPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './purchase-invoice-detail-view.component.html',
  styleUrl: './purchase-invoice-detail-view.component.css'
})
export class PurchaseInvoiceDetailViewComponent {
  route = inject(ActivatedRoute);
  purchaseOperationsService = inject(PurchaseOperationsService);
  notificationService = inject(NotificationsSystemService);
  dialog = inject(MatDialog);

  invoiceId: string = '';
  invoice: IListInvoiceByIdResponse | null = null;

  dataSource = new MatTableDataSource<IListInvoiceByIdDetail>([]);
  displayedColumns: string[] = [
    'producto',
    'cantidad',
    'precio',
    'total',
    'glosa'
  ];

  paymentsDataSource = new MatTableDataSource<IPurchaseInvoicePayment>([]);
  paymentColumns: string[] = ['paymentDate', 'paymentMethodName', 'amount', 'operationNumber', 'observation'];

  formInvoice!: FormGroup;



  constructor(private fb: FormBuilder) {
    this.route.params.subscribe(params => {
      if (params['invoiceId']) {
        this.invoiceId = params['invoiceId'];
        this.buscarInvoice();
      }
    });

    this.formInvoice = this.fb.group({
      invoiceId: [{ value: '', disabled: false }],
      invoiceType: [{ value: '', disabled: false }],
      invoiceSerie: [{ value: '', disabled: false }],
      invoiceNumber: [{ value: '', disabled: false }],
      invoiceIssueDate: [{ value: '', disabled: true }],
      invoiceExpirationDate: [{ value: '', disabled: true }],
      typePayment: [{ value: '', disabled: false }],
      daysCredit: [{ value: 0, disabled: false }],
      paymentMethod: [{ value: '', disabled: false }],
      totalAmount: [{ value: 0, disabled: false }],
      status: [{ value: '', disabled: false }],
      amountPaid: [{ value: 0, disabled: false }],
      balance: [{ value: 0, disabled: false }],
      supplierId: [{ value: 0, disabled: false }],
      supplierName: [{ value: '', disabled: false }],
      supplierRuc: [{ value: '', disabled: false }],
      subtotal: [{ value: 0, disabled: false }],
      igv: [{ value: 0, disabled: false }],
      currencyId: [{ value: '', disabled: false }],
      exchangeRate: [{ value: 0, disabled: false }],
      comments: [{ value: '', disabled: false }],
      purchaseDate: [{ value: '', disabled: false }],
    });


  }


  buscarInvoice() {
    this.purchaseOperationsService.obtenerInvoicePorId(Number(this.invoiceId)).subscribe({
      next: (response) => {
        if (response.success) {
          this.invoice = response.data;
          this.dataSource = new MatTableDataSource<IListInvoiceByIdDetail>(response.data.purchaseInvoiceDetails);
          this.paymentsDataSource.data = response.data.payments;
          this.formInvoice.patchValue({
            invoiceId: response.data.id,
            invoiceType: response.data.invoiceType,
            invoiceSerie: response.data.invoiceSerie,
            invoiceNumber: response.data.invoiceNumber,
            invoiceIssueDate: response.data.invoiceIssueDate,
            invoiceExpirationDate: response.data.invoiceExpirationDate,
            typePayment: response.data.typePayment,
            daysCredit: response.data.daysCredit,
            paymentMethod: response.data.paymentMethod,
            totalAmount: response.data.total,
            status: response.data.status,
            amountPaid: response.data.amountPaid,
            balance: response.data.balance,
            supplierId: response.data.supplierId,
            supplierName: response.data.supplierName,
            supplierRuc: response.data.supplierRuc,
            subtotal: response.data.subtotal,
            igv: response.data.igv,
            currencyId: response.data.currencyId,
            exchangeRate: response.data.exchangeRate,
            comments: response.data.comments,
            purchaseDate: response.data.purchaseDate
          });
        } else {
          this.notificationService.showError(response.message || 'No se pudo obtener la compra.');
        }
      },
      error: (error) => {
        this.notificationService.showError(extractErrorMessage(error, 'No se pudo obtener la compra.'));
      }
    });
  }

  get canCancel(): boolean {
    if (!this.invoice) return false;
    return this.invoice.paymentStatus !== PurchaseInvoiceStatus.Cancelled && this.invoice.amountPaid === 0;
  }

  get canRegisterPayment(): boolean {
    if (!this.invoice) return false;
    return this.invoice.paymentStatus !== PurchaseInvoiceStatus.Cancelled
      && this.invoice.paymentStatus !== PurchaseInvoiceStatus.Paid
      && this.invoice.balance > 0;
  }

  anularCompra() {
    if (!this.invoice) return;
    if (!confirm('¿Está seguro de anular esta compra? Esta acción no se puede deshacer.')) {
      return;
    }
    this.purchaseOperationsService.anularCompra(this.invoice.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Compra anulada correctamente.');
        this.buscarInvoice();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo anular la compra.'));
      }
    });
  }

  registrarPago() {
    if (!this.invoice) return;
    const dialogRef = this.dialog.open(DialogRegistrarPagoCompraComponent, {
      data: { purchaseInvoiceId: this.invoice.id, balance: this.invoice.balance }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.buscarInvoice();
      }
    });
  }

}
