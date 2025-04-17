import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { IProductListarResponse, ISupplierListarResponse } from '../../../interfaces/IMaestros';
import { MatDialog } from '@angular/material/dialog';
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { DialogformRegProductComponent } from './components/dialogform-reg-product/dialogform-reg-product.component';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatSortModule, MatButtonModule, FormsModule, ReactiveFormsModule, CurrencyPipe
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit, AfterViewInit {
purchaseSettingService = inject(PurchaseSettingServiceService);
  dialog = inject(MatDialog);
  displayedColumns: string[] = [
    'name',
    'price',        
    'stock',
    'status'    
  ];
  
  dataSource = new MatTableDataSource<IProductListarResponse>([]);
  totalProducts = 0;
  pageSize = 10;
  bolFiltro = false;
  filterControl = new FormControl();

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  ngOnInit(): void {
      this.cargarProducts(1, 10);
      this.filterControl.valueChanges
        .pipe(
          // startWith(''),
          debounceTime(300),
          distinctUntilChanged(),
          switchMap(value => {
            if (value === '') {
              return of([]);
            }          
            return this.purchaseSettingService.listarProductosPaginado(1, 10, value).pipe(
              map(response => response.data)
            );
          })
        )
        .subscribe(response => {
          if (this.filterControl.value === '') {
            this.limpiaFiltro();
            return;
          }
  
          this.bolFiltro = true;
          if (response && 'products' in response) {
            this.dataSource.data = response.products;
            this.totalProducts = response.totalCount;
            this.paginator.length = this.totalProducts; // Asegúrate de actualizar la longitud del paginador
          }
  
          this.paginator.pageIndex = 0;
        });
    }
  
    ngAfterViewInit() {
      this.dataSource.sort = this.sort;
      this.paginator.page.subscribe(() => {
        if (this.bolFiltro) {
          this.cargarClientesFiltro(this.paginator.pageIndex + 1, this.paginator.pageSize,this.filterControl.value);
        } else {
          this.cargarProducts(this.paginator.pageIndex + 1, this.paginator.pageSize);
        }
      });
    }
  
    cargarProducts(pageIndex: number, pageSize: number) {
      this.purchaseSettingService.listarProductosPaginado(pageIndex, pageSize, '').subscribe(
        response => {
          this.dataSource.data = response.data.products;
          this.totalProducts = response.data.totalCount;
          this.paginator.length = this.totalProducts; // Asegúrate de actualizar la longitud del paginador
        }
      );
    }
  
  
    limpiaFiltro() {
      this.bolFiltro = false;
      this.cargarProducts(1, 10);
      this.filterControl.setValue('');
    }
  
    cargarClientesFiltro(pageIndex: number, pageSize: number, textoFiltro: string) {
      this.purchaseSettingService.listarProductosPaginado(pageIndex, pageSize, textoFiltro).subscribe(
        response => {
          this.dataSource.data = response.data.products;
          this.totalProducts = response.data.totalCount;
          this.paginator.length = this.totalProducts; // Asegúrate de actualizar la longitud del paginador        
        }
      );
    }
  
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }
  
  
    editProduct(supplier: ISupplierListarResponse) {
      const dialogRef = this.dialog.open(DialogformRegProductComponent, {
        // width: '400px',
        data: { esNuevo: false, objSupplier: supplier }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cargarProducts(this.paginator.pageIndex + 1, this.paginator.pageSize);
        }
      });
    }
  
    nuevoProduct() {
      const dialogRef = this.dialog.open(DialogformRegProductComponent, {
        // width: '400px',
        data: { esNuevo: true, objCliente: null }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cargarProducts(this.paginator.pageIndex + 1, this.paginator.pageSize);
        }
      });
    }

}
