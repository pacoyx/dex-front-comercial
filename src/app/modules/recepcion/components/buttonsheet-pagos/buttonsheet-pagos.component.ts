import { Component, inject } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-buttonsheet-pagos',
  standalone: true,
  imports: [MatListModule,MatIconModule],
  templateUrl: './buttonsheet-pagos.component.html',
  styleUrl: './buttonsheet-pagos.component.css'
})
export class ButtonsheetPagosComponent {

  pagos = [
    { tipo: 'Efectivo', detalle: 'Pago en efectivo', icon: 'attach_money' },
    { tipo: 'Yape', detalle: 'Pago por Yape / Plin', icon: 'smartphone' },
    { tipo: 'Tarjeta', detalle: 'Pago con tarjeta Visa / Mastercard', icon: 'credit_card' },
    { tipo: 'Transferencia', detalle: 'Pago por transferencia' , icon: 'account_balance' },
  ]

  private _bottomSheetRef = inject<MatBottomSheetRef<ButtonsheetPagosComponent>>(MatBottomSheetRef);

  actualizarTipoPago(event: MouseEvent, pago:any): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
