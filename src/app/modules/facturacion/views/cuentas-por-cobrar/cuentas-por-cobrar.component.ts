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
import { InvoicesService } from '../../services/invoices.service';
import { IAccountReceivable } from '../../interfaces/IAccountsReceivable';
import { InvoiceStatusColorPipe, InvoiceStatusLabelPipe } from '../../shared/invoice-status';
import { extractErrorMessage } from '../../shared/http-error.util';

@Component({
  selector: 'app-cuentas-por-cobrar',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatTableModule, MatSortModule, FormsModule,
    RouterModule, CurrencyPipe, DatePipe, InvoiceStatusLabelPipe, InvoiceStatusColorPipe
  ],
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrl: './cuentas-por-cobrar.component.css'
})
export class CuentasPorCobrarComponent implements OnInit {

  private invoicesService = inject(InvoicesService);
  private notificationService = inject(NotificationsSystemService);

  filtro = '';
  allData: IAccountReceivable[] = [];
  displayedColumns: string[] = ['cliente', 'factura', 'total', 'pagado', 'saldo', 'estado', 'vencido'];
  dataSource = new MatTableDataSource<IAccountReceivable>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.invoicesService.obtenerCuentasPorCobrar().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las cuentas por cobrar.'));
      }
    });
  }

  aplicarFiltro() {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item => item.customerName.toLowerCase().includes(texto));
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
        case 'cliente': return this.compare(a.customerName, b.customerName, isAsc);
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
