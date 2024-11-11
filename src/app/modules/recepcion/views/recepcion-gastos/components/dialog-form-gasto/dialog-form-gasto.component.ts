import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { IActualizarGastoRequest, ICreateGastoRequest } from '../../../../interfaces/IGastos';
import { LoginService } from '../../../../../../core/services/login.service';
import { EmisionService } from '../../../../services/emision.service';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';

@Component({
  selector: 'app-dialog-form-gasto',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions,
    MatDialogClose, MatButtonModule, MatIcon, FormsModule,
    MatFormFieldModule, MatInputModule, ReactiveFormsModule, MatSelectModule, LoadingComponent],
  templateUrl: './dialog-form-gasto.component.html',
  styleUrl: './dialog-form-gasto.component.css'
})
export class DialogFormGastoComponent implements OnInit {
  loginService = inject(LoginService);
  emisionService = inject(EmisionService);
  readonly data = inject<{ title: string, edicion: boolean, itemGasto: any }>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DialogFormGastoComponent>);

  frmGasto: FormGroup;
  fechaHoy = new Date().toDateString();
  loading = false;
  bolMensaje = false;
  errMensaje = '';

  categoriasGastos = [
    { id: 'COMPRAS', name: 'Gastos de compras' },
    { id: 'VUELTOS', name: 'Entrega de vueltos' },
    { id: 'TRANSPORTE', name: 'Gastos de transporte' },
    { id: 'MANTENIMIENTO', name: 'Gastos de mantenimiento' },
    { id: 'OTROS', name: 'Gastos de otros' },
  ];

  constructor() {
    this.frmGasto = new FormGroup({
      categoria: new FormControl('COMPRAS', [Validators.required]),
      personalAutoriza: new FormControl('', [Validators.required]),
      importe: new FormControl(null, [Validators.required]),
      detallesEgreso: new FormControl('', [Validators.required]),
    });

  }

  ngOnInit(): void {
    if (this.data.edicion) {
      this.frmGasto.patchValue(this.data.itemGasto);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave() {
    if (!this.frmGasto.valid) {
      this.bolMensaje = true;
      this.errMensaje = 'Debe ingresar todos los datos';
      setTimeout(() => {
        this.bolMensaje = false;
      }, 2000);
      return;
    }

    if (this.data.edicion) {
      this.actualizarGasto();
    } else {
      this.registrarGasto();
    }

  }

  registrarGasto() {
    let objRequest: ICreateGastoRequest = {
      categoriaGasto: this.frmGasto.get('categoria')!.value,
      personalAutoriza: this.frmGasto.get('personalAutoriza')!.value,
      importe: this.frmGasto.get('importe')!.value,
      detallesEgreso: this.frmGasto.get('detallesEgreso')!.value,
      estadoRegistro: 'A',
      userId: this.loginService.getLoginData()?.userId!
    };

    this.loading = true;
    this.bolMensaje = false;
    this.emisionService.RegistrarGasto(objRequest).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        if (res.success) {
          this.bolMensaje = true;
          this.errMensaje = 'Gasto registrado correctamente';
          setTimeout(() => {
            this.dialogRef.close(true);
          }, 2000);
        }
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
        this.bolMensaje = true;
        this.errMensaje = 'Error al registrar el gasto';
        setTimeout(() => {
          this.bolMensaje = false;
        }, 2000);

      },
      complete: () => {
        console.log('complete RegistrarGasto()');
      }
    });
  }

  actualizarGasto() {
    let objRequest: IActualizarGastoRequest = {
      categoryGasto: this.frmGasto.get('categoria')!.value,
      personalAutoriza: this.frmGasto.get('personalAutoriza')!.value,
      importe: this.frmGasto.get('importe')!.value,
      detallesEgreso: this.frmGasto.get('detallesEgreso')!.value,
    };
    this.loading = true;
    this.emisionService.ActualizarGasto(this.data.itemGasto.id, objRequest).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        if (res.success) {
          this.bolMensaje = true;
          this.errMensaje = 'Gasto actualizado correctamente';
          setTimeout(() => {
            this.dialogRef.close(true);
          }, 2000);
        }
      },
      error: (err) => {
        console.log(err);
        this.loading = false;

        this.bolMensaje = true;
        this.errMensaje = 'Error al actualizar el gasto';
        setTimeout(() => {
          this.bolMensaje = false;
        }, 2000);
      },
      complete: () => {
        console.log('complete ActualizarGasto()');
      }
    });
  }


}
