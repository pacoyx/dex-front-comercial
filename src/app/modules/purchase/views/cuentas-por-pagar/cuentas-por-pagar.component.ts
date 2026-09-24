import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { PurchaseOperationsService } from '../../services/purchase-operations.service';
import { IAccountPayable } from '../../interfaces/IAccountsPayable';
import { PurchaseInvoiceStatusColorPipe, PurchaseInvoiceStatusLabelPipe } from '../../shared/purchase-invoice-status';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-cuentas-por-pagar',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatTableModule, MatSortModule, FormsModule,
    RouterModule, CurrencyPipe, DatePipe, PurchaseInvoiceStatusLabelPipe, PurchaseInvoiceStatusColorPipe
  ],
  templateUrl: './cuentas-por-pagar.component.html',
  styleUrl: './cuentas-por-pagar.component.css'
})
export class CuentasPorPagarComponent implements OnInit {

  private purchaseOperationsService = inject(PurchaseOperationsService);
  private notificationService = inject(NotificationsSystemService);

  filtro = '';
  allData: IAccountPayable[] = [];
  displayedColumns: string[] = ['proveedor', 'documento', 'total', 'pagado', 'saldo', 'estado', 'vencido'];
  dataSource = new MatTableDataSource<IAccountPayable>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.purchaseOperationsService.obtenerCuentasPorPagar().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las cuentas por pagar.'));
      }
    });
  }

  aplicarFiltro() {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item => item.supplierName.toLowerCase().includes(texto));
  }

  sortData(sort: Sort) {
    const data = [...this.dataSource.data];
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }
    this.dataSource.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'proveedor': return this.compare(a.supplierName, b.supplierName, isAsc);
        case 'total': return this.compare(a.total, b.total, isAsc);
        case 'saldo': return this.compare(a.balance, b.balance, isAsc);
        case 'vencido': return this.compare(a.overdueDays, b.overdueDays, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}
