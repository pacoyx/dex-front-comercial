import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { PayrollService } from '../../../services/payroll.service';
import { IPayrollPeriod, IPayrollSummary } from '../../../interfaces/IPayroll';
import { PayrollFrequencyLabelPipe } from '../../../shared/payroll-frequency';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { mensajePlanillaGenerada } from '../../../shared/payroll-generation-message';
import { DialogDetallePlanillaEmpleadoComponent } from './components/dialog-detalle-planilla-empleado/dialog-detalle-planilla-empleado.component';
import { DialogDescuentosPeriodoComponent } from './components/dialog-descuentos-periodo/dialog-descuentos-periodo.component';
import { descargarArchivo } from '../../../../gastos/shared/file-download.util';

@Component({
  selector: 'app-planilla-detail',
  standalone: true,
  imports: [
    RouterModule, MatButtonModule, MatCardModule, MatIconModule, MatTableModule,
    CurrencyPipe, DatePipe, PayrollFrequencyLabelPipe,
  ],
  templateUrl: './planilla-detail.component.html',
  styleUrl: './planilla-detail.component.css'
})
export class PlanillaDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private payrollService = inject(PayrollService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  periodId = 0;
  periodo: IPayrollPeriod | null = null;
  generando = false;
  exportando: 'excel' | 'pdf' | null = null;

  displayedColumns = ['trabajador', 'bruto', 'descuentos', 'neto', 'generado', 'acciones'];
  dataSource = new MatTableDataSource<IPayrollSummary>([]);
  totalNeto = 0;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.periodId = Number(params['id']);
        this.cargarPeriodo();
        this.cargarPlanilla();
      }
    });
  }

  cargarPeriodo(): void {
    this.payrollService.listarPeriodos().subscribe({
      next: (resp) => this.periodo = resp.data.find(p => p.id === this.periodId) ?? null,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el periodo.'))
    });
  }

  cargarPlanilla(): void {
    this.payrollService.obtenerPlanilla(this.periodId).subscribe({
      next: (resp) => {
        this.dataSource.data = resp.data;
        this.totalNeto = resp.data.reduce((sum, p) => sum + p.netAmount, 0);
      },
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener la planilla del periodo.'))
    });
  }

  generar(): void {
    if (!confirm('¿Generar la planilla de este periodo? Se procesarán los trabajadores pendientes.')) return;
    this.generando = true;
    this.payrollService.generarPlanilla(this.periodId).subscribe({
      next: (resp) => {
        this.generando = false;
        this.notificationService.showSuccess(
          mensajePlanillaGenerada(resp.data)
        );
        this.cargarPlanilla();
      },
      error: (err) => {
        this.generando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar la planilla.'));
      }
    });
  }

  verDetalle(payroll: IPayrollSummary): void {
    const dialogRef = this.dialog.open(DialogDetallePlanillaEmpleadoComponent, {
      maxWidth: '95vw',
      data: { payroll, periodId: this.periodId, periodoCerrado: this.periodo?.isClosed ?? false }
    });
    dialogRef.afterClosed().subscribe((huboCambios) => {
      if (huboCambios) this.cargarPlanilla();
    });
  }

  descuentos(): void {
    const dialogRef = this.dialog.open(DialogDescuentosPeriodoComponent, {
      maxWidth: '95vw',
      data: { periodId: this.periodId, periodName: this.periodo?.name ?? '', periodoCerrado: this.periodo?.isClosed ?? false }
    });
    dialogRef.afterClosed().subscribe((huboCambios) => {
      if (huboCambios) this.cargarPlanilla();
    });
  }

  exportar(formato: 'excel' | 'pdf'): void {
    if (this.exportando) return;
    this.exportando = formato;
    const request$ = formato === 'excel'
      ? this.payrollService.exportarPlanillaExcel(this.periodId)
      : this.payrollService.exportarPlanillaPdf(this.periodId);
    const nombre = `Planilla_${(this.periodo?.name ?? this.periodId).toString().replace(/\s+/g, '_')}.${formato === 'excel' ? 'xlsx' : 'pdf'}`;

    request$.subscribe({
      next: (resp) => {
        this.exportando = null;
        descargarArchivo(resp, nombre);
      },
      error: (err) => {
        this.exportando = null;
        this.notificationService.showError(extractErrorMessage(err, `No se pudo exportar la planilla a ${formato === 'excel' ? 'Excel' : 'PDF'}.`));
      }
    });
  }

  volver(): void {
    this.router.navigate(['/rrhh/planillas']);
  }

}
