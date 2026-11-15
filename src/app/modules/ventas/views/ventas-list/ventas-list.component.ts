import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { VentasService } from '../../services/ventas.service';
import { ISaleListItem, PAYMENT_OPTIONS, paymentLabel, SaleStatus } from '../../interfaces/IVentas';
import { mensajeError } from '../../shared/http-error.util';
import { descargarArchivo } from '../../shared/file-download.util';

function isoDate(d: Date | null): string | null {
  if (!d) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'app-ventas-list',
  standalone: true,
  imports: [
    FormsModule, RouterModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatSelectModule, MatTableModule, LoadingComponent, DatePipe, DecimalPipe
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './ventas-list.component.html',
  styleUrl: '../../../inventario/shared/inventario-page.css'
})
export class VentasListComponent implements OnInit {

  private ventasService = inject(VentasService);
  private notifications = inject(NotificationsSystemService);
  private router = inject(Router);

  readonly pagos = PAYMENT_OPTIONS;
  readonly Cancelled = SaleStatus.Cancelled;
  readonly paymentLabel = paymentLabel;

  desde: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  hasta: Date = new Date();
  estado: SaleStatus | null = null;
  medioPago: string | null = null;

  ventas: ISaleListItem[] = [];
  columnas = ['number', 'date', 'customer', 'user', 'payment', 'items', 'total', 'status'];
  loading = false;
  exportando: 'excel' | 'pdf' | null = null;
  errorMessage = '';

  get totalVigente(): number {
    return this.ventas.filter(v => v.status !== SaleStatus.Cancelled).reduce((s, v) => s + v.total, 0);
  }

  get cantidadVigente(): number {
    return this.ventas.filter(v => v.status !== SaleStatus.Cancelled).length;
  }

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    if (this.hasta < this.desde) {
      this.errorMessage = 'La fecha "Hasta" no puede ser anterior a "Desde".';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.ventasService.listarVentas(isoDate(this.desde), isoDate(this.hasta), this.estado, this.medioPago).subscribe({
      next: (resp) => {
        this.loading = false;
        this.ventas = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.ventas = [];
        this.errorMessage = mensajeError(err, 'No se pudieron cargar las ventas.');
      }
    });
  }

  exportar(formato: 'excel' | 'pdf'): void {
    this.exportando = formato;
    this.ventasService.descargarReporte(formato, isoDate(this.desde), isoDate(this.hasta)).subscribe({
      next: (resp) => {
        this.exportando = null;
        descargarArchivo(resp, `Ventas.${formato === 'excel' ? 'xlsx' : 'pdf'}`);
      },
      error: (err) => {
        this.exportando = null;
        this.notifications.showError(mensajeError(err, 'No se pudo exportar el reporte.'));
      }
    });
  }

  abrir(v: ISaleListItem): void {
    this.router.navigate(['/ventas/historial', v.id]);
  }
}
