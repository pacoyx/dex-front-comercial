import { Component, inject,model } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCardModule} from '@angular/material/card';
import {provideNativeDateAdapter} from '@angular/material/core';
@Component({
  selector: 'app-buttonsheet-fecha-entrega',
  standalone: true,
  imports: [MatListModule,MatDatepickerModule,MatCardModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './buttonsheet-fecha-entrega.component.html',
  styleUrl: './buttonsheet-fecha-entrega.component.css'
})
export class ButtonsheetFechaEntregaComponent {

  selected = model<Date | null>(null);


  private _bottomSheetRef = inject<MatBottomSheetRef<ButtonsheetFechaEntregaComponent>>(MatBottomSheetRef);


  actualizarTipoPago(event: MouseEvent, pago:any): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
