import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { WebOrdersService } from '../../services/web-orders.service';
import { NotificationServiceService } from '../../services/notification-service.service';
import { IWebOrderAdminSummary, WebOrderStatus } from '../../interfaces/IWebOrderAdmin';
import { DialogQuestionComponent } from '../../components/dialog-question/dialog-question.component';
import { DialogRechazarPedidoComponent } from '../../components/dialog-rechazar-pedido/dialog-rechazar-pedido.component';
import { DialogProgramarPedidoComponent } from '../../components/dialog-programar-pedido/dialog-programar-pedido.component';
import { extractErrorMessage } from '../../shared/http-error.util';

const ESTADOS: WebOrderStatus[] = ['Pendiente', 'Confirmado', 'Programado', 'Recogido', 'Rechazado', 'Cancelado'];

@Component({
  selector: 'app-recepcion-pedidos-web',
  standalone: true,
  imports: [
    MatTableModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatSelectModule,
    MatTooltipModule, ReactiveFormsModule, DatePipe, DecimalPipe,
  ],
  templateUrl: './recepcion-pedidos-web.component.html',
  styleUrl: './recepcion-pedidos-web.component.css'
})
export class RecepcionPedidosWebComponent implements OnInit {

  private webOrdersService = inject(WebOrdersService);
  private notificationService = inject(NotificationServiceService);
  private dialog = inject(MatDialog);

  estados = ESTADOS;
  filtroEstado = new FormControl<WebOrderStatus | null>(null);

  displayedColumns: string[] = [
    'orderNumber', 'customerName', 'contactPhone', 'deliveryAddress', 'total',
    'createdAt', 'requestedPickupDate', 'scheduledPickupDate', 'status', 'operaciones'
  ];
  dataSource = new MatTableDataSource<IWebOrderAdminSummary>([]);
  loading = false;

  ngOnInit(): void {
    this.cargarPedidos();
    this.filtroEstado.valueChanges.subscribe(() => this.cargarPedidos());
  }

  cargarPedidos(): void {
    this.loading = true;
    const estado = this.filtroEstado.value ?? undefined;
    this.webOrdersService.listarPedidosWeb(estado).subscribe({
      next: (resp) => {
        this.loading = false;
        this.dataSource.data = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar la cola de pedidos web.'));
      }
    });
  }

  confirmarPedido(pedido: IWebOrderAdminSummary): void {
    this.dialog.open(DialogQuestionComponent, {
      data: { title: 'Confirmar Pedido', message: `¿Confirmar el pedido ${pedido.orderNumber}? Se generará una guía de trabajo.`, msgButton: 'Confirmar' }
    }).afterClosed().subscribe((result) => {
      if (result !== 'OK') return;

      this.webOrdersService.confirmarPedido(pedido.id).subscribe({
        next: (resp) => {
          this.cargarPedidos();
          this.notificationService.showSuccessDialog(
            `Pedido confirmado. Guía generada: ${resp.data.serieGuia}-${resp.data.numeroGuia}. Comunícala al chofer.`
          );
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo confirmar el pedido.'));
        }
      });
    });
  }

  rechazarPedido(pedido: IWebOrderAdminSummary): void {
    this.dialog.open(DialogRechazarPedidoComponent, {
      data: { webOrderId: pedido.id, orderNumber: pedido.orderNumber },
      width: '440px'
    }).afterClosed().subscribe((result) => {
      if (result) this.cargarPedidos();
    });
  }

  programarPedido(pedido: IWebOrderAdminSummary): void {
    this.dialog.open(DialogProgramarPedidoComponent, {
      data: { webOrderId: pedido.id, orderNumber: pedido.orderNumber },
      width: '480px'
    }).afterClosed().subscribe((result) => {
      if (result) this.cargarPedidos();
    });
  }

}
