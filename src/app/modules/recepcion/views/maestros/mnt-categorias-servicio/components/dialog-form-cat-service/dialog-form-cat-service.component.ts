import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../../../../services/notification-service.service';
import { MaestrosService } from '../../../../../services/maestros.service';
import { ICatService } from '../../../../../interfaces/ICatService';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-cat-service',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-form-cat-service.component.html',
  styleUrl: './dialog-form-cat-service.component.css'
})
export class DialogFormCatServiceComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; categoria: ICatService | null }>(MAT_DIALOG_DATA);
  private maestrosService = inject(MaestrosService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? 'Nueva Categoría de Servicio' : 'Editar Categoría de Servicio';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormCatServiceComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      icon: [''],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.categoria) {
      this.form.patchValue(this.data.categoria);
    }
  }

  onSubmit(): void {
    if (this.loadingSave) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificationService.showError('El nombre de la categoría es obligatorio.');
      return;
    }

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;

    const request$ = this.data.esNuevo
      ? this.maestrosService.crearCategoriaServicio({ name: value.name, description: value.description ?? '', icon: value.icon ?? '' })
      : this.maestrosService.actualizarCategoriaServicio({ id: this.data.categoria!.id, name: value.name, description: value.description ?? '', icon: value.icon ?? '' });

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.data.esNuevo ? 'Categoría creada correctamente.' : 'Categoría actualizada correctamente.');
        this.dialogRef.close(resp.data);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar la categoría de servicio.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
