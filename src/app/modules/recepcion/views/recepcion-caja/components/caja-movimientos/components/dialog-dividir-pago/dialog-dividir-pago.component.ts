import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ICashBoxDetailResponseDto, IReqSpliPayCash, SplitPayCashDetail } from '../../../../../../interfaces/ICajaVentas';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmisionService } from '../../../../../../services/emision.service';
import { LoadingComponent } from '../../../../../../../../core/components/loading/loading.component';

@Component({
  selector: 'app-dialog-dividir-pago',
  standalone: true,
  imports: [
    MatDialogTitle, MatDialogContent, MatDialogActions,
    MatInputModule, MatFormFieldModule, MatButtonModule,
    MatIconModule, DecimalPipe, FormsModule, LoadingComponent
  ],
  templateUrl: './dialog-dividir-pago.component.html',
  styleUrl: './dialog-dividir-pago.component.css'
})
export class DialogDividirPagoComponent {

  emisionService = inject(EmisionService);

  readonly dialogRef = inject(MatDialogRef<DialogDividirPagoComponent>);
  readonly data = inject<{ item: ICashBoxDetailResponseDto }>(MAT_DIALOG_DATA);
  importe = 0;
  importeSuma = 0;

  montoEfectivo = 0;
  montoYape = 0;
  montoTarjeta = 0;
  bolError = false;
  msgError = '';
  bolLoading = false;

  constructor() {
    console.log(this.data.item);
    this.importe = this.data.item.importe > 0 ? this.data.item.importe : this.data.item.adelanto;
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {

    this.importeSuma = this.montoEfectivo + this.montoYape + this.montoTarjeta;
    if (this.importeSuma != this.importe) {
      this.bolError = true;
      this.msgError = 'La suma de los montos no es igual al importe';
      setTimeout(() => {
        this.bolError = false;
      }, 3000);
      return;
    }

    let infoPago: SplitPayCashDetail[] = [];

    if (this.montoEfectivo > 0) {
      infoPago.push({
        importe: this.montoEfectivo,
        tipoPago: 'EF'
      });
    }

    if (this.montoYape > 0) {
      infoPago.push({
        importe: this.montoYape,
        tipoPago: 'QR'
      });
    }

    if (this.montoTarjeta > 0) {
      infoPago.push({
        importe: this.montoTarjeta,
        tipoPago: 'TA'
      });
    }


    let reqSplit: IReqSpliPayCash = {
      cashBoxDetailId: this.data.item.id,
      splitPayCashDetail: infoPago
    };

    this.bolLoading = true;
    this.emisionService.DividirPago(reqSplit).subscribe({
      next: (response) => {
        this.bolLoading = false;
        console.log(response);
        if (response.success) {
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        console.log(err);
        this.bolLoading = false;
        this.bolError = true;
        this.msgError = 'Ocurrio un error al registrar el pago dividido';
        setTimeout(() => {
          this.bolError = false;
        }, 3000);
      }
    });



  }

}
