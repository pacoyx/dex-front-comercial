import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { TableListadoMntUserComponent } from './Components/table-listado-mnt-user/table-listado-mnt-user.component';

import { ManagentSystemService } from '../../services/managent-system.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { IGetUserResponse } from '../../interfaces/IUsers';
import { DialogAddUserComponent } from './Components/dialog-add-user/dialog-add-user.component';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';

@Component({
  selector: 'app-managent-users',
  standalone: true,
  imports: [
    RouterModule, MatIconModule, TableListadoMntUserComponent,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatSortModule, LoadingComponent
  ],
  templateUrl: './managent-users.component.html',
  styleUrl: './managent-users.component.css'
})
export class ManagentUsersComponent implements OnInit, OnDestroy {

  maestroSerivce = inject(ManagentSystemService);
  listaUsuarios: IGetUserResponse[] = [];
  bolFiltro = false;
  totalClientes = 0;
  pageSize = 10;
  dialog = inject(MatDialog);
  filterControl = new FormControl();
  dataSubscription!: Subscription;
  loading = false;

  ngOnInit(): void {
    this.cargarUsuarios(true);
  }
  ngOnDestroy(): void {
    if (this.dataSubscription) this.dataSubscription.unsubscribe();
  }

  cargarUsuarios(evento: boolean): void {
    if (evento) {
      this.loading = true;
      this.dataSubscription = this.maestroSerivce.listarUsuarios().subscribe({
        next: (resp) => {
          this.listaUsuarios = resp.data;
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
        }
      });
    }
  }

  limpiaFiltro() {
    this.cargarUsuarios(true);
  }

  newUser() {

    const dialogRef = this.dialog.open(DialogAddUserComponent, {
      width: '500px',
      data: { esNuevo: true, objUsuario: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarUsuarios(true);
      }
    });

  }
}
