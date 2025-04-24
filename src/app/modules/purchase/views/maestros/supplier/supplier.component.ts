import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { PurchaseSettingServiceService } from '../../../services/purchase-setting-service.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { ISupplierListarResponse } from '../../../interfaces/IMaestros';
import { MatDialog } from '@angular/material/dialog';
import { DialogFormRegProveedorComponent } from './components/dialog-form-reg-proveedor/dialog-form-reg-proveedor.component';
import { DialogQuestionOneComponent } from '../../../../../core/components/dialog-question-one/dialog-question-one.component';

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatSortModule, MatButtonModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './supplier.component.html',
  styleUrl: './supplier.component.css'
})
export class SupplierComponent implements OnInit, AfterViewInit {
  purchaseSettingService = inject(PurchaseSettingServiceService);
  dialog = inject(MatDialog);
  displayedColumns: string[] = [
    // 'id',
    'actions',
    'name',
    'ruc',
    // 'address',
    'phone',
    'email',
    'contactName',
    // 'contactPhone',
    // 'status',
    // 'operaciones'
  ];
  
  dataSource = new MatTableDataSource<ISupplierListarResponse>([]);
  totalClientes = 0;
  pageSize = 10;
  bolFiltro = false;
  filterControl = new FormControl();

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.cargarClientes(1, 10);
    this.filterControl.valueChanges
      .pipe(
        // startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (value === '') {
            return of([]);
          }          
          return this.purchaseSettingService.listarProveedoresPaginado(1, 10, value).pipe(
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
        if (response && 'suppliers' in response) {
          this.dataSource.data = response.suppliers;
          this.totalClientes = response.totalCount;
          this.paginator.length = this.totalClientes; // Asegúrate de actualizar la longitud del paginador
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
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  cargarClientes(pageIndex: number, pageSize: number) {
    this.purchaseSettingService.listarProveedoresPaginado(pageIndex, pageSize, '').subscribe(
      response => {
        this.dataSource.data = response.data.suppliers;
        this.totalClientes = response.data.totalCount;
        this.paginator.length = this.totalClientes; // Asegúrate de actualizar la longitud del paginador
      }
    );
  }


  limpiaFiltro() {
    this.bolFiltro = false;
    this.cargarClientes(1, 10);
    this.filterControl.setValue('');
  }

  cargarClientesFiltro(pageIndex: number, pageSize: number, textoFiltro: string) {
    this.purchaseSettingService.listarProveedoresPaginado(pageIndex, pageSize, textoFiltro).subscribe(
      response => {
        this.dataSource.data = response.data.suppliers;
        this.totalClientes = response.data.totalCount;
        this.paginator.length = this.totalClientes; // Asegúrate de actualizar la longitud del paginador        
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  editSupplier(supplier: ISupplierListarResponse) {
    const dialogRef = this.dialog.open(DialogFormRegProveedorComponent, {
      // width: '400px',
      data: { esNuevo: false, objSupplier: supplier }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  nuevoSupplier() {
    const dialogRef = this.dialog.open(DialogFormRegProveedorComponent, {
      // width: '400px',
      data: { esNuevo: true, objCliente: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  deleteSupplier(supplier: ISupplierListarResponse) {
    const dialogRef = this.dialog.open(DialogQuestionOneComponent, {
      // width: '400px',
      data: { title: 'Eliminar Proveedor', message: `¿Está seguro de eliminar el proveedor  ${supplier.name}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        // this.maestroSerivce.eliminarCliente(cliente.id).subscribe({
        //   next: (resp) => {
        //     if (resp.success) {
        //       this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
        //     }
        //   },
        //   error: (err) => {
        //     console.log(err);
        //   }
        // });
      }
    });
  }

}
