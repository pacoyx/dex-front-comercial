import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSort, MatSortModule } from '@angular/material/sort';

import { MatButtonModule } from '@angular/material/button';
import { MaestrosService } from '../../../services/maestros.service';
import { IUbicacionesEditDto, IUbicacionesResponseDto } from '../../../interfaces/IUbicaciones';
import { DialogFormRegUbicacionComponent } from './components/dialog-form-reg-ubicacion/dialog-form-reg-ubicacion.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogQuestionComponent } from '../../../components/dialog-question/dialog-question.component';


@Component({
  selector: 'app-mnt-ubicacion',
  standalone: true,
  imports: [
    MatIconModule, MatTableModule, MatInputModule, MatFormFieldModule,
    MatSortModule, MatButtonModule
  ],
  templateUrl: './mnt-ubicacion.component.html',
  styleUrl: './mnt-ubicacion.component.css'
})
export class MntUbicacionComponent implements OnInit {
  maestroSerivce = inject(MaestrosService);
  dialog = inject(MatDialog);
  displayedColumns: string[] = [
    'id',
    'name',
    'description',
    'operaciones'
  ];
  dataSource = new MatTableDataSource<IUbicacionesResponseDto>([]);

  constructor() { }

  ngOnInit(): void {
    this.cargarUbicaciones();
  }

  cargarUbicaciones(): void {
    this.maestroSerivce.obtenerUbicaciones().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource(response.data);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  crearUbicacion() {
    const dialogRef = this.dialog.open(DialogFormRegUbicacionComponent, {
      width: '400px',
      data: { esNuevo: true, objUbicacion: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUbicaciones();
      }
    });
  }

  editUbicacion(item: IUbicacionesResponseDto) {

    var objUbicacion: IUbicacionesEditDto = {
      id: item.id,
      nombre: item.name,
      descripcion: item.description
    };

    const dialogRef = this.dialog.open(DialogFormRegUbicacionComponent, {
      width: '400px',
      data: { esNuevo: false, objUbicacion: objUbicacion }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUbicaciones();
      }
    });
  }

  deleteUbicacion(item: IUbicacionesResponseDto) {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: { title: 'Eliminar Ubicacion', message: `¿Está seguro de eliminar el cliente ${item.name}?`, msgButton: 'Eliminar' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == 'OK') {
        this.maestroSerivce.eliminarUbicacion(item.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.cargarUbicaciones();
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
