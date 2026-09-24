import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../../../../services/employees.service';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

function toDateOnly(value: Date | null): string {
  if (!value) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-dialog-terminar-trabajador',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatDatepickerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dialog-terminar-trabajador.component.html',
  styleUrl: './dialog-terminar-trabajador.component.css'
})
export class DialogTerminarTrabajadorComponent {

  readonly data = inject<{ employeeId: number, employeeName: string }>(MAT_DIALOG_DATA);
  private employeesService = inject(EmployeesService);
  private notificationService = inject(NotificationsSystemService);

  loadingSave = false;
  validationErrors: string[] = [];

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogTerminarTrabajadorComponent>,
  ) {
    this.form = this.fb.group({
      terminationDate: [new Date(), Validators.required],
      observation: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    this.employeesService.darDeBaja(this.data.employeeId, {
      terminationDate: toDateOnly(value.terminationDate),
      observation: value.observation || null,
    }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Trabajador dado de baja correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo dar de baja al trabajador.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
