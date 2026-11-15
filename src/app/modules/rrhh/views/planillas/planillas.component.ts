import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { PayrollService } from '../../services/payroll.service';
import { IPayrollPeriod } from '../../interfaces/IPayroll';
import { PayrollFrequencyLabelPipe } from '../../shared/payroll-frequency';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';
import { mensajePlanillaGenerada } from '../../shared/payroll-generation-message';
import { DialogNuevoPeriodoComponent } from './components/dialog-nuevo-periodo/dialog-nuevo-periodo.component';
import { DialogEliminarPeriodoComponent } from './components/dialog-eliminar-periodo/dialog-eliminar-periodo.component';

@Component({
  selector: 'app-planillas',
  standalone: true,
  imports: [
    RouterModule, MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatTooltipModule,
    DatePipe, PayrollFrequencyLabelPipe,
  ],
  templateUrl: './planillas.component.html',
  styleUrl: './planillas.component.css'
})
export class PlanillasComponent implements OnInit {

  private payrollService = inject(PayrollService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  displayedColumns = ['name', 'frequency', 'inicio', 'fin', 'acciones'];
  dataSource = new MatTableDataSource<IPayrollPeriod>([]);
  generandoId: number | null = null;
  eliminandoId: number | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.payrollService.listarPeriodos().subscribe({
      next: (resp) => this.dataSource.data = resp.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los periodos de planilla.'))
    });
  }

  nuevoPeriodo(): void {
    const dialogRef = this.dialog.open(DialogNuevoPeriodoComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargar();
    });
  }

  generar(periodo: IPayrollPeriod): void {
    if (!confirm(`¿Generar la planilla del periodo "${periodo.name}"? Se procesarán los trabajadores que aún no tengan planilla generada.`)) {
      return;
    }
    this.generandoId = periodo.id;
    this.payrollService.generarPlanilla(periodo.id).subscribe({
      next: (resp) => {
        this.generandoId = null;
        this.notificationService.showSuccess(
          mensajePlanillaGenerada(resp.data)
        );
        this.verDetalle(periodo);
      },
      error: (err) => {
        this.generandoId = null;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar la planilla.'));
      }
    });
  }

  /** Elimina solo las planillas generadas (para regenerar). Conserva el periodo y sus descuentos. */
  eliminarPlanilla(periodo: IPayrollPeriod): void {
    if (periodo.isClosed) {
      this.notificationService.showError('No se puede eliminar la planilla de un periodo cerrado.');
      return;
    }
    if (!confirm(`¿Eliminar la planilla generada del periodo "${periodo.name}"?\n\nSe borrarán las planillas de todos los trabajadores y las cuotas de préstamos descontadas volverán a quedar pendientes. El periodo y sus descuentos se conservan, para que puedas volver a generarla.`)) {
      return;
    }
    this.eliminandoId = periodo.id;
    this.payrollService.eliminarPlanilla(periodo.id).subscribe({
      next: (resp) => {
        this.eliminandoId = null;
        const d = resp.data;
        const detalleCuotas = d?.revertedInstallments
          ? ` Se revirtieron ${d.revertedInstallments} cuota(s) de préstamos/adelantos, que se descontarán en la próxima planilla.`
          : '';
        this.notificationService.showSuccess(`Planilla del periodo "${periodo.name}" eliminada correctamente.${detalleCuotas}`);
        this.cargar();
      },
      error: (err) => {
        this.eliminandoId = null;
        const validation = extractValidationErrors(err);
        this.notificationService.showError(validation[0] ?? extractErrorMessage(err, 'No se pudo eliminar la planilla.'));
      }
    });
  }

  /** Elimina el periodo completo: planillas, descuentos y el periodo. Pide escribir el nombre para confirmar. */
  eliminarPeriodo(periodo: IPayrollPeriod): void {
    if (periodo.isClosed) {
      this.notificationService.showError('No se puede eliminar un periodo cerrado.');
      return;
    }
    const dialogRef = this.dialog.open(DialogEliminarPeriodoComponent, {
      maxWidth: '95vw',
      data: { periodName: periodo.name }
    });
    dialogRef.afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;
      this.eliminandoId = periodo.id;
      this.payrollService.eliminarPeriodo(periodo.id).subscribe({
        next: (resp) => {
          this.eliminandoId = null;
          const d = resp.data;
          const partes = [`${d.deletedPayrolls} planilla(s)`, `${d.deletedDiscounts} descuento(s)`];
          if (d.revertedInstallments) partes.push(`${d.revertedInstallments} cuota(s) revertidas`);
          this.notificationService.showSuccess(`Periodo "${periodo.name}" eliminado (${partes.join(', ')}).`);
          this.cargar();
        },
        error: (err) => {
          this.eliminandoId = null;
          const validation = extractValidationErrors(err);
          this.notificationService.showError(validation[0] ?? extractErrorMessage(err, 'No se pudo eliminar el periodo.'));
        }
      });
    });
  }

  verDetalle(periodo: IPayrollPeriod): void {
    this.router.navigate(['/rrhh/planillas', periodo.id]);
  }

}
