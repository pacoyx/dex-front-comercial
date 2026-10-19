import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { InvoicesService } from '../../../services/invoices.service';
import { IInvoiceDetail, IInvoiceDetailLine, IInvoicePayment } from '../../../interfaces/IInvoices';
import { InvoiceStatus, InvoiceStatusColorPipe, InvoiceStatusLabelPipe } from '../../../shared/invoice-status';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogRegistrarPagoComponent } from './components/dialog-registrar-pago/dialog-registrar-pago.component';

@Component({
  selector: 'app-factura-detail',
  standalone: true,
  imports: [
    MatTableModule, CurrencyPipe, DatePipe, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
    ReactiveFormsModule, MatButtonModule, RouterModule, InvoiceStatusLabelPipe, InvoiceStatusColorPipe
  ],
  templateUrl: './factura-detail.component.html',
  styleUrl: './factura-detail.component.css'
})
export class FacturaDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  invoicesService = inject(InvoicesService);
  notificationService = inject(NotificationsSystemService);
  dialog = inject(MatDialog);

  invoiceId = 0;
  invoice: IInvoiceDetail | null = null;

  detailDataSource = new MatTableDataSource<IInvoiceDetailLine>([]);
  detailColumns: string[] = ['description', 'quantity', 'unitPrice', 'discount', 'total'];

  paymentsDataSource = new MatTableDataSource<IInvoicePayment>([]);
  paymentColumns: string[] = ['paymentDate', 'paymentMethodName', 'amount', 'operationNumber', 'observation'];

  formInvoice!: FormGroup;
  imprimiendo = false;

  constructor(private fb: FormBuilder) {
    this.formInvoice = this.fb.group({
      customerName: [{ value: '', disabled: true }],
      serie: [{ value: '', disabled: true }],
      numero: [{ value: '', disabled: true }],
      issueDate: [{ value: '', disabled: true }],
      dueDate: [{ value: '', disabled: true }],
      subTotal: [{ value: 0, disabled: true }],
      igv: [{ value: 0, disabled: true }],
      total: [{ value: 0, disabled: true }],
      currencyId: [{ value: '', disabled: true }],
      exchangeRate: [{ value: 0, disabled: true }],
      amountPaid: [{ value: 0, disabled: true }],
      balance: [{ value: 0, disabled: true }],
      paymentMethod: [{ value: '', disabled: true }],
      typePayment: [{ value: '', disabled: true }],
      daysCredit: [{ value: 0, disabled: true }],
      notes: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.invoiceId = Number(params['id']);
        this.buscarFactura();
      }
    });
  }

  buscarFactura() {
    this.invoicesService.obtenerFacturaPorId(this.invoiceId).subscribe({
      next: (response) => {
        this.invoice = response.data;
        this.detailDataSource.data = response.data.details;
        this.paymentsDataSource.data = response.data.payments;
        this.formInvoice.patchValue({
          customerName: response.data.customerName,
          serie: response.data.serie,
          numero: response.data.numero,
          issueDate: response.data.issueDate,
          dueDate: response.data.dueDate,
          subTotal: response.data.subTotal,
          igv: response.data.igv,
          total: response.data.total,
          currencyId: response.data.currencyId,
          exchangeRate: response.data.exchangeRate,
          amountPaid: response.data.amountPaid,
          balance: response.data.balance,
          paymentMethod: response.data.paymentMethod,
          typePayment: response.data.typePayment,
          daysCredit: response.data.daysCredit,
          notes: response.data.notes,
        });
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener la factura.'));
      }
    });
  }

  get canCancel(): boolean {
    if (!this.invoice) return false;
    return this.invoice.status !== InvoiceStatus.Cancelled
      && this.invoice.status !== InvoiceStatus.Paid
      && this.invoice.amountPaid === 0;
  }

  get canRegisterPayment(): boolean {
    if (!this.invoice) return false;
    return this.invoice.status !== InvoiceStatus.Cancelled
      && this.invoice.status !== InvoiceStatus.Paid
      && this.invoice.balance > 0;
  }

  anularFactura() {
    if (!this.invoice) return;
    if (!confirm('¿Está seguro de anular esta factura? Esta acción no se puede deshacer.')) {
      return;
    }
    this.invoicesService.anularFactura(this.invoice.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Factura anulada correctamente.');
        this.buscarFactura();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo anular la factura.'));
      }
    });
  }

  imprimirFactura(): void {
    if (!this.invoice || this.imprimiendo) return;

    this.imprimiendo = true;
    this.invoicesService.descargarFacturaPdf(this.invoice.id).subscribe({
      next: (blob) => {
        this.imprimiendo = false;
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        this.imprimiendo = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar el PDF de la factura.'));
      },
    });
  }

  registrarPago() {
    if (!this.invoice) return;
    const dialogRef = this.dialog.open(DialogRegistrarPagoComponent, {
      data: { invoiceId: this.invoice.id, balance: this.invoice.balance }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.buscarFactura();
      }
    });
  }

}
