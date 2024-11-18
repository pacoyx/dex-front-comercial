import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MaestrosService } from '../../../services/maestros.service';
import { IResponseProdServices } from '../../../interfaces/IProdServices';
import { DialogFormRegProdServiceComponent } from './components/dialog-form-reg-prod-service/dialog-form-reg-prod-service.component';
import { DialogQuestionComponent } from '../../../components/dialog-question/dialog-question.component';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-mnt-prodservices',
  standalone: true,
  imports: [MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule,
    MatPaginatorModule, MatSortModule, MatButtonModule, DecimalPipe],
  templateUrl: './mnt-prodservices.component.html',
  styleUrl: './mnt-prodservices.component.css'
})
export class MntProdservicesComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dialog = inject(MatDialog);
  maestroSerivce = inject(MaestrosService);

  displayedColumns: string[] = [
    'name',        
    'price',    
    'isPeso',
    'isLavado',
    'status',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IResponseProdServices>([]);
  totalClientes = 0;
  pageSize = 10;
    

  constructor() { }

  ngOnInit(): void {
    this.cargarServicios(1, 10);
  }


  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    // this.dataSource.paginator = this.paginator; 
    this.paginator.page.subscribe(() => {
      this.cargarServicios(this.paginator.pageIndex + 1, this.paginator.pageSize);
    });
  }

  cargarServicios(pageIndex: number, pageSize: number) {
    this.maestroSerivce.obtenerProdServices(pageIndex, pageSize).subscribe(
      response => {     
        console.log('=======>',response);
           
        this.dataSource.data = response.data.servicios;
        this.totalClientes = response.data.totalCount;
        this.paginator.length = this.totalClientes;
      }
    );
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  editServicio(servicio: IResponseProdServices) {    
    const dialogRef = this.dialog.open(DialogFormRegProdServiceComponent, {
      width: '400px',
      data: { esNuevo: false, objServicio: servicio, idServicio: servicio.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {        
        this.cargarServicios(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  nuevoServicio() {
    const dialogRef = this.dialog.open(DialogFormRegProdServiceComponent, {
      width: '400px',
      data: { esNuevo: true, objServicio: null, idServicio: 0 }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {        
        this.cargarServicios(this.paginator.pageIndex + 1, this.paginator.pageSize);
      }
    });
  }

  deleteServicio(servicio: IResponseProdServices) {    
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Servicio', message: `¿Está seguro de eliminar el servicio ${servicio.name}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {        
        this.maestroSerivce.eliminarProdService(servicio.id).subscribe({
          next: (resp) => {
            if (resp.success) {              
              this.cargarServicios(this.paginator.pageIndex + 1, this.paginator.pageSize);
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
