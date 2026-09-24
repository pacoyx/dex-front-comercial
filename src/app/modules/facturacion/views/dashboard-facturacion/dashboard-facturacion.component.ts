import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { InvoiceDashboardService } from '../../services/invoice-dashboard.service';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import {
  IBranchSalesItem,
  IInvoiceAccountReceivableTop,
  IInvoiceDashboardSummary,
  IInvoiceMonthlySales,
  IInvoiceStatusSummary,
  IOverdueInvoice,
  IRecentInvoice,
  IServiceSalesItem,
  ITopCustomer,
} from '../../interfaces/IInvoiceDashboard';
import {
  InvoiceStatusStringColorPipe,
  InvoiceStatusStringLabelPipe,
  getInvoiceStatusStringMeta,
} from '../../shared/invoice-status-string';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-dashboard-facturacion',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatButtonModule, RouterModule,
    CurrencyPipe, DatePipe, InvoiceStatusStringLabelPipe, InvoiceStatusStringColorPipe,
  ],
  templateUrl: './dashboard-facturacion.component.html',
  styleUrl: './dashboard-facturacion.component.css'
})
export class DashboardFacturacionComponent implements OnInit {

  private dashboardService = inject(InvoiceDashboardService);
  private notificationService = inject(NotificationsSystemService);
  private router = inject(Router);

  summary: IInvoiceDashboardSummary | null = null;
  monthlySales: IInvoiceMonthlySales[] = [];
  statusSummary: IInvoiceStatusSummary[] = [];
  accountsReceivableTop: IInvoiceAccountReceivableTop[] = [];
  overdueInvoices: IOverdueInvoice[] = [];
  topCustomers: ITopCustomer[] = [];
  branchSales: IBranchSalesItem[] = [];
  serviceSales: IServiceSalesItem[] = [];
  recentInvoices: IRecentInvoice[] = [];

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (r) => this.summary = r.data,
      error: (err) => this.notify('el resumen del dashboard', err),
    });

    this.dashboardService.obtenerVentasPorMes().subscribe({
      next: (r) => this.monthlySales = r.data,
      error: (err) => this.notify('la facturación por mes', err),
    });

    this.dashboardService.obtenerResumenPorEstado().subscribe({
      next: (r) => this.statusSummary = r.data,
      error: (err) => this.notify('el resumen por estado', err),
    });

    this.dashboardService.obtenerCuentasPorCobrarTop().subscribe({
      next: (r) => this.accountsReceivableTop = r.data,
      error: (err) => this.notify('las cuentas por cobrar', err),
    });

    this.dashboardService.obtenerFacturasVencidas().subscribe({
      next: (r) => this.overdueInvoices = r.data,
      error: (err) => this.notify('las facturas vencidas', err),
    });

    this.dashboardService.obtenerTopClientes().subscribe({
      next: (r) => this.topCustomers = r.data,
      error: (err) => this.notify('el top de clientes', err),
    });

    this.dashboardService.obtenerVentasPorSucursal().subscribe({
      next: (r) => this.branchSales = r.data,
      error: (err) => this.notify('la facturación por sucursal', err),
    });

    this.dashboardService.obtenerVentasPorServicio().subscribe({
      next: (r) => this.serviceSales = r.data,
      error: (err) => this.notify('la facturación por servicio', err),
    });

    this.dashboardService.obtenerFacturasRecientes().subscribe({
      next: (r) => this.recentInvoices = r.data,
      error: (err) => this.notify('las últimas facturas', err),
    });
  }

  private notify(label: string, err: unknown): void {
    this.notificationService.showError(extractErrorMessage(err, `No se pudo cargar ${label}.`));
  }

  get maxMonthlyAmount(): number {
    return Math.max(1, ...this.monthlySales.map(m => m.amount));
  }

  get maxTopCustomerAmount(): number {
    return Math.max(1, ...this.topCustomers.map(c => c.totalInvoiced));
  }

  get maxBranchAmount(): number {
    return Math.max(1, ...this.branchSales.map(b => b.amount));
  }

  get maxServiceAmount(): number {
    return Math.max(1, ...this.serviceSales.map(s => s.amount));
  }

  get statusDonutSegments(): { status: string; count: number; color: string; label: string }[] {
    return this.statusSummary
      .filter(s => s.count > 0)
      .map(s => ({
        status: s.status,
        count: s.count,
        color: getInvoiceStatusStringMeta(s.status).color,
        label: getInvoiceStatusStringMeta(s.status).label,
      }));
  }

  get statusDonutTotal(): number {
    return this.statusDonutSegments.reduce((sum, s) => sum + s.count, 0);
  }

  get statusDonutGradient(): string {
    const segments = this.statusDonutSegments;
    const total = this.statusDonutTotal;
    if (total === 0) {
      return 'conic-gradient(var(--mat-sys-surface-container-high) 0deg 360deg)';
    }
    let cumulative = 0;
    const parts = segments.map(s => {
      const start = (cumulative / total) * 360;
      cumulative += s.count;
      const end = (cumulative / total) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${parts.join(', ')})`;
  }

  verFactura(invoiceId: number): void {
    this.router.navigate(['/facturacion/facturas', invoiceId]);
  }

}
