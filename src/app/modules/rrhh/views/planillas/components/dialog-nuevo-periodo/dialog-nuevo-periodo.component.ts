import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { PayrollService } from '../../../../services/payroll.service';
import { PayrollFrequency } from '../../../../interfaces/IShared';
import { PAYROLL_FREQUENCY_OPTIONS } from '../../../../shared/payroll-frequency';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

function toDateOnly(value: Date | null): string {
  if (!value) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-dialog-nuevo-periodo',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule, MatDatepickerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dialog-nuevo-periodo.component.html',
  styleUrl: './dialog-nuevo-periodo.component.css'
})
export class DialogNuevoPeriodoComponent {

  private payrollService = inject(PayrollService);
  private notificationService = inject(NotificationsSystemService);

  loadingSave = false;
  validationErrors: string[] = [];
  frequencyOptions = PAYROLL_FREQUENCY_OPTIONS;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogNuevoPeriodoComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      frequency: [PayrollFrequency.Monthly, Validators.required],
      startDate: [null as Date | null, Validators.required],
      endDate: [null as Date | null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    this.payrollService.crearPeriodo({
      name: value.name,
      frequency: value.frequency,
      startDate: toDateOnly(value.startDate),
      endDate: toDateOnly(value.endDate),
    }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Periodo de planilla creado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo crear el periodo de planilla.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
