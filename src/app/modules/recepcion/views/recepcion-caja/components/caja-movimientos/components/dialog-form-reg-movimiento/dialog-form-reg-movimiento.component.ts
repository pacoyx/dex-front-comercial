import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IDetalleCajaRequestOtherIn } from '../../../../../../interfaces/ICajaVentas';
import { EmisionService } from '../../../../../../services/emision.service';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../../../../../../core/components/loading/loading.component';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dialog-form-reg-movimiento',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatRadioModule,
    FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatIconModule, LoadingComponent],
  templateUrl: './dialog-form-reg-movimiento.component.html',
  styleUrl: './dialog-form-reg-movimiento.component.css'
})
export class DialogFormRegMovimientoComponent implements OnInit, OnDestroy {

  emisionService = inject(EmisionService);
  readonly dialogRef = inject(MatDialogRef<DialogFormRegMovimientoComponent>);
  readonly data = inject<{ userId: number }>(MAT_DIALOG_DATA);
  subscriptionRegistrar!: Subscription;

  formRegistroMovimiento: FormGroup;
  loading = false;
  bolMsj = false;
  mensajeInfo = '';

  tiposPago = [
    { id: 'EF', tipo: 'Efectivo' },
    { id: 'QR', tipo: 'Yape' },
    { id: 'TA', tipo: 'Tarjeta' },
  ];

  constructor() {
    this.formRegistroMovimiento = new FormGroup({
      tipoComprobante: new FormControl({ value: 'GS', disabled: true }, Validators.required),
      serieComprobante: new FormControl({ value: '001', disabled: true }, Validators.required),
      numComprobante: new FormControl('', Validators.required),
      importe: new FormControl(null, Validators.required),
      tipoPago: new FormControl('EF', Validators.required),
      observaciones: new FormControl('', Validators.required)
    });
  }

  ngOnInit(): void {
    this.formRegistroMovimiento.get('tipoPago')?.setValue('EF');
  }
  
  ngOnDestroy(): void {
    if (this.subscriptionRegistrar) {
      this.subscriptionRegistrar.unsubscribe();
    }
  }
  
mostrarError(message:string): void {
  this.bolMsj = true;
  this.mensajeInfo = message;
  setTimeout(() => {
    this.bolMsj = false;
  }, 3000);
  }

  registrarMovimiento(): void {
    if (this.formRegistroMovimiento.invalid) {
      this.mostrarError('Complete los campos requeridos');
      return;
    }

    if(this.formRegistroMovimiento.get('importe')?.value! < 0){
      this.mostrarError('El importe no puede ser menor a 0');
      return;
    }

    let objRequest: IDetalleCajaRequestOtherIn = {
      serieComprobante: this.formRegistroMovimiento.get('serieComprobante')?.value!,
      numComprobante: this.formRegistroMovimiento.get('numComprobante')?.value!,
      importe: this.formRegistroMovimiento.get('importe')?.value!,
      tipoPago: this.formRegistroMovimiento.get('tipoPago')?.value!,
      descripcionPago: '',
      observaciones: this.formRegistroMovimiento.get('observaciones')?.value!,
      userId: this.data.userId,
      customerId: null,
    }

    this.loading = true;
    this.subscriptionRegistrar = this.emisionService.RegistrarMovimientosCajaOtrosIngresos(objRequest).subscribe({
      next: (data) => {
        console.log(data);
        this.loading = false;
        if (data.success) {
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
    });
  }

  cerrarDialog(): void {
    this.dialogRef.close(false);
  }


}
