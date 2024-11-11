import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmisionService } from '../../../../services/emision.service';
import { Subscription } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { LoginService } from '../../../../../../core/services/login.service';
import { IAperturaCajaRequest } from '../../../../interfaces/ICajaVentas';
import { MatDialog } from '@angular/material/dialog';
import { DialogMsgComponent } from '../../../../components/dialog-msg/dialog-msg.component';

@Component({
  selector: 'app-caja-apertura',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, LoadingComponent],
  templateUrl: './caja-apertura.component.html',
  styleUrl: './caja-apertura.component.css'
})
export class CajaAperturaComponent implements OnInit, OnDestroy {
  emisionService = inject(EmisionService);
  loginService = inject(LoginService);
  readonly dialog = inject(MatDialog);
  frmApertura: FormGroup;
  loading = false;
  loadingCarga = false;
  estadoCaja = 'PENDIENTE';

  subscriptionApertura!: Subscription;
  subscriptionConsulta!: Subscription;
  fechaHoy = new Date().toLocaleDateString();

  constructor() {
    this.frmApertura = new FormGroup({
      saldoInicial: new FormControl('', [Validators.required]),
      observaciones: new FormControl(''),
      branchSalesId: new FormControl({ value: this.loginService.getLoginData()?.branchSales[0].branchSalesName, disabled: true }, [Validators.required]),
      workShiftId: new FormControl({ value: 'turno normal', disabled: true }, [Validators.required]),
      userId: new FormControl({ value: this.loginService.getLoginData()?.userName, disabled: true }, [Validators.required])
    });
  }
  ngOnDestroy(): void {
    if (this.subscriptionApertura) {
      this.subscriptionApertura.unsubscribe();
    }
    if (this.subscriptionConsulta) {
      this.subscriptionConsulta.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.obtenerCajaPorUsuario();
  }

  obtenerCajaPorUsuario(): void {
    this.loadingCarga = true;
    this.subscriptionConsulta = this.emisionService.ListarCajaPorIdUser(this.loginService.getLoginData()?.userId!).subscribe({
      next: (data) => {
        console.log(data);
        this.loadingCarga = false;

        if (data.success) {
          if (data.data) {
            this.estadoCaja = 'CAJA ABIERTA';
            this.frmApertura.disable();
          } else {
            this.estadoCaja = 'PENDIENTE';
            this.frmApertura.enable();
          }
        }

      },
      error: (err) => {
        console.log(err);
        this.loadingCarga = false;
      },
      complete: () => {
        console.log('complete obtenerCajaPorUsuario()');
      }
    });
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
      branchSalesId: this.loginService.getLoginData()?.branchSales[0].branchSalesId!,
      userId: this.loginService.getLoginData()?.userId!,
      workShiftId: 1,
      saldoInicial: this.frmApertura.get('saldoInicial')?.value,
      observaciones: this.frmApertura.get('observaciones')?.value
    }

    this.loading = true;
    this.subscriptionApertura = this.emisionService.AperturarCaja(objApertura).subscribe({
      next: (data) => {
        console.log(data);
        this.loading = false;

        if (data.success) {
          this.estadoCaja = 'CAJA ABIERTA';
          this.frmApertura.disable();
        }

      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
      complete: () => {
        console.log('complete registrarAperturaCaja()');
      }
    });



  }


}
