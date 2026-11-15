import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { InventarioService } from '../../services/inventario.service';
import { IMovementDetail, InventoryMovementStatus, InventoryMovementType } from '../../interfaces/IInventario';
import { MovementStatusLabelPipe, MovementTypeIconPipe, MovementTypeLabelPipe } from '../../shared/movement-type';
import { mensajeError } from '../../shared/http-error.util';
import { DialogAnularMovimientoComponent } from './dialog-anular-movimiento.component';

@Component({
  selector: 'app-movimiento-detalle',
  standalone: true,
  imports: [
    RouterModule, MatButtonModule, MatCardModule, MatIconModule, MatTableModule, LoadingComponent, DatePipe, DecimalPipe,
    MovementTypeLabelPipe, MovementTypeIconPipe, MovementStatusLabelPipe
  ],
  templateUrl: './movimiento-detalle.component.html',
  styleUrls: ['../../shared/inventario-page.css', './movimiento-detalle.component.css']
})
export class MovimientoDetalleComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private inventarioService = inject(InventarioService);
  private notifications = inject(NotificationsSystemService);

  readonly Cancelled = InventoryMovementStatus.Cancelled;

  movimiento: IMovementDetail | null = null;
  columnas = ['product', 'warehouse', 'quantity', 'unitCost', 'totalCost', 'balance'];
  loading = false;
  anulando = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => this.cargar(Number(params.get('id'))));
  }

  cargar(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.inventarioService.obtenerMovimiento(id).subscribe({
      next: (resp) => {
        this.loading = false;
        this.movimiento = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = mensajeError(err, 'No se pudo cargar el movimiento.');
      }
    });
  }

  /** Se anula desde aquí salvo: ya anulados, anulaciones y los ingresos por compra (se anulan con la compra). */
  get puedeAnular(): boolean {
    const m = this.movimiento;
    return !!m && m.status !== InventoryMovementStatus.Cancelled
      && m.type !== InventoryMovementType.Reversal && m.type !== InventoryMovementType.PurchaseIn;
  }

  get esCompra(): boolean {
    return this.movimiento?.type === InventoryMovementType.PurchaseIn;
  }

  anular(): void {
    if (!this.movimiento) return;
    const ref = this.dialog.open(DialogAnularMovimientoComponent, { width: '460px', data: { number: this.movimiento.number } });
    ref.afterClosed().subscribe((motivo?: string) => {
      if (!motivo || !this.movimiento) return;
      this.anulando = true;
      this.inventarioService.anularMovimiento(this.movimiento.id, motivo).subscribe({
        next: (resp) => {
          this.anulando = false;
          this.notifications.showSuccess(resp.message || 'Movimiento anulado.');
          this.cargar(this.movimiento!.id);
        },
        error: (err) => {
          this.anulando = false;
          this.notifications.showError(mensajeError(err, 'No se pudo anular el movimiento.'));
        }
      });
    });
  }

  irA(id: number | null): void {
    if (id) this.router.navigate(['/inventario/movimientos', id]);
  }
}
