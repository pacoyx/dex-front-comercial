import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { IClienteCreate, IClienteUpdate } from '../../../../../interfaces/IClienteCreate';
import { MaestrosService } from '../../../../../services/maestros.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-dialog-form-reg-cliente',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule
  ],
  templateUrl: './dialog-form-reg-cliente.component.html',
  styleUrl: './dialog-form-reg-cliente.component.css'
})
export class DialogFormRegClienteComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, objCliente: IClienteCreate }>(MAT_DIALOG_DATA);
  clienteService = inject(MaestrosService);
  clienteForm: FormGroup;

  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Cliente' : 'Actualizar Cliente';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegClienteComponent>,
  ) {

    this.clienteForm = this.fb.group({
      id: 0,
      firstName: ['', Validators.required],
      lastName: '',
      address: '',
      phone: '',
      email: '',
      docPersonal: '',
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.clienteForm.reset();
    if (this.data.esNuevo) {      
      this.clienteForm.patchValue({ status: 'A' });
    } else {      
      this.clienteForm.patchValue(this.data.objCliente);
      this.clienteForm.get('firstName')?.setValue(this.data.objCliente.firstName);
    }
  }


  onSubmit(): void {
    if (this.clienteForm.invalid) {
      return;
    }

    const clienteData = this.clienteForm.value;
    const clienteDataCreate: IClienteCreate = clienteData;
    const clienteDataUpdate: IClienteUpdate = clienteData;


    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.clienteService.registrarCliente(clienteDataCreate)
      : this.clienteService.actualizarCliente(clienteDataUpdate);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.dialogRef.close(resp);
      },
      error: (err) => {
        console.log(err);
        this.loadingSave = false;
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }

}
