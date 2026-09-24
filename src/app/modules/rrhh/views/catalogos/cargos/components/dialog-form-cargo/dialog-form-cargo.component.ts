import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { CatalogosService } from '../../../../../services/catalogos.service';
import { IPosition } from '../../../../../interfaces/ICatalogos';
import { extractErrorMessage } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-cargo',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dialog-form-cargo.component.html',
  styleUrl: './dialog-form-cargo.component.css'
})
export class DialogFormCargoComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, obj: IPosition | null }>(MAT_DIALOG_DATA);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);

  form: FormGroup;
  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Cargo' : 'Actualizar Cargo';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormCargoComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      isActive: [true, Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.obj) {
      this.form.patchValue(this.data.obj);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loadingSave = true;
    const formValue = this.form.value;

    const request$ = this.data.esNuevo
      ? this.catalogosService.crearCargo({ name: formValue.name })
      : this.catalogosService.actualizarCargo(this.data.obj!.id, { name: formValue.name, isActive: formValue.isActive });

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(
          this.data.esNuevo ? 'Cargo registrado correctamente.' : 'Cargo actualizado correctamente.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el cargo.'));
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
