import { Component, inject, OnDestroy, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmisionService } from '../../../../services/emision.service';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { LoginService } from '../../../../../../core/services/login.service';
import { IAperturaCajaRequest, IListarCajaPorUsuarioResponse } from '../../../../interfaces/ICajaVentas';
import { MatDialog } from '@angular/material/dialog';
import { DialogMsgComponent } from '../../../../components/dialog-msg/dialog-msg.component';
import { ILoginResponseData } from '../../../../../../core/interfaces/ILoginResponse';
import { NotificationServiceService } from '../../../../services/notification-service.service';

@Component({
  selector: 'app-caja-apertura',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, LoadingComponent],
  templateUrl: './caja-apertura.component.html',
  styleUrl: './caja-apertura.component.css'
})
export class CajaAperturaComponent implements OnInit, OnDestroy, OnChanges {
  @Input() dataCaja!: IListarCajaPorUsuarioResponse;
  @Input() dataLogin!: ILoginResponseData;
  @Input() dataEstadoCaja!: string;

  emisionService = inject(EmisionService);
  readonly dialog = inject(MatDialog);
  notificationService = inject(NotificationServiceService);

  frmApertura: FormGroup;
  loading = false;
  loadingCarga = false;
  estadoCaja = 'PENDIENTE';

  subscriptionApertura!: Subscription;
  fechaHoy = new Date().toLocaleDateString();

  constructor() {
    this.frmApertura = new FormGroup({
      saldoInicial: new FormControl('', [Validators.required]),
      observaciones: new FormControl(''),
      branchSalesId: new FormControl({ value: '', disabled: true }, [Validators.required]),
      workShiftId: new FormControl({ value: 'turno normal', disabled: true }, [Validators.required]),
      userId: new FormControl({ value: '', disabled: true }, [Validators.required])
    });
  }

  ngOnDestroy(): void {
    if (this.subscriptionApertura) {
      this.subscriptionApertura.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataLogin'] && changes['dataLogin'].currentValue) {
      this.frmApertura.get('branchSalesId')?.setValue(this.dataLogin.branchSales[0].branchSalesName!);
      this.frmApertura.get('userId')?.setValue(this.dataLogin.userName);
    }

    // if (changes['dataCaja'] && changes['dataCaja'].currentValue) {
    //   this.validarCajaPorUsuario();
    // }

    if (changes['dataEstadoCaja'] && changes['dataEstadoCaja'].currentValue) {
      this.validarCajaPorUsuario();
    }
  }

  ngOnInit(): void {
    // this.validarCajaPorUsuario();
    this.frmApertura.get('branchSalesId')?.setValue(this.dataLogin.branchSales[0].branchSalesName!);
    this.frmApertura.get('userId')?.setValue(this.dataLogin.userName);
    this.frmApertura.get('observaciones')?.setValue('Sin observaciones');
  }

  validarCajaPorUsuario(): void {

    if (this.dataEstadoCaja === 'OPEN') {
      this.estadoCaja = 'CAJA ABIERTA';
      this.frmApertura.get('saldoInicial')?.setValue(this.dataCaja.saldoInicial);
      this.frmApertura.get('observaciones')?.setValue(this.dataCaja.observaciones);
      this.frmApertura.disable();

    } else {
      this.estadoCaja = 'PENDIENTE';
      this.frmApertura.reset();
      this.frmApertura.get('branchSalesId')?.setValue(this.dataLogin.branchSales[0].branchSalesName!);
      this.frmApertura.get('userId')?.setValue(this.dataLogin.userName);
      this.frmApertura.get('workShiftId')?.setValue('turno normal');
      this.frmApertura.enable();
    }
  }

  registrarAperturaCaja(): void {

    if (this.frmApertura.invalid) {
      this.dialog.open(DialogMsgComponent,
        {
          data:
          {
            title: 'Error',
            msg: 'Ingrese el saldo inicial.',
            err: true
          }
        });
      return;
    }

    if (this.frmApertura.get('observaciones')?.value === '') {
      this.frmApertura.get('observaciones')?.setValue('Sin observaciones');
    }


    if (this.estadoCaja === 'CAJA ABIERTA') {
      this.dialog.open(DialogMsgComponent,
        {
          data:
          {
            title: 'Error',
            msg: 'La caja esta abierta, debe hacer el arqueo y cerrar caja.',
            err: true
          }
        });
      return;
    }


    let objApertura: IAperturaCajaRequest = {
      branchSalesId: this.dataLogin.branchSales[0].branchSalesId!,
      userId: this.dataLogin.userId!,
      workShiftId: 1,
      saldoInicial: this.frmApertura.get('saldoInicial')?.value,
      observaciones: this.frmApertura.get('observaciones')?.value
    }

    this.loading = true;
    this.subscriptionApertura = this.emisionService.AperturarCaja(objApertura).subscribe({
      next: (data) => {
        this.loading = false;
        if (data.success) {
          this.estadoCaja = 'CAJA ABIERTA';
          this.frmApertura.disable();
          this.notificationService.showSuccess('Caja abierta correctamente.');
        }
      },
      error: (err) => {
        console.log(err.error);
        this.loading = false;
        this.notificationService.showError('Error al abrir caja.');
      },
      complete: () => {
        console.log('complete registrarAperturaCaja()');
      }
    });
  }


}
