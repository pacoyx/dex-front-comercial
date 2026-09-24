import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HrDashboardService } from '../../services/hr-dashboard.service';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { IEmployeesByArea, IHrDashboardSummary, IPendingLoanItem, IUpcomingBirthday } from '../../interfaces/IHrDashboard';
import { LoanTypeLabelPipe } from '../../shared/loan-type';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-dashboard-rrhh',
  standalone: true,
  imports: [
    RouterModule, MatCardModule, MatIconModule, MatButtonModule, CurrencyPipe, DatePipe, LoanTypeLabelPipe,
  ],
  templateUrl: './dashboard-rrhh.component.html',
  styleUrl: './dashboard-rrhh.component.css'
})
export class DashboardRrhhComponent implements OnInit {

  private dashboardService = inject(HrDashboardService);
  private notificationService = inject(NotificationsSystemService);

  summary: IHrDashboardSummary | null = null;
  employeesByArea: IEmployeesByArea[] = [];
  pendingLoans: IPendingLoanItem[] = [];
  upcomingBirthdays: IUpcomingBirthday[] = [];

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (r) => this.summary = r.data,
      error: (err) => this.notify('el resumen del dashboard', err),
    });

    this.dashboardService.obtenerTrabajadoresPorArea().subscribe({
      next: (r) => this.employeesByArea = r.data,
      error: (err) => this.notify('los trabajadores por área', err),
    });

    this.dashboardService.obtenerPrestamosPendientes().subscribe({
      next: (r) => this.pendingLoans = r.data,
      error: (err) => this.notify('los préstamos pendientes', err),
    });

    this.dashboardService.obtenerProximosCumpleanos(30).subscribe({
      next: (r) => this.upcomingBirthdays = r.data,
      error: (err) => this.notify('los próximos cumpleaños', err),
    });
  }

  private notify(label: string, err: unknown): void {
    this.notificationService.showError(extractErrorMessage(err, `No se pudo cargar ${label}.`));
  }

  get maxAreaCount(): number {
    return Math.max(1, ...this.employeesByArea.map(a => a.employeeCount));
  }

}
