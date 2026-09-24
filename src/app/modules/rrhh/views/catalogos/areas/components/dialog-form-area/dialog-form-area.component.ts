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
import { IArea } from '../../../../../interfaces/ICatalogos';
import { extractErrorMessage } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-area',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dialog-form-area.component.html',
  styleUrl: './dialog-form-area.component.css'
})
export class DialogFormAreaComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, obj: IArea | null }>(MAT_DIALOG_DATA);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);

  form: FormGroup;
  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Área' : 'Actualizar Área';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormAreaComponent>,
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
      ? this.catalogosService.crearArea({ name: formValue.name })
      : this.catalogosService.actualizarArea(this.data.obj!.id, { name: formValue.name, isActive: formValue.isActive });

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(
          this.data.esNuevo ? 'Área registrada correctamente.' : 'Área actualizada correctamente.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el área.'));
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
