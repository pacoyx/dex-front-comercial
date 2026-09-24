import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable } from 'rxjs';
import { CustomDateAdapter } from '../../../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { LoansService } from '../../../../../services/loans.service';
import { LoanType } from '../../../../../interfaces/IShared';
import { ILoan } from '../../../../../interfaces/ILoans';
import { IResponseGeneric } from '../../../../../interfaces/IShared';
import { LOAN_TYPE_OPTIONS } from '../../../../../shared/loan-type';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-prestamo',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule, MatDatepickerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dialog-prestamo.component.html',
  styleUrl: './dialog-prestamo.component.css'
})
export class DialogPrestamoComponent {

  readonly data = inject<{ employeeId: number }>(MAT_DIALOG_DATA);
  private loansService = inject(LoansService);
  private notificationService = inject(NotificationsSystemService);

  loadingSave = false;
  validationErrors: string[] = [];
  tipoOptions = LOAN_TYPE_OPTIONS;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogPrestamoComponent>,
  ) {
    this.form = this.fb.group({
      loanType: [LoanType.Loan, Validators.required],
      loanDate: [new Date(), Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      observation: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    const req = {
      loanDate: (value.loanDate as Date).toISOString(),
      amount: value.amount,
      observation: value.observation || null,
    };

    const request$: Observable<IResponseGeneric<ILoan>> = value.loanType === LoanType.SalaryAdvance
      ? this.loansService.crearAdelanto(this.data.employeeId, req)
      : this.loansService.crearPrestamo(this.data.employeeId, req);

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Registrado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
