import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IDetalleGuiaRetiro, IGuiaRetiro, IGuiaRetiroWgdDTO } from '../../interfaces/IDetalleGuiaRetiro';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ButtonsheetPagosComponent } from '../../components/buttonsheet-pagos/buttonsheet-pagos.component';
import { MatChipsModule } from '@angular/material/chips';
import { ButtonsheetFechaEntregaComponent } from '../../components/buttonsheet-fecha-entrega/buttonsheet-fecha-entrega.component';
import { EmisionService } from '../../services/emision.service';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DialogQuestionComponent } from '../../components/dialog-question/dialog-question.component';
import { DialogMsgComponent } from '../../components/dialog-msg/dialog-msg.component';
import { DialogDevolucionComponent } from '../../components/dialog-devolucion/dialog-devolucion.component';
import { TicketVentaComponent } from '../../components/ticket-venta/ticket-venta.component';
import { EmisionStoreService } from '../../services/emision.store.service';

@Component({
  selector: 'app-recepcion-retirar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule,
    FormsModule, MatIconModule, MatTableModule, MatCheckboxModule,
    DecimalPipe, MatBottomSheetModule, MatChipsModule, DatePipe, TicketVentaComponent],
  templateUrl: './recepcion-retirar.component.html',
  styleUrl: './recepcion-retirar.component.css'
})
export class RecepcionRetirarComponent implements OnInit, OnDestroy {

  numeroGuia: number | null = null;
  private _bottomSheet = inject(MatBottomSheet);
  emisionService = inject(EmisionService);
  readonly dialog = inject(MatDialog);
  readonly store = inject(EmisionStoreService);
  guiaRetiroSubscription!: Subscription;
  estadoSituacionSubscription!: Subscription;


  displayedColumns: string[] = ['cant', 'productName', 'observaciones', 'precio', 'total', 'estadoSituacion', 'estadoTrabajo', 'estadoPago', 'operaciones', 'ubicacion'];
  dataSource = new MatTableDataSource<IGuiaRetiroWgdDTO>([]);
  guiaRetiroData: IGuiaRetiro | null = null;

  bolCancelado = false;
  bolEntregado = false;

  ngOnDestroy(): void {
    if (this.guiaRetiroSubscription) this.guiaRetiroSubscription.unsubscribe();
    if (this.estadoSituacionSubscription) this.estadoSituacionSubscription.unsubscribe();
  }
  ngOnInit(): void {
  }

  buscarGuia() {
    console.log('buscando guia', this.numeroGuia);
    if (!this.numeroGuia) {
      return;
    }

    this.guiaRetiroSubscription = this.emisionService.ObtenerGuiaPorDocumento("001", this.numeroGuia.toString())
      .subscribe({
        next: (resp) => {
          console.log(resp);
          this.guiaRetiroData = resp.data;
          this.dataSource = new MatTableDataSource<IGuiaRetiroWgdDTO>(resp.data.workGuideDetailsDTO);
          this.bolCancelado = this.guiaRetiroData.estadoPago === 'PA';
          this.bolEntregado = this.guiaRetiroData.estadoSituacion === 'E';

          this.cargarStore();
        },
        error: (err) => {
          console.log(err);
        }, complete: () => {
          console.log('complete() ObtenerGuiaPorDocumento');
        },
      })
  }

  cargarStore() {
    console.log('cargando store:', this.guiaRetiroData);
    if (!this.guiaRetiroData) {
      return;
    }

    this.store.addRecepcion(this.guiaRetiroData.tipoRecepcion);
    this.store.addPago({ tipo: this.guiaRetiroData.tipoPago, monto: this.guiaRetiroData.acuenta });    
    this.store.addDocumento({
      tipoDoc: 'GS',
      serieDoc: this.guiaRetiroData.serieGuia,
      numeroDoc: this.guiaRetiroData.numeroGuia,
      fechaEmision: this.guiaRetiroData.fechaOperacion,
      fechaEntrega: this.guiaRetiroData.fechaHoraEntrega
    });
    this.store.addCliente({ 
      codigo: this.guiaRetiroData.customerId, 
      nombre: this.guiaRetiroData.customerName, 
      telefono: this.guiaRetiroData.customerPhone
    });

    this.guiaRetiroData.workGuideDetailsDTO.forEach((item) => {
      this.store.add({
        codProd: item.productId.toString(),
        nomProd: item.product.description,
        Cant: item.cant,
        Precio: item.precio,
        Subtotal: item.total,
        Obs: item.observaciones
      });
    });

  }

