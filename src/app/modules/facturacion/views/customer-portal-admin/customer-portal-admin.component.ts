import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { CustomerPortalService } from '../../services/customer-portal.service';
import { IPortalCustomerAdminItem } from '../../interfaces/IPortal';
import { extractErrorMessage } from '../../shared/http-error.util';

const ESTADO_META: Record<string, { color: string }> = {
  'Sin Portal': { color: '#757575' },
  'Nunca Ingresó': { color: '#ef6c00' },
  'Activo': { color: '#2e7d32' },
};

@Component({
  selector: 'app-customer-portal-admin',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatTableModule, DatePipe, LoadingComponent],
  templateUrl: './customer-portal-admin.component.html',
  styleUrl: './customer-portal-admin.component.css'
})
export class CustomerPortalAdminComponent implements OnInit {

  private customerPortalService = inject(CustomerPortalService);
  private notificationService = inject(NotificationsSystemService);

  clientes: IPortalCustomerAdminItem[] = [];
  loading = false;
  displayedColumns: string[] = ['customerName', 'portalEnabled', 'totalUsers', 'activeUsers', 'lastLogin', 'status'];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.customerPortalService.listarAdmin().subscribe({
      next: (resp) => {
        this.clientes = resp.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el reporte de Portal Cliente.'));
      },
    });
  }

  colorEstado(status: string): string {
    return ESTADO_META[status]?.color ?? '#757575';
  }

}
