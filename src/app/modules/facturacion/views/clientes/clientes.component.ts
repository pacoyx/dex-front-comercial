import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';
import { ClientesService } from '../../services/clientes.service';
import { CustomerType, ICustomer } from '../../interfaces/ICustomer';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogFormRegClienteComponent } from './components/dialog-form-reg-cliente/dialog-form-reg-cliente.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule, MatCardModule,
    MatPaginatorModule, MatSortModule, MatButtonModule, FormsModule, ReactiveFormsModule, RouterModule
  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit, AfterViewInit {

  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  displayedColumns: string[] = ['firstName', 'docPersonal', 'customerType', 'phone', 'email', 'status', 'operaciones'];
  dataSource = new MatTableDataSource<ICustomer>([]);
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
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(value => {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return of(null);
          }
          return this.clientesService.obtenerClientesFiltrarPaginator(1, 10, value).pipe(
            map(response => response.data)
          );
        })
      )
      .subscribe(response => {
        if (!this.filterControl.value) {
          this.limpiaFiltro();
          return;
        }

        this.bolFiltro = true;
        if (response) {
          this.dataSource.data = response.customers;
          this.totalClientes = response.totalCount;
          this.paginator.length = this.totalClientes;
        }
        this.paginator.pageIndex = 0;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.paginator.page.subscribe(() => {
      if (this.bolFiltro) {
        this.cargarClientesFiltro(this.paginator.pageIndex + 1, this.paginator.pageSize, this.filterControl.value);
      } else {
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  cargarClientes(pageIndex: number, pageSize: number): void {
    this.clientesService.obtenerClientes(pageIndex, pageSize).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.customers;
        this.totalClientes = response.data.totalCount;
        this.paginator.length = this.totalClientes;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el listado de clientes.'));
      }
    });
  }

  cargarClientesFiltro(pageIndex: number, pageSize: number, textoFiltro: string): void {
    this.clientesService.obtenerClientesFiltrarPaginator(pageIndex, pageSize, textoFiltro).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.customers;
        this.totalClientes = response.data.totalCount;
        this.paginator.length = this.totalClientes;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el listado de clientes.'));
      }
    });
  }

  limpiaFiltro(): void {
    this.bolFiltro = false;
    this.filterControl.setValue('', { emitEvent: false });
    this.cargarClientes(1, 10);
  }

  nuevoCliente(): void {
    const dialogRef = this.dialog.open(DialogFormRegClienteComponent, {
      data: { esNuevo: true, objCliente: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  editarCliente(cliente: ICustomer): void {
    const dialogRef = this.dialog.open(DialogFormRegClienteComponent, {
      data: { esNuevo: false, objCliente: cliente }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  esEmpresa(customerType: unknown): boolean {
    return Number(customerType) === CustomerType.Company;
  }

  verFichaCliente(cliente: ICustomer): void {
    this.router.navigate(['/facturacion/clientes', cliente.id], { state: { cliente } });
  }

  eliminarCliente(cliente: ICustomer): void {
    if (!confirm(`¿Está seguro de eliminar el cliente "${cliente.firstName} ${cliente.lastName}"?`)) {
      return;
    }

    this.clientesService.eliminarCliente(cliente.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notificationService.showSuccess('Cliente eliminado correctamente.');
          this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
        }
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el cliente.'));
      }
    });
  }

}
