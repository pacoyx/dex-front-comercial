import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../recepcion/components/dialog-question/dialog-question.component';
import { RolesService } from '../../services/roles.service';
import { IRole } from '../../../../core/interfaces/IRbac';
import { DialogRoleComponent } from './components/dialog-role/dialog-role.component';
import { DialogRolePermissionsComponent } from './components/dialog-role-permissions/dialog-role-permissions.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatTableModule, MatTooltipModule, LoadingComponent, DatePipe],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {

  private rolesService = inject(RolesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  roles: IRole[] = [];
  loading = false;

  displayedColumns: string[] = ['name', 'description', 'status', 'createdAt', 'operaciones'];

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.loading = true;
    this.rolesService.listarRoles().subscribe({
      next: (resp) => {
        this.roles = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(err?.message || 'No se pudieron cargar los roles.');
      },
    });
  }

  nuevoRol(): void {
    const dialogRef = this.dialog.open(DialogRoleComponent, {
      data: { esNuevo: true, objRole: null },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarRoles();
      }
    });
  }

  editarRol(role: IRole): void {
    const dialogRef = this.dialog.open(DialogRoleComponent, {
      data: { esNuevo: false, objRole: role },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarRoles();
      }
    });
  }

  gestionarPermisos(role: IRole): void {
    this.dialog.open(DialogRolePermissionsComponent, {
      width: '480px',
      data: { roleId: role.id, roleName: role.name },
    });
  }

  eliminarRol(role: IRole): void {
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Eliminar Rol',
        message: `¿Está seguro de eliminar el rol "${role.name}"? Los usuarios que lo tengan asignado perderán sus permisos la próxima vez que inicien sesión o se refresque su token.`,
        msgButton: 'Eliminar',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.rolesService.eliminarRol(role.id).subscribe({
          next: (resp) => {
            if (resp.success) {
              this.notificationService.showSuccess('Rol eliminado.');
              this.cargarRoles();
            }
          },
          error: (err) => {
            this.notificationService.showError(err?.message || 'No se pudo eliminar el rol.');
          },
        });
      }
    });
  }

}
