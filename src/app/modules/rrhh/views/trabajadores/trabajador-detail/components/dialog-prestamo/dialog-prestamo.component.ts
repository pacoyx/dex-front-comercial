import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
import { ILoan, ILoanCreateRequest } from '../../../../../interfaces/ILoans';
import { IResponseGeneric } from '../../../../../interfaces/IShared';
import { LOAN_TYPE_OPTIONS } from '../../../../../shared/loan-type';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

const MAX_CUOTAS = 48;

@Component({
  selector: 'app-dialog-prestamo',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule, MatDatepickerModule,
    DecimalPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dialog-prestamo.component.html',
  styleUrl: './dialog-prestamo.component.css'
})
export class DialogPrestamoComponent {

  /** Con `loan` el diálogo abre en modo edición (solo préstamos/adelantos sin cuotas cobradas). */
  readonly data = inject<{ employeeId: number; loan?: ILoan }>(MAT_DIALOG_DATA);
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
      installmentCount: [1, [Validators.required, Validators.min(1), Validators.max(MAX_CUOTAS)]],
      observation: [''],
    });

    // Los adelantos de sueldo se descuentan completos en una sola planilla.
    this.form.get('loanType')!.valueChanges.subscribe((tipo) => {
      const cuotas = this.form.get('installmentCount')!;
      if (tipo === LoanType.SalaryAdvance) {
        cuotas.setValue(1);
        cuotas.disable();
      } else {
        cuotas.enable();
      }
    });

    // Modo edición: se precarga el préstamo; el tipo no se puede cambiar.
    const loan = this.data.loan;
    if (loan) {
      this.form.patchValue({
        loanType: loan.loanType,
        loanDate: this.fechaLocal(loan.loanDate),
        amount: loan.amount,
        installmentCount: loan.installmentCount,
        observation: loan.observation ?? '',
      });
      this.form.get('loanType')!.disable();
    }
  }

  /**
   * La fecha llega del backend sin zona horaria ("2026-11-16T05:00:00"); `new Date()` la tomaría como hora local
   * y cada edición la desplazaría. Se construye la fecha local solo con la parte de fecha.
   */
  private fechaLocal(valor: string): Date {
    const [y, m, d] = valor.substring(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  /**
   * Envía solo la fecha local ("yyyy-MM-dd"). Con `toISOString()` un registro hecho de noche
   * (después de las 19:00 en Perú, UTC-5) se convertía al día siguiente en UTC.
   */
  private fechaIso(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get esEdicion(): boolean {
    return !!this.data.loan;
  }

  readonly maxCuotas = MAX_CUOTAS;

  get esPrestamo(): boolean {
    return this.form.get('loanType')!.value === LoanType.Loan;
  }

  /** Vista previa de las cuotas: iguales a 2 decimales; la última absorbe el redondeo (misma regla que el backend). */
  get cronograma(): number[] {
    const amount = Number(this.form.get('amount')!.value) || 0;
    const n = Math.floor(Number(this.form.get('installmentCount')!.value) || 0);
    if (amount <= 0 || n < 1 || n > MAX_CUOTAS) return [];
    const regular = Math.round((amount / n) * 100) / 100;
    const ultima = Math.round((amount - regular * (n - 1)) * 100) / 100;
    return Array.from({ length: n }, (_, i) => (i < n - 1 ? regular : ultima));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.getRawValue();
    const req: ILoanCreateRequest = {
      loanDate: this.fechaIso(value.loanDate as Date),
      amount: value.amount,
      observation: value.observation || null,
      installmentCount: value.loanType === LoanType.SalaryAdvance ? 1 : Number(value.installmentCount),
    };

    const request$: Observable<IResponseGeneric<ILoan>> = this.data.loan
      ? this.loansService.editarPrestamo(this.data.loan.id, req)
      : value.loanType === LoanType.SalaryAdvance
        ? this.loansService.crearAdelanto(this.data.employeeId, req)
        : this.loansService.crearPrestamo(this.data.employeeId, req);

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.esEdicion ? 'Actualizado correctamente.' : 'Registrado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, this.esEdicion ? 'No se pudo actualizar.' : 'No se pudo registrar.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
