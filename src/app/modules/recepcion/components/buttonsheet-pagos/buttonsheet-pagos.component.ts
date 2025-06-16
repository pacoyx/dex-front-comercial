import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { EmisionService } from '../../services/emision.service';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buttonsheet-pagos',
  standalone: true,
  imports: [MatListModule, MatIconModule, NgClass, MatFormFieldModule, MatCheckboxModule, MatInputModule, FormsModule],
  templateUrl: './buttonsheet-pagos.component.html',
  styleUrl: './buttonsheet-pagos.component.css'
})
export class ButtonsheetPagosComponent implements OnDestroy, OnInit {
  private _bottomSheetRef = inject<MatBottomSheetRef<ButtonsheetPagosComponent>>(MatBottomSheetRef);
  pagos = [
    { id: 'EF', tipo: 'Efectivo', detalle: 'Pago en efectivo', icon: 'attach_money' },
    { id: 'QR', tipo: 'Yape', detalle: 'Pago por Yape / Plin', icon: 'smartphone' },
    { id: 'TA', tipo: 'Tarjeta', detalle: 'Pago con tarjeta Visa / Mastercard', icon: 'credit_card' },
    { id: 'TR', tipo: 'Transferencia', detalle: 'Pago por transferencia', icon: 'account_balance' },
    { id: 'CA', tipo: 'Cancelar', detalle: 'Cancelar operacion', icon: 'close' },
  ];

  checkCobrarEfectivo = true;
  montoCobrar = 0;


  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.montoCobrar = data.montoCobrar;
    
  }
  ngOnInit(): void {
    this.checkCobrarEfectivo = this.data.soloRetiro;
  }

  ngOnDestroy(): void { }

  actualizarTipoPago(event: MouseEvent, pago: any): void {
    this._bottomSheetRef.dismiss({ data: pago, montoCobrar: this.montoCobrar, checkCobrarEfectivo: this.checkCobrarEfectivo });
    event.preventDefault();
  }

  aceptar() {
    this._bottomSheetRef.dismiss({ data:  { id: 'OO', tipo: 'Otros' }, montoCobrar: 0, checkCobrarEfectivo: false });
  }

  cancelar() {
    this._bottomSheetRef.dismiss({ data: { id: 'CA' }});
  }

}
