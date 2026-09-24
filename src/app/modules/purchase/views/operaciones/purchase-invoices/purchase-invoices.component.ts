import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, TitleCasePipe } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { RouterModule } from '@angular/router';
import { debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { PurchaseOperationsService } from '../../../services/purchase-operations.service';
import { ISupplierListarPorPatronResponse } from '../../../interfaces/IMaestros';
import { IPurchaseInvoiceListItem } from '../../../interfaces/IOperaciones';
import { PurchaseInvoiceStatusColorPipe, PurchaseInvoiceStatusLabelPipe } from '../../../shared/purchase-invoice-status';

@Component({
  selector: 'app-purchase-invoices',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatTableModule, MatDatepickerModule, ReactiveFormsModule, FormsModule,
    RouterModule, AsyncPipe, CurrencyPipe, DatePipe, TitleCasePipe, NgFor,
    PurchaseInvoiceStatusLabelPipe, PurchaseInvoiceStatusColorPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './purchase-invoices.component.html',
  styleUrl: './purchase-invoices.component.css'
})
export class PurchaseInvoicesComponent implements OnInit {

  private purchaseSettingService = inject(PurchaseSettingServiceService);
  private purchaseOperationsService = inject(PurchaseOperationsService);
  private notificationService = inject(NotificationsSystemService);

  supplierControl = new FormControl();
  filteredSuppliers!: Observable<ISupplierListarPorPatronResponse[]>;
  selectedSupplier: ISupplierListarPorPatronResponse | null = null;

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  statusOptions = [
    { value: null, label: 'Todos' },
    { value: 'A', label: 'Activo' },
    { value: 'I', label: 'Anulado' },
  ];
  selectedStatus: string | null = null;

  displayedColumns: string[] = ['factura', 'proveedor', 'emision', 'vencimiento', 'formaPago', 'total', 'estadoPago', 'estado'];
  dataSource = new MatTableDataSource<IPurchaseInvoiceListItem>([]);

  ngOnInit(): void {
    this.filteredSuppliers = this.supplierControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        return this.purchaseSettingService.listarProveedoresPorPatron(value).pipe(
          map(response => response.data),
        );
      })
    );

    this.buscar();
  }

  onSupplierSelected(event: any) {
    this.selectedSupplier = event.option.value;
  }

  displayFn(supplier: ISupplierListarPorPatronResponse): string {
    return supplier ? supplier.name : '';
  }

  buscar(): void {
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    this.purchaseOperationsService.listarFacturas({
      supplierId: this.selectedSupplier?.id,
      dateFrom: start ? start.toISOString() : undefined,
      dateTo: end ? end.toISOString() : undefined,
      status: this.selectedStatus ?? undefined,
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
      },
      error: (err) => {
        console.error(err);
        this.notificationService.showError('Ocurrió un error al listar las facturas de compra.');
      }
    });
  }

  limpiar(): void {
    this.supplierControl.setValue(null);
    this.selectedSupplier = null;
    this.rangeFrm.reset();
    this.selectedStatus = null;
    this.buscar();
  }

}
