import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MaestrosService } from '../../../../../services/maestros.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IActuaizarProdServicesRequest, ICrearProdServicesRequest } from '../../../../../interfaces/IProdServices';
import { MatSelectModule } from '@angular/material/select';
import { EmisionService } from '../../../../../services/emision.service';
import { IListaCategorias } from '../../../../../interfaces/IListaCategorias';

@Component({
  selector: 'app-dialog-form-reg-prod-service',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dialog-form-reg-prod-service.component.html',
  styleUrl: './dialog-form-reg-prod-service.component.css'
})
export class DialogFormRegProdServiceComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, objServicio: ICrearProdServicesRequest, idServicio:number }>(MAT_DIALOG_DATA);
  clienteService = inject(MaestrosService);
  emisionService = inject(EmisionService);
  servicioForm: FormGroup;

  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Servicio' : 'Actualizar Servicio';


  services: IListaCategorias[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegProdServiceComponent>,
  ) {

    this.servicioForm = this.fb.group({
      name: ['', Validators.required],
      description: '',
      price: 0,
      status: ['', Validators.required],
      catServiceId: 0,
      isPeso: '',
      isLavado: ''
    });
  }

  ngOnInit(): void {
    this.cargarCategorias();
    this.servicioForm.reset();
    if (this.data.esNuevo) {
      this.servicioForm.patchValue({ status: 'A' });
    } else {
      this.servicioForm.patchValue(this.data.objServicio);      
    }
  }

  cargarCategorias(): void {
    this.emisionService.listarCategoriasSevicios().subscribe({
      next: (resp) => {
        this.services = resp;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  onSubmit(): void {
    if (this.servicioForm.invalid) {
      return;
    }

    const servicioData = this.servicioForm.value;
    const servicioDataDataCreate: ICrearProdServicesRequest = servicioData;
    const servicioDataDataUpdate: IActuaizarProdServicesRequest = servicioData;


    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.clienteService.registrarProdService(servicioDataDataCreate)
      : this.clienteService.actualizarProdService(servicioDataDataUpdate, this.data.idServicio);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        if(resp.success){
          this.dialogRef.close(resp);
        }
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
