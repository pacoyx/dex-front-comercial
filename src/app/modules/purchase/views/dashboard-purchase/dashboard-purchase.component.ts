import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { PurchaseDashboardService } from '../../services/purchase-dashboard.service';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import {
  IPurchaseDashboardSummary,
  IPurchaseMonthlyPurchase,
  IPurchaseRecentPurchase,
  IPurchaseTopProduct,
} from '../../interfaces/IPurchaseDashboard';
import { IAccountPayable } from '../../interfaces/IAccountsPayable';
import { PurchaseInvoiceStatusColorPipe, PurchaseInvoiceStatusLabelPipe } from '../../shared/purchase-invoice-status';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-dashboard-purchase',
  standalone: true,
  imports: [
    MatCardModule, MatIconModule, MatButtonModule, RouterModule,
    CurrencyPipe, DatePipe, PurchaseInvoiceStatusLabelPipe, PurchaseInvoiceStatusColorPipe,
  ],
  templateUrl: './dashboard-purchase.component.html',
  styleUrl: './dashboard-purchase.component.css'
})
export class DashboardPurchaseComponent implements OnInit {

  private dashboardService = inject(PurchaseDashboardService);
  private notificationService = inject(NotificationsSystemService);
  private router = inject(Router);

  summary: IPurchaseDashboardSummary | null = null;
  monthlyPurchases: IPurchaseMonthlyPurchase[] = [];
  topProducts: IPurchaseTopProduct[] = [];
  recentPurchases: IPurchaseRecentPurchase[] = [];
  accountsPayableTop: IAccountPayable[] = [];

  ngOnInit(): void {
    this.dashboardService.obtenerResumen().subscribe({
      next: (response) => this.summary = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el resumen de compras.')),
    });

    this.dashboardService.obtenerComprasPorMes().subscribe({
      next: (response) => this.monthlyPurchases = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el gráfico de compras por mes.')),
    });

    this.dashboardService.obtenerTopProductos().subscribe({
      next: (response) => this.topProducts = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el top de productos.')),
    });

    this.dashboardService.obtenerComprasRecientes().subscribe({
      next: (response) => this.recentPurchases = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las compras recientes.')),
    });

    this.dashboardService.obtenerCuentasPorPagarTop().subscribe({
      next: (response) => this.accountsPayableTop = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el resumen de cuentas por pagar.')),
    });
  }

  get maxMonthlyAmount(): number {
    return Math.max(1, ...this.monthlyPurchases.map(m => m.amount));
  }

  get maxTopProductQuantity(): number {
    return Math.max(1, ...this.topProducts.map(p => p.quantity));
  }

  verCompra(id: number): void {
    this.router.navigate(['/purchase/invoices/view', id]);
  }

}
