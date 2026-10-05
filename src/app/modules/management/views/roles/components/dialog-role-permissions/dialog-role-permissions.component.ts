import { Component, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { RolesService } from '../../../../services/roles.service';
import { IPermission } from '../../../../../../core/interfaces/IRbac';
import { getPermissionModuleLabel } from '../../../../shared/permission-groups';

interface IPermissionItem {
  permission: IPermission;
  checked: boolean;
}

@Component({
  selector: 'app-dialog-role-permissions',
  standalone: true,
  imports: [
    MatCheckboxModule, MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-role-permissions.component.html',
  styleUrl: './dialog-role-permissions.component.css'
})
export class DialogRolePermissionsComponent implements OnInit {

  readonly data = inject<{ roleId: number; roleName: string }>(MAT_DIALOG_DATA);
  private rolesService = inject(RolesService);
  private notificationService = inject(NotificationsSystemService);
  private dialogRef = inject(MatDialogRef<DialogRolePermissionsComponent>);

  items: IPermissionItem[] = [];
  loading = false;
  loadingSave = false;

  getPermissionModuleLabel = getPermissionModuleLabel;

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      todos: this.rolesService.listarPermisos(),
      delRol: this.rolesService.obtenerPermisosDeRol(this.data.roleId),
    }).subscribe({
      next: ({ todos, delRol }) => {
        const asignadosIds = new Set(delRol.data.permissions.map(p => p.id));
        this.items = todos.data
          .map(permission => ({ permission, checked: asignadosIds.has(permission.id) }))
          .sort((a, b) => getPermissionModuleLabel(a.permission.code).localeCompare(getPermissionModuleLabel(b.permission.code)));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(err?.message || 'No se pudieron cargar los permisos.');
      },
    });
  }

  onCheckChange(item: IPermissionItem, event: MatCheckboxChange): void {
    item.checked = event.checked;
  }

  guardar(): void {
    const permissionIds = this.items.filter(i => i.checked).map(i => i.permission.id);
    this.loadingSave = true;
    this.rolesService.actualizarPermisosDeRol(this.data.roleId, { permissionIds }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Permisos del rol actualizados.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(err?.message || 'No se pudieron guardar los permisos.');
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
