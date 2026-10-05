import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { RolesService } from '../../../../services/roles.service';
import { IRole } from '../../../../../../core/interfaces/IRbac';

@Component({
  selector: 'app-dialog-role',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-role.component.html',
  styleUrl: './dialog-role.component.css'
})
export class DialogRoleComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; objRole: IRole | null }>(MAT_DIALOG_DATA);
  private rolesService = inject(RolesService);
  private notificationService = inject(NotificationsSystemService);

  form: FormGroup;
  loadingSave = false;
  titulo = this.data.esNuevo ? 'Nuevo Rol' : 'Editar Rol';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogRoleComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(250)],
      isActive: [true, Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.objRole) {
      this.form.patchValue(this.data.objRole);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.rolesService.crearRol({ name: this.form.value.name, description: this.form.value.description })
      : this.rolesService.actualizarRol(this.data.objRole!.id, this.form.value);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.dialogRef.close(resp.success);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(err?.message || 'No se pudo guardar el rol.');
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
