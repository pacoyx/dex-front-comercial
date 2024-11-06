import { Component, Inject, inject, OnDestroy } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { IReqGuiaInfoPay } from '../../interfaces/IReqGuiaInfoPay';
import { EmisionService } from '../../services/emision.service';
import { Subscription } from 'rxjs';
import { LoginService } from '../../../../core/services/login.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-buttonsheet-pagos',
  standalone: true,
  imports: [MatListModule, MatIconModule,NgClass],
  templateUrl: './buttonsheet-pagos.component.html',
  styleUrl: './buttonsheet-pagos.component.css'
})
export class ButtonsheetPagosComponent implements OnDestroy{

  pagos = [
    { id: 'EF', tipo: 'Efectivo', detalle: 'Pago en efectivo', icon: 'attach_money' },
    { id: 'QR', tipo: 'Yape', detalle: 'Pago por Yape / Plin', icon: 'smartphone' },
    { id: 'TA', tipo: 'Tarjeta', detalle: 'Pago con tarjeta Visa / Mastercard', icon: 'credit_card' },
    { id: 'TR', tipo: 'Transferencia', detalle: 'Pago por transferencia', icon: 'account_balance' },
    { id: 'CA', tipo: 'Cancelar', detalle: 'Cancelar operacion', icon: 'close' },
  ]

  private _bottomSheetRef = inject<MatBottomSheetRef<ButtonsheetPagosComponent>>(MatBottomSheetRef);
  emisionService = inject(EmisionService);
  loginService = inject(LoginService);
  UpdateInfoPagoSubscription!: Subscription;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    const fecha = new Date();
    fecha.setHours(fecha.getHours() - 5);
    const fechaISO = fecha.toISOString();
    console.log(fechaISO);
  }
  ngOnDestroy(): void {
    if (this.UpdateInfoPagoSubscription) this.UpdateInfoPagoSubscription.unsubscribe();
  }

  actualizarTipoPago(event: MouseEvent, pago: any): void {
    console.log('actualizarTipoPago', pago, this.data);

    if (pago.id === 'CA') {
      this._bottomSheetRef.dismiss({ status: 'CANCEL', data: 'Cancelado por el usuario' });
      return;
    }


    let objInfoPago: IReqGuiaInfoPay = {
      id: this.data.idGuia,
      tipoPago: pago.id,
      descripcionPago: pago.tipo,
      fechaPago: new Date().toISOString(), //esta fecha se envia pero no se usa en el backend
      estadoPago: 'PA',
      idUser: this.loginService.getLoginData()?.userId || 0
    }

    this.UpdateInfoPagoSubscription = this.emisionService.ActualizarGuiaInfoPago(this.data.idGuia, objInfoPago)
      .subscribe({
        next: (resp) => {          
          objInfoPago.fechaPago = resp.data;
          let dataResp = { status: 'OK', data: objInfoPago };
          this._bottomSheetRef.dismiss(dataResp);
        },
        error: (err) => {
          console.log(err);
          let dataResp = { status: 'ERR', data: 'Error al actualizar el tipo de pago' };
          this._bottomSheetRef.dismiss(dataResp);
        },
        complete: () => {
          console.log('completado ActualizarGuiaInfoPago()');
        }
      });

    event.preventDefault();
  }
}
