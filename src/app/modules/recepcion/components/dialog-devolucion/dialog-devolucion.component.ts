import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { EmisionService } from '../../services/emision.service';
import { IDevolucionPrendaRequest } from '../../interfaces/IDevoluciones';
import { Subscription } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { ILoginResponseData } from '../../../../core/interfaces/ILoginResponse';
import { LoginService } from '../../../../core/services/login.service';

@Component({
  selector: 'app-dialog-devolucion',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatIcon, MatCheckboxModule, MatFormFieldModule, FormsModule, MatInputModule],
  templateUrl: './dialog-devolucion.component.html',
  styleUrl: './dialog-devolucion.component.css'
})
export class DialogDevolucionComponent implements OnInit, OnDestroy {
  readonly dialogRef = inject(MatDialogRef<DialogDevolucionComponent>);
  readonly data = inject<{ idItem: number, monto: number }>(MAT_DIALOG_DATA);
  emisionService = inject(EmisionService);
  loginService = inject(LoginService);
  devolucionSubscription!: Subscription;
  bolCargando = false;

  objForm = {
    isMonto: false,
    monto: 0
  };

  constructor() { }

  ngOnInit(): void {
    this.objForm.monto = this.data.monto;
  }

  ngOnDestroy(): void {
    if (this.devolucionSubscription) this.devolucionSubscription.unsubscribe();
  }


  onNoClick(): void {
    this.dialogRef.close({ ok: false });
  }

  onOk(): void {


    let objReq: IDevolucionPrendaRequest = {
      devolverEfectivo: this.objForm.isMonto,
      monto: this.objForm.monto,
      userId: this.loginService.getLoginData()?.userId || 0
    };

    console.log('objReq para devlocuion', objReq);


    this.bolCargando = true;
    this.devolucionSubscription = this.emisionService.DevolverPrendas(this.data.idItem, objReq).subscribe({
      next: (resp) => {
        console.log(resp);
        this.bolCargando = false;
        this.dialogRef.close({ ok: true, descontar: objReq.devolverEfectivo });
      },
      error: (err) => {
        console.log(err);
        this.bolCargando = false;
      }, complete: () => {
        console.log('complete() DevolverPrendas');
      }
    });

  }

}