  devolverPrenda(ele: any) {
    console.log('editando:', ele);

    var dialogDevolver = this.dialog.open(DialogDevolucionComponent,
      { data: { idItem: ele.id, monto: ele.total } });

    dialogDevolver.afterClosed().subscribe((respuesta) => {
      console.log('data devolucion response:', respuesta);
      if (respuesta.ok) {
        ele.estadoSituacion = 'D';
        if (respuesta.descontar) {
          if (this.guiaRetiroData) {
            this.guiaRetiroData.saldo = this.guiaRetiroData.saldo! - ele.total;
          }
        }

        this.dialog.open(DialogMsgComponent, {
          width: '250px',
          data: {
            title: 'Devolución',
            msg: respuesta.descontar ? 'Se descontó el monto de la devolución y se registro como salida en GASTOS.' : 'Se registro la devolución.',
            err: false
          }
        });


      }
    });
  }

  cancelar(event: any) {
    console.log(event);
    if (event.checked) {
      var dialogCancelar = this._bottomSheet.open(ButtonsheetPagosComponent,
        { data: { idGuia: this.guiaRetiroData?.id } });

      dialogCancelar.afterDismissed().subscribe((respuesta) => {
        console.log('data pago response:', respuesta);
        if (respuesta.status === 'ERR') {
          this.bolCancelado = false;
          return;
        }
        if (respuesta.status === 'CANCEL') {
          this.bolCancelado = false;
          return;
        }

        this.bolCancelado = true;
        this.guiaRetiroData!.tipoPagoCancelacion = respuesta.data.tipoPago;
        this.guiaRetiroData!.fechaPago = respuesta.data.fechaPago;
      });

    }
  }

  actualizarEstadoEntrega(event: any) {
    if (event.checked) {
      this.estadoSituacionSubscription = this.emisionService.ActualizarEstadoRecojo(this.guiaRetiroData!.id).subscribe({
        next: (resp) => {
          console.log(resp);
          if (!resp.success) {
            this.bolEntregado = false;
            return;
          }

          this.bolEntregado = true;
          this.guiaRetiroData!.estadoSituacion = 'E';
          this.guiaRetiroData!.fechaRecojo = new Date().toUTCString();

        },
        error: (err) => {
          console.log(err);
        }, complete: () => {
          console.log('complete() ActualizarEstadoRecojo');
        },
      });
    }
  }

  cambiarEntrega(item: IDetalleGuiaRetiro) {
    console.log('cambiando fecha entrega:', item);
    this._bottomSheet.open(ButtonsheetFechaEntregaComponent);
  }

  anularGuia() {
    console.log('anulando guia:', this.guiaRetiroData);
    if (!this.guiaRetiroData) {
      return;
    }

    if (this.guiaRetiroData.estadoPago === 'PA') {
      // this.dialog.open(DialogQuestionComponent, {
      //   width: '250px',
      //   data: { title: 'Anular Guía', message: 'No se puede anular la guía porque ya se realizó el pago.', msgButton: 'Cerrar' }
      // });


      this.dialog.open(DialogMsgComponent, {
        width: '250px',
        data: {
          title: 'Anular Guía',
          msg: 'No se puede anular la guía porque ya se realizó el pago.',
          err: true
        }
      });

      return;
    }


    this.dialog.open(DialogQuestionComponent, {
      width: '250px',
      data: { title: 'Anular Guía', message: '¿Está seguro de anular la guía de retiro?', msgButton: 'Anular' }
    }).afterClosed().subscribe((result) => {
      if (result === 'OK') {
        this.emisionService.AnularGuia(this.guiaRetiroData!.id).subscribe({
          next: (resp) => {
            if (!resp.success) {
              return;
            }
            this.guiaRetiroData!.estadoRegistro = 'I';
          },
          error: (err) => {
            console.log(err);
          }, complete: () => {
            console.log('complete() AnularGuia');
          },
        });
      }
    });
  }

  registrarAlerta() {
    console.log('registrar alerta:', this.guiaRetiroData);
    if (!this.guiaRetiroData) {
      return;
    }
    // this.store.registrarAlerta(this.guiaRetiroData.id);
  }

  listarAlertas() {
    console.log('listar alertas:', this.guiaRetiroData);
    if (!this.guiaRetiroData) {
      return;
    }
    this.emisionService.ListarAlertasPorGuiaId(this.guiaRetiroData.id).subscribe({
      next: (resp) => {
        console.log(resp);
      },
      error: (err) => {
        console.log(err);
      }, complete: () => {
        console.log('complete() ListarAlertasPorGuiaId');
      },
    });
  }

  imprimirGuia() {
    console.log('imprimir guia:', this.guiaRetiroData);
    if (!this.guiaRetiroData) {
      return;
    }
    window.print();
  }
}
