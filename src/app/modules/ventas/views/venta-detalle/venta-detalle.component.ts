import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { VentasService } from '../../services/ventas.service';
import { ISaleDetail, paymentLabel, SaleStatus } from '../../interfaces/IVentas';
import { mensajeError } from '../../shared/http-error.util';
import { imprimirTicket } from '../../shared/ticket-nota-venta';

/** Pide el motivo de la anulación de una venta. */
@Component({
  selector: 'app-dialog-anular-venta',
  standalone: true,
  imports: [FormsModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Anular {{ data.number }}</h2>
    <mat-dialog-content>
      <p class="texto">Se devuelve el stock al almacén y se quita el cobro de la caja. Solo se puede anular mientras la
        caja de la venta siga abierta.</p>
      <mat-form-field appearance="outline" class="campo">
        <mat-label>Motivo de la anulación</mat-label>
        <textarea matInput [(ngModel)]="motivo" rows="2" maxlength="300"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="warn" [disabled]="!motivo.trim()" (click)="dialogRef.close(motivo.trim())">Anular venta</button>
    </mat-dialog-actions>
  `,
  styles: [`.campo { width: 100%; } .texto { margin: 0 0 12px; font: var(--mat-sys-body-medium); }`]
})
export class DialogAnularVentaComponent {
  readonly data = inject<{ number: string }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogAnularVentaComponent>);
  motivo = '';
}

@Component({
  selector: 'app-venta-detalle',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatCardModule, MatIconModule, MatTableModule, LoadingComponent, DatePipe, DecimalPipe],
  templateUrl: './venta-detalle.component.html',
  styleUrls: ['../../../inventario/shared/inventario-page.css', './venta-detalle.component.css']
})
export class VentaDetalleComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private ventasService = inject(VentasService);
  private notifications = inject(NotificationsSystemService);

  readonly Cancelled = SaleStatus.Cancelled;
  readonly paymentLabel = paymentLabel;

  venta: ISaleDetail | null = null;
  columnas = ['product', 'quantity', 'unitPrice', 'total'];
  loading = false;
  anulando = false;
  errorMessage = '';

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => this.cargar(Number(p.get('id'))));
  }

  cargar(id: number): void {
    this.loading = true;
    this.ventasService.obtenerVenta(id).subscribe({
      next: (resp) => {
        this.loading = false;
        this.venta = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = mensajeError(err, 'No se pudo cargar la venta.');
      }
    });
  }

  get puedeAnular(): boolean {
    return !!this.venta && this.venta.status !== SaleStatus.Cancelled && this.venta.cashBoxOpen;
  }

  get margen(): number {
    return this.venta ? Math.round((this.venta.subtotal - this.venta.totalCost) * 100) / 100 : 0;
  }

  reimprimir(): void {
    if (this.venta) imprimirTicket(this.venta);
  }

  anular(): void {
    if (!this.venta) return;
    const ref = this.dialog.open(DialogAnularVentaComponent, { width: '460px', data: { number: this.venta.number } });
    ref.afterClosed().subscribe((motivo?: string) => {
      if (!motivo || !this.venta) return;
      this.anulando = true;
      this.ventasService.anularVenta(this.venta.id, motivo).subscribe({
        next: () => {
          this.anulando = false;
          this.notifications.showSuccess(`Venta ${this.venta!.number} anulada.`);
          this.cargar(this.venta!.id);
        },
        error: (err) => {
          this.anulando = false;
          this.notifications.showError(mensajeError(err, 'No se pudo anular la venta.'));
        }
      });
    });
  }
}
