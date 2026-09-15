import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MaestrosService } from '../../../services/maestros.service';
import { IBranchSalesUserEditDto, IBranchSalesUserResponseDto } from '../../../interfaces/IBranchSales';
import { DialogFormSucursalUsuarioComponent } from './components/dialog-form-sucursal-usuario/dialog-form-sucursal-usuario.component';
import { DialogQuestionComponent } from '../../../components/dialog-question/dialog-question.component';

@Component({
  selector: 'app-mnt-sucursal-usuarios',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatSortModule, MatButtonModule
  ],
  templateUrl: './mnt-sucursal-usuarios.component.html',
  styleUrl: './mnt-sucursal-usuarios.component.css'
})
export class MntSucursalUsuariosComponent implements OnInit {
  maestroSerivce = inject(MaestrosService);
  dialog = inject(MatDialog);
  route = inject(ActivatedRoute);
  router = inject(Router);

  branchId = 0;
  displayedColumns: string[] = [
    'id',
    'userName',
    'status',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IBranchSalesUserResponseDto>([]);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const branchId = parseInt(params['branchId']);
      if (branchId > 0) {
        this.branchId = branchId;
        this.cargarSucursalUsuarios();
      }
    });
  }

  cargarSucursalUsuarios(): void {
    this.maestroSerivce.obtenerSucursalUsuariosPorSucursal(this.branchId).subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response.data);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  crearSucursalUsuario() {
    const dialogRef = this.dialog.open(DialogFormSucursalUsuarioComponent, {
      width: '400px',
      data: { esNuevo: true, branchId: this.branchId, objSucursalUsuario: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSucursalUsuarios();
      }
    });
  }

  editSucursalUsuario(item: IBranchSalesUserResponseDto) {
    const objSucursalUsuario: IBranchSalesUserEditDto = {
      id: item.id,
      branchSalesId: item.branchSalesId,
      userId: item.userId,
      status: item.status
    };

    const dialogRef = this.dialog.open(DialogFormSucursalUsuarioComponent, {
      width: '400px',
      data: { esNuevo: false, branchId: this.branchId, objSucursalUsuario: objSucursalUsuario }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarSucursalUsuarios();
      }
    });
  }

  deleteSucursalUsuario(item: IBranchSalesUserResponseDto) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Usuario de Sucursal', message: `¿Está seguro de eliminar a ${item.userName} de esta sucursal?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.eliminarSucursalUsuario(item.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.cargarSucursalUsuarios();
            }
          },
          error: (err) => {
            console.log(err);
          }
        });
      }
    });
  }

  regresarSucursales() {
    this.router.navigate(['/recepcion/sucursales']);
  }
}
