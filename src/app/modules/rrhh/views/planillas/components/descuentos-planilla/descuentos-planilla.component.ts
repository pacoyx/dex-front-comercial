import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { PayrollService } from '../../../../services/payroll.service';
import { EmployeesService } from '../../../../services/employees.service';
import { IPayrollDiscount, IPayrollSummary } from '../../../../interfaces/IPayroll';
import { IEmployeeListItem } from '../../../../interfaces/IEmployees';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';
import { esAdHonorem } from '../../../../shared/employee-contract-type';

/**
 * Gestión de "Otros descuentos" de un periodo de planilla.
 * - Con `employeeId`: descuentos de un solo trabajador (se usa dentro del detalle de su planilla).
 * - Sin `employeeId`: todos los descuentos del periodo, con selector de trabajador (sirve antes de generar).
 * Cada alta/baja recalcula en el backend la planilla del trabajador si ya fue generada.
 */
@Component({
  selector: 'app-descuentos-planilla',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatTooltipModule, CurrencyPipe, DatePipe,
  ],
  templateUrl: './descuentos-planilla.component.html',
  styleUrl: './descuentos-planilla.component.css'
})
export class DescuentosPlanillaComponent implements OnInit {

  @Input({ required: true }) periodId!: number;
  @Input() periodoCerrado = false;
  @Input() employeeId: number | null = null;

  /** Se emite con la planilla recalculada del trabajador (solo si ya estaba generada). */
  @Output() planillaActualizada = new EventEmitter<IPayrollSummary>();
  /** Se emite ante cualquier alta o baja de descuento. */
  @Output() cambio = new EventEmitter<void>();

  private payrollService = inject(PayrollService);
  private employeesService = inject(EmployeesService);
  private notificationService = inject(NotificationsSystemService);
  private fb = inject(FormBuilder);

  descuentos: IPayrollDiscount[] = [];
  trabajadores: IEmployeeListItem[] = [];
  cargando = false;
  guardando = false;
  eliminandoId: number | null = null;
  validationErrors: string[] = [];

  form: FormGroup = this.fb.group({
    employeeId: [null as number | null, Validators.required],
    description: ['', [Validators.required, Validators.maxLength(200)]],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  get modoPeriodo(): boolean {
    return this.employeeId == null;
  }

  get total(): number {
    return this.descuentos.reduce((sum, d) => sum + d.amount, 0);
  }

  ngOnInit(): void {
    if (this.modoPeriodo) {
      this.employeesService.listarTrabajadores({ onlyActive: true, pageNumber: 1, pageSize: 1000 }).subscribe({
        // Los ad honorem no tienen planilla: no se les registran descuentos.
        next: (resp) => this.trabajadores = resp.data.employees.filter(t => !esAdHonorem(t.contractType)),
        error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los trabajadores.'))
      });
    } else {
      this.form.patchValue({ employeeId: this.employeeId });
    }

    if (this.periodoCerrado) {
      this.form.disable();
    }

    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.payrollService.listarDescuentos(this.periodId, this.employeeId ?? undefined).subscribe({
      next: (resp) => {
        this.cargando = false;
        this.descuentos = resp.data;
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los descuentos.'));
      }
    });
  }

  agregar(): void {
    if (this.form.invalid || this.guardando || this.periodoCerrado) {
      this.form.markAllAsTouched();
      return;
    }
    this.validationErrors = [];
    this.guardando = true;
    const value = this.form.getRawValue();

    this.payrollService.agregarDescuento(this.periodId, {
      employeeId: value.employeeId,
      description: (value.description as string).trim(),
      amount: Number(value.amount),
    }).subscribe({
      next: (resp) => {
        this.guardando = false;
        this.form.patchValue({ description: '', amount: null });
        this.form.get('description')!.markAsUntouched();
        this.form.get('amount')!.markAsUntouched();
        this.notificationService.showSuccess(resp.data.payroll
          ? 'Descuento registrado y planilla recalculada.'
          : 'Descuento registrado. Se aplicará al generar la planilla del trabajador.');
        if (resp.data.payroll) this.planillaActualizada.emit(resp.data.payroll);
        this.cambio.emit();
        this.cargar();
      },
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar el descuento.'));
        }
      }
    });
  }

  eliminar(descuento: IPayrollDiscount): void {
    if (this.periodoCerrado) return;
    if (!confirm(`¿Eliminar el descuento "${descuento.description}" de ${descuento.employeeName}?`)) return;

    this.eliminandoId = descuento.id;
    this.payrollService.eliminarDescuento(this.periodId, descuento.id).subscribe({
      next: (resp) => {
        this.eliminandoId = null;
        this.notificationService.showSuccess(resp.data.payroll
          ? 'Descuento eliminado y planilla recalculada.'
          : 'Descuento eliminado.');
        if (resp.data.payroll) this.planillaActualizada.emit(resp.data.payroll);
        this.cambio.emit();
        this.cargar();
      },
      error: (err) => {
        this.eliminandoId = null;
        const validation = extractValidationErrors(err);
        this.notificationService.showError(validation[0] ?? extractErrorMessage(err, 'No se pudo eliminar el descuento.'));
      }
    });
  }

}
