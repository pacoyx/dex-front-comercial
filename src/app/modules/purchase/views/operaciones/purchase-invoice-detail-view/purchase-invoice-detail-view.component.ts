import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PurchaseOperationsService } from '../../../services/purchase-operations.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IListInvoiceByIdDetail } from '../../../interfaces/IReportes';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-invoice-detail-view',
  standalone: true,
  imports: [
    MatTableModule, CurrencyPipe, MatIconModule, MatFormFieldModule,
    MatInputModule, MatDatepickerModule, ReactiveFormsModule
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
  invoiceId: string = '';
  dataSource = new MatTableDataSource<IListInvoiceByIdDetail>([]);
  displayedColumns: string[] = [
    'producto',
    'cantidad',
    'precio',
    'total',
    'glosa'
  ];

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
    console.log('Buscando invoice con ID:', this.invoiceId);
    this.purchaseOperationsService.obtenerInvoicePorId(Number(this.invoiceId)).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Factura encontrada:', response.data);
          this.dataSource = new MatTableDataSource<IListInvoiceByIdDetail>(response.data.purchaseInvoiceDetails);
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
          console.error('Error al obtener la factura:', response.message);
        }
      },
      error: (error) => {
        console.error('Error en la solicitud:', error);
      }
    });
  }

}
