import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { ExpenseDashboardService } from '../../services/expense-dashboard.service';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import {
  IExpenseByBranch,
  IExpenseByCategory,
  IExpenseDashboardSummary,
  IExpenseMonthlyTrend,
  IExpenseRecentOrTop,
} from '../../interfaces/IExpenseDashboard';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-dashboard-gastos',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatButtonModule, RouterModule,
    CurrencyPipe, DatePipe,
  ],
  templateUrl: './dashboard-gastos.component.html',
  styleUrl: './dashboard-gastos.component.css'
})
export class DashboardGastosComponent implements OnInit {

  private dashboardService = inject(ExpenseDashboardService);
  private notificationService = inject(NotificationsSystemService);
  private router = inject(Router);

  summary: IExpenseDashboardSummary | null = null;
  monthlyTrend: IExpenseMonthlyTrend[] = [];
  byCategory: IExpenseByCategory[] = [];
  byBranch: IExpenseByBranch[] = [];
  recentExpenses: IExpenseRecentOrTop[] = [];
  topExpenses: IExpenseRecentOrTop[] = [];

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (r) => this.summary = r.data,
      error: (err) => this.notify('el resumen del dashboard', err),
    });

    this.dashboardService.obtenerTendenciaMensual().subscribe({
      next: (r) => this.monthlyTrend = r.data,
      error: (err) => this.notify('la tendencia mensual', err),
    });

    this.dashboardService.obtenerPorCategoria().subscribe({
      next: (r) => this.byCategory = r.data,
      error: (err) => this.notify('los gastos por categoría', err),
    });

    this.dashboardService.obtenerPorSucursal().subscribe({
      next: (r) => this.byBranch = r.data,
      error: (err) => this.notify('los gastos por sucursal', err),
    });

    this.dashboardService.obtenerRecientes().subscribe({
      next: (r) => this.recentExpenses = r.data,
      error: (err) => this.notify('los últimos gastos', err),
    });

    this.dashboardService.obtenerTop().subscribe({
      next: (r) => this.topExpenses = r.data,
      error: (err) => this.notify('los gastos de mayor monto', err),
    });
  }

  private notify(label: string, err: unknown): void {
    this.notificationService.showError(extractErrorMessage(err, `No se pudo cargar ${label}.`));
  }

  get maxMonthlyAmount(): number {
    return Math.max(1, ...this.monthlyTrend.map(m => m.amount));
  }

  get maxCategoryAmount(): number {
    return Math.max(1, ...this.byCategory.map(c => c.amount));
  }

  get maxBranchAmount(): number {
    return Math.max(1, ...this.byBranch.map(b => b.amount));
  }

  verGasto(id: number): void {
    this.router.navigate(['/gastos/gastos', id, 'editar']);
  }

}
