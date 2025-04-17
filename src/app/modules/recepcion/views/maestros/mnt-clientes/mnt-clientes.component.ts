import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MaestrosService } from '../../../services/maestros.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IResponseCustomers } from '../../../interfaces/ICliente';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { DialogFormRegClienteComponent } from './components/dialog-form-reg-cliente/dialog-form-reg-cliente.component';
import { MatButtonModule } from '@angular/material/button';
import { DialogQuestionComponent } from '../../../components/dialog-question/dialog-question.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';


@Component({
  selector: 'app-mnt-clientes',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatSortModule, MatButtonModule, FormsModule, ReactiveFormsModule
  ],
  templateUrl: './mnt-clientes.component.html',
  styleUrl: './mnt-clientes.component.css'
})
export class MntClientesComponent implements OnInit, AfterViewInit {
  maestroSerivce = inject(MaestrosService);

  displayedColumns: string[] = [
    'firstName',
    'address',
    'phone',
    'email',
    'docPersonal',
    'status',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IResponseCustomers>([]);
  totalClientes = 0;
  pageSize = 10;
  dialog = inject(MatDialog);
  bolFiltro = false;  
  filterControl = new FormControl();

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() { }

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
          // Replace with actual observable logic if needed
          return this.maestroSerivce.obtenerClientesFiltrarPaginator(1, 10, value).pipe(
            map(response => response.data)
          );
        })
      )
      .subscribe((response) => {
        if(this.filterControl.value === '') {
          this.limpiaFiltro();
          return;
        }
        
        this.bolFiltro = true;
        if (response && 'customers' in response) {
            this.dataSource.data = response.customers;
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
    this.maestroSerivce.obtenerClientes(pageIndex, pageSize).subscribe(
      response => {
        this.dataSource.data = response.data.customers;
        this.totalClientes = response.data.totalCount;
        this.paginator.length = this.totalClientes; // Asegúrate de actualizar la longitud del paginador
      }
    );
  }


  limpiaFiltro() {    
    console.log('limpiaFiltro');    
    this.bolFiltro = false;
    this.cargarClientes(1, 10);    
    this.filterControl.setValue('');
  }

  cargarClientesFiltro(pageIndex: number, pageSize: number, textoFiltro: string) {
    this.maestroSerivce.obtenerClientesFiltrarPaginator(pageIndex, pageSize, textoFiltro).subscribe(
      response => {
        this.dataSource.data = response.data.customers;
        this.totalClientes = response.data.totalCount;
        this.paginator.length = this.totalClientes; // Asegúrate de actualizar la longitud del paginador        
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editCliente(cliente: IResponseCustomers) {
    const dialogRef = this.dialog.open(DialogFormRegClienteComponent, {
      width: '400px',
      data: { esNuevo: false, objCliente: cliente }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  nuevoCliente() {
    const dialogRef = this.dialog.open(DialogFormRegClienteComponent, {
      width: '400px',
      data: { esNuevo: true, objCliente: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  deleteCliente(cliente: IResponseCustomers) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Cliente', message: `¿Está seguro de eliminar el cliente ${cliente.firstName} ${cliente.lastName}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.eliminarCliente(cliente.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
            }
          },
          error: (err) => {
            console.log(err);
          }
        });
      }
    });
  }

}
