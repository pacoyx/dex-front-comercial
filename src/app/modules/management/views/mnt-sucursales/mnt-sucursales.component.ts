import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaestrosService } from '../../../recepcion/services/maestros.service';
import { IBranchSalesEditDto, IBranchSalesResponseDto } from '../../../recepcion/interfaces/IBranchSales';
import { DialogFormRegSucursalComponent } from './components/dialog-form-reg-sucursal/dialog-form-reg-sucursal.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-mnt-sucursales',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule,
    MatSortModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './mnt-sucursales.component.html',
  styleUrl: './mnt-sucursales.component.css'
})
export class MntSucursalesComponent implements OnInit {
  maestroSerivce = inject(MaestrosService);
  dialog = inject(MatDialog);
  router = inject(Router);
  displayedColumns: string[] = [
    'id',
    'description',
    'address',
    'code',
    'printerName',
    'status',
    'operaciones',
    'usuarios'
  ];
  dataSource = new MatTableDataSource<IBranchSalesResponseDto>([]);

  constructor() { }

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.maestroSerivce.obtenerSucursales().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response.data);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  crearSucursal() {
    const dialogRef = this.dialog.open(DialogFormRegSucursalComponent, {
      width: '400px',
      data: { esNuevo: true, objSucursal: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSucursales();
      }
    });
  }

  editSucursal(item: IBranchSalesResponseDto) {

    var objSucursal: IBranchSalesEditDto = {
      id: item.id,
      description: item.description,
      address: item.address,
      status: item.status,
      code: item.code,
      defaultPrinterId: item.defaultPrinterId
    };

    const dialogRef = this.dialog.open(DialogFormRegSucursalComponent, {
      width: '400px',
      data: { esNuevo: false, objSucursal: objSucursal }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSucursales();
      }
    });
  }

  verUsuariosSucursal(item: IBranchSalesResponseDto) {
    this.router.navigate(['/management/sucursales', item.id, 'usuarios']);
  }

  deleteSucursal(item: IBranchSalesResponseDto) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Sucursal', message: `¿Está seguro de eliminar la sucursal ${item.description}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.eliminarSucursal(item.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.cargarSucursales();
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
