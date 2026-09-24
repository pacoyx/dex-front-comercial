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
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogNuevoPeriodoComponent } from './components/dialog-nuevo-periodo/dialog-nuevo-periodo.component';

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
          `Planilla generada: ${resp.data.generatedCount} trabajador(es) procesados, ${resp.data.skippedCount} omitidos.`
        );
        this.verDetalle(periodo);
      },
      error: (err) => {
        this.generandoId = null;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar la planilla.'));
      }
    });
  }

  verDetalle(periodo: IPayrollPeriod): void {
    this.router.navigate(['/rrhh/planillas', periodo.id]);
  }

}
