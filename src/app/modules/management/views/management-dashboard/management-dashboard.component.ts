import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ManagementDashboardService } from '../../services/management-dashboard.service';
import { IManagementDashboard } from '../../interfaces/IManagementDashboard';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../shared/http-error.util';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';

interface IDonutSegment {
  label: string;
  value: number;
  color: string;
}

interface ICompareBarItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-management-dashboard',
  standalone: true,
  imports: [MatCardModule, MatIconModule, RouterModule, CurrencyPipe, DatePipe, DecimalPipe, LoadingComponent],
  templateUrl: './management-dashboard.component.html',
  styleUrl: './management-dashboard.component.css'
})
export class ManagementDashboardComponent implements OnInit {

  private dashboardService = inject(ManagementDashboardService);
  private notificationService = inject(NotificationsSystemService);

  private readonly palette = ['#1565c0', '#2e7d32', '#ef6c00', '#8e24aa', '#00897b', '#c62828'];

  data: IManagementDashboard | null = null;
  loading = true;

  ngOnInit(): void {
    this.loading = true;
    this.dashboardService.obtenerResumen().subscribe({
      next: (resp) => {
        this.data = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el dashboard de management.'));
      },
    });
  }

  private buildConicGradient(segments: IDonutSegment[]): string {
    const total = segments.reduce((sum, s) => sum + s.value, 0);
    if (total <= 0) {
      return 'conic-gradient(var(--mat-sys-surface-container-high) 0deg 360deg)';
    }
    let cumulative = 0;
    const parts = segments.map(s => {
      const start = (cumulative / total) * 360;
      cumulative += s.value;
      const end = (cumulative / total) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }

  // ===== Resultado del Negocio =====

  get netResultColor(): string {
    return this.data?.businessSummary.isProfitable ? '#2e7d32' : '#c62828';
  }

  // ===== Desglose de gastos (barras horizontales) =====

  get expenseBreakdownMax(): number {
    return Math.max(1, ...(this.data?.businessSummary.expenseBreakdown.map(e => e.amount) ?? [0]));
  }

  // ===== Gauge de riesgo de cobranza =====

  get pendingRatioValue(): number {
    return this.data?.businessSummary.pendingCollectionRatio ?? 0;
  }

  get pendingRatioColor(): string {
    const r = this.pendingRatioValue;
    if (r < 30) return '#2e7d32';
    if (r <= 50) return '#f9a825';
    return '#c62828';
  }

  get pendingRatioLabel(): string {
    const r = this.pendingRatioValue;
    if (r < 30) return 'Riesgo bajo';
    if (r <= 50) return 'Riesgo medio';
    return 'Riesgo alto';
  }

  get pendingRatioGradient(): string {
    const r = Math.min(100, Math.max(0, this.pendingRatioValue));
    const deg = (r / 100) * 360;
    return `conic-gradient(${this.pendingRatioColor} 0deg ${deg}deg, var(--mat-sys-surface-container-high) ${deg}deg 360deg)`;
  }

  // ===== Donut: metodos de pago (recepcion) =====

  get paymentMethodSegments(): (IDonutSegment & { count: number })[] {
    const items = this.data?.receptionIncome.paymentMethodBreakdown ?? [];
    return items.map((item, i) => ({
      label: item.method,
      value: item.amount,
      count: item.count,
      color: this.palette[i % this.palette.length],
    }));
  }

  get paymentMethodTotal(): number {
    return this.paymentMethodSegments.reduce((sum, s) => sum + s.value, 0);
  }

  get paymentMethodGradient(): string {
    return this.buildConicGradient(this.paymentMethodSegments);
  }

  // ===== Donut: estado de recordatorios (collections) =====

  get collectionsSegments(): IDonutSegment[] {
    const c = this.data?.collections;
    if (!c) return [];
    return [
      { label: 'Enviados', value: c.remindersSent, color: '#2e7d32' },
      { label: 'Fallidos', value: c.remindersFailed, color: '#c62828' },
      { label: 'Omitidos', value: c.remindersSkipped, color: '#757575' },
    ].filter(s => s.value > 0);
  }

  get collectionsTotal(): number {
    return this.collectionsSegments.reduce((sum, s) => sum + s.value, 0);
  }

  get collectionsGradient(): string {
    return this.buildConicGradient(this.collectionsSegments);
  }

  // ===== Donut: estado de guias de recojo (operations) =====

  get operationsSegments(): IDonutSegment[] {
    const o = this.data?.operations;
    if (!o) return [];
    return [
      { label: 'Pendientes', value: o.pendingPickupGuides, color: '#ef6c00' },
      { label: 'Completadas', value: o.completedPickupGuides, color: '#2e7d32' },
    ].filter(s => s.value > 0);
  }

  get operationsTotal(): number {
    return this.operationsSegments.reduce((sum, s) => sum + s.value, 0);
  }

  get operationsGradient(): string {
    return this.buildConicGradient(this.operationsSegments);
  }

  // ===== Donut: estado de deliveries =====

  get deliveriesSegments(): IDonutSegment[] {
    const d = this.data?.deliveries;
    if (!d) return [];
    return [
      { label: 'Pendientes', value: d.deliveryPending, color: '#ef6c00' },
      { label: 'Completadas', value: d.deliveryCompleted, color: '#2e7d32' },
    ].filter(s => s.value > 0);
  }

  get deliveriesTotal(): number {
    return this.deliveriesSegments.reduce((sum, s) => sum + s.value, 0);
  }

  get deliveriesGradient(): string {
    return this.buildConicGradient(this.deliveriesSegments);
  }

  // ===== Comparativo Delivery vs Recepcion =====

  get deliveryVsReceptionCount(): { max: number; items: ICompareBarItem[] } {
    const d = this.data?.deliveries;
    const items: ICompareBarItem[] = [
      { label: 'Delivery', value: d?.deliveryCount ?? 0 },
      { label: 'Recepción', value: d?.receptionCount ?? 0 },
    ];
    return { max: Math.max(1, ...items.map(i => i.value)), items };
  }

  get deliveryVsReceptionAmount(): { max: number; items: ICompareBarItem[] } {
    const d = this.data?.deliveries;
    const items: ICompareBarItem[] = [
      { label: 'Delivery', value: d?.deliveryAmount ?? 0 },
      { label: 'Recepción', value: d?.receptionAmount ?? 0 },
    ];
    return { max: Math.max(1, ...items.map(i => i.value)), items };
  }

}
