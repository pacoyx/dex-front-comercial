import { Component, inject, input, output } from '@angular/core';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddUserComponent } from '../dialog-add-user/dialog-add-user.component';
import { IGetUserResponse } from '../../../../interfaces/IUsers';
import { DialogQuestionComponent } from '../../../../../recepcion/components/dialog-question/dialog-question.component';
import { ManagentSystemService } from '../../../../services/managent-system.service';


@Component({
  selector: 'app-table-listado-mnt-user',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './table-listado-mnt-user.component.html',
  styleUrl: './table-listado-mnt-user.component.css'
})
export class TableListadoMntUserComponent {
  managementSerivce = inject(ManagentSystemService);
  dialog = inject(MatDialog);
  dataUser = input<IGetUserResponse[]>([]);
  reLoadUser = output<boolean>()


  displayedColumns: string[] = [
    'id',
    'name',
    'userName',
    'email',
    'role',
    'status',
    'operaciones'
  ];


  editUser(user: IGetUserResponse) {
      const dialogRef = this.dialog.open(DialogAddUserComponent, {
        width: '400px',
        data: { esNuevo: false, objUsuario: user }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
          this.reLoadUser.emit(true);
        }
      });
    }

  eliminarUser(user: IGetUserResponse) {
      const dialogRef = this.dialog.open(DialogQuestionComponent, {
        width: '400px',
        data: { title: 'Eliminar Usuario', message: `¿Está seguro de eliminar el usuario ${user.name}`, msgButton: 'Eliminar' }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result == 'OK') {
          this.managementSerivce.eliminarUsuario(user.id).subscribe({
            next: (resp) => {
              if (resp.success) {
                // this.cargarClientes(this.paginator.pageIndex + 1, this.paginator.pageSize);
                this.reLoadUser.emit(true);
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
