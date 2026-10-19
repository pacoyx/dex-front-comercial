import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { BankCatalogsService } from '../../../../services/bank-catalogs.service';
import { IBank } from '../../../../interfaces/IBanks';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-banco',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dialog-form-banco.component.html',
  styleUrl: './dialog-form-banco.component.css'
})
export class DialogFormBancoComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, obj: IBank | null }>(MAT_DIALOG_DATA);
  private bankCatalogsService = inject(BankCatalogsService);
  private notificationService = inject(NotificationsSystemService);

  form: FormGroup;
  loadingSave = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? 'Registrar Banco' : 'Actualizar Banco';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormBancoComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      shortName: ['', Validators.maxLength(20)],
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

    this.validationErrors = [];
    this.loadingSave = true;
    const formValue = this.form.value;

    const request$ = this.data.esNuevo
      ? this.bankCatalogsService.crearBanco({ name: formValue.name, shortName: formValue.shortName || null })
      : this.bankCatalogsService.actualizarBanco(this.data.obj!.id, { name: formValue.name, shortName: formValue.shortName || null, isActive: formValue.isActive });

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(
          this.data.esNuevo ? 'Banco registrado correctamente.' : 'Banco actualizado correctamente.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el banco.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
