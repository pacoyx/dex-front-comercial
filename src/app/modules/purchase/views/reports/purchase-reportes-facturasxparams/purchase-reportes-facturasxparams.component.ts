import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, TitleCasePipe } from '@angular/common';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { IProductListarPatronResponse, ISupplierListarPorPatronResponse } from '../../../interfaces/IMaestros';
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { PurchaseOperationsService } from '../../../services/purchase-operations.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IFacturasPorParamsList } from '../../../interfaces/IReportes';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-purchase-reportes-facturasxparams',
  standalone: true,
  imports: [
    MatRadioModule, MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule, MatInputModule,
    FormsModule, ReactiveFormsModule, MatDatepickerModule, MatAutocompleteModule, TitleCasePipe, AsyncPipe, NgFor, CurrencyPipe,
    MatTableModule, DatePipe, MatPaginatorModule, MatSortModule, RouterModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './purchase-reportes-facturasxparams.component.html',
  styleUrl: './purchase-reportes-facturasxparams.component.css'
})
export class PurchaseReportesFacturasxparamsComponent implements OnInit, OnDestroy {

  optionsReportes = [
    { value: 1, viewValue: 'Por Mes' },
    { value: 2, viewValue: 'Por Fechas' },
    { value: 3, viewValue: 'Por Proveedor' },
    { value: 4, viewValue: 'Por Producto' },
  ]

  meses = [
    { value: 1, viewValue: 'Enero' },
    { value: 2, viewValue: 'Febrero' },
    { value: 3, viewValue: 'Marzo' },
    { value: 4, viewValue: 'Abril' },
    { value: 5, viewValue: 'Mayo' },
    { value: 6, viewValue: 'Junio' },
    { value: 7, viewValue: 'Julio' },
    { value: 8, viewValue: 'Agosto' },
    { value: 9, viewValue: 'Septiembre' },
    { value: 10, viewValue: 'Octubre' },
    { value: 11, viewValue: 'Noviembre' },
    { value: 12, viewValue: 'Diciembre' }
  ];

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  purchaseSettingService = inject(PurchaseSettingServiceService);
  purchaseOperationsService = inject(PurchaseOperationsService);
  supplierControl = new FormControl();
  filteredSuppliers!: Observable<ISupplierListarPorPatronResponse[]>;
  productControl = new FormControl();
  filteredProducts!: Observable<IProductListarPatronResponse[]>;

  selectedOptionReporte = 1;;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  selectedStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  selectedEndDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);


  displayedColumns: string[] = [
    'proveedor',
    'factura',
    'fechaemision',
    'fechavencimiento',
    'total',
    'moneda',
    'comentarios',
    'estado',
  ];

  dataSource = new MatTableDataSource<IFacturasPorParamsList>([]);
  totalProducts = 0;
  pageSize = 10;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;



  constructor() {
    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (value === '') {
          return of([]);
        }

        if (typeof value === 'object') {
          return of([value]);
        }

        return this.purchaseSettingService.listarProductosPorPatron(value).pipe(
          map(response => response.data),
        );
      }));

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
        // this.frmInvoice.get('supplierId')?.setValue(value);
        return this.purchaseSettingService.listarProveedoresPorPatron(value).pipe(
          map(response => response.data),
        );
      }));
  }

  ngOnInit(): void {
    this.selectedStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    this.selectedEndDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    this.rangeFrm.get('start')?.setValue(this.selectedStartDate);
    this.rangeFrm.get('end')?.setValue(this.selectedEndDate);
  }

  ngOnDestroy(): void {
    // this.store.removeCliente();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.paginator.page.subscribe(() => {          
        this.listarFacturas(this.paginator.pageIndex + 1, this.paginator.pageSize);      
    });
  }

  viewDetails(row: IFacturasPorParamsList) {
    // this.router.navigate(['/purchase/operations/invoice', row.id]);
  }

  onOptionSelected(event: any) {
    this.selectedOptionReporte = event.value;
    if (this.selectedOptionReporte === 1) {
      this.selectedStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      this.selectedEndDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    } else if (this.selectedOptionReporte === 2) {
      this.selectedStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      this.selectedEndDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    } else if (this.selectedOptionReporte === 3) {
      this.supplierControl.setValue(null);
    } else if (this.selectedOptionReporte === 4) {
      this.productControl.setValue(null);
    }
  }


  listarFacturas(pageIndex: number, pageSize: number) {

    if (this.selectedOptionReporte === 1) {
      this.purchaseOperationsService.obtenerFacturasPorMes(this.selectedYear, this.selectedMonth, pageIndex, pageSize).subscribe({
        next: (response) => {
          console.log(response.data);
          this.dataSource.data = response.data.invoices;
          this.totalProducts = response.data.totalCount;
          this.paginator.length = this.totalProducts;
        },
        error: (error) => {
          console.error(error);
        }
      });

    } else if (this.selectedOptionReporte === 2) {

      this.selectedStartDate = this.rangeFrm.get('start')?.value ?? new Date();
      this.selectedEndDate = this.rangeFrm.get('end')?.value ?? new Date();

      this.purchaseOperationsService.obtenerFacturasPorFechas(this.selectedStartDate.toISOString(), this.selectedEndDate.toISOString(), pageIndex, pageSize).subscribe({
        next: (response) => {
          console.log(response.data);
          this.dataSource.data = response.data.invoices;
          this.totalProducts = response.data.totalCount;
          this.paginator.length = this.totalProducts;
        },
        error: (error) => {
          console.error(error);
        }
      });

    } else if (this.selectedOptionReporte === 3) {
      // Cargar datos por proveedor
      this.purchaseOperationsService.obtenerFacturasPorProveedor(this.supplierControl.value.id, pageIndex, pageSize).subscribe({
        next: (response) => {
          console.log(response.data);
          this.dataSource.data = response.data.invoices;
          this.totalProducts = response.data.totalCount;
          this.paginator.length = this.totalProducts;
        },
        error: (error) => {
          console.error(error);
        }
      });


    } else if (this.selectedOptionReporte === 4) {
      // Cargar datos por producto
      this.purchaseOperationsService.obtenerFacturasPorProducto(this.productControl.value.name, pageIndex, pageSize).subscribe({
        next: (response) => {
          console.log(response.data);
          this.dataSource.data = response.data.invoices;
          this.totalProducts = response.data.totalCount;
          this.paginator.length = this.totalProducts;
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  onProductSelected(event: any) {
    const product = event.option.value;
    // this.precioUnitario = product.price;
    // this.productoId = product.id;
    // this.productoNombre = product.name;
    // this.unidadMedida = product.unitMeasurementDescription;
  }

  displayFn(product: any): string {
    var returnDisplay = product && product.name ? product.name : product;
    return returnDisplay;
  }

  onSupllierSelected(event: any) {
    const supplier = event.option.value;
    // this.clienteTelefono = cliente.telefono;
    // this.clienteNombre = cliente.nombres + ' ' + cliente.apellidos;
    // this.store.addCliente({ codigo: cliente.id, nombre: cliente.nombres + ' ' + cliente.apellidos, telefono: cliente.telefono });
  }

  displayFnSupplier(supplier: any): string {
    var returnDisplay = supplier && supplier.name ? supplier.name : supplier;
    return returnDisplay;
  }

}
