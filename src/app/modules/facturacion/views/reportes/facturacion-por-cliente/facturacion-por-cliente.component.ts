import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../core/configGlobal/custom-date-formats';
import { InvoiceDashboardService } from '../../../services/invoice-dashboard.service';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { ICustomerSalesItem } from '../../../interfaces/IInvoiceDashboard';
import { extractErrorMessage } from '../../../shared/http-error.util';

@Component({
  selector: 'app-facturacion-por-cliente',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatDatepickerModule,
    ReactiveFormsModule, CurrencyPipe,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './facturacion-por-cliente.component.html',
  styleUrl: './facturacion-por-cliente.component.css'
})
export class FacturacionPorClienteComponent implements OnInit {

  private dashboardService = inject(InvoiceDashboardService);
  private notificationService = inject(NotificationsSystemService);

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  data: ICustomerSalesItem[] = [];
  loading = false;

  ngOnInit(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.rangeFrm.setValue({ start: inicioMes, end: hoy });
    this.buscar();
  }

  get maxAmount(): number {
    return Math.max(1, ...this.data.map(d => d.amount));
  }

  get totalAmount(): number {
    return this.data.reduce((sum, d) => sum + d.amount, 0);
  }

  buscar(): void {
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    this.loading = true;
    this.dashboardService.obtenerVentasPorCliente({
      dateFrom: start ? start.toISOString() : undefined,
      dateTo: end ? end.toISOString() : undefined,
    }).subscribe({
      next: (response) => {
        this.data = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al obtener la facturación por cliente.'));
      }
    });
  }

  limpiar(): void {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    this.rangeFrm.setValue({ start: inicioMes, end: hoy });
    this.buscar();
  }

}
