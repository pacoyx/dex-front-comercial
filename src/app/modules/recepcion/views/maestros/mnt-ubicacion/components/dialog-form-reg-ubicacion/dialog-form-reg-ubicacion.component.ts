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
import { IUbicacionesCreateResponseDto, IUbicacionesEditDto } from '../../../../../interfaces/IUbicaciones';

@Component({
  selector: 'app-dialog-form-reg-ubicacion',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule
  ],
  templateUrl: './dialog-form-reg-ubicacion.component.html',
  styleUrl: './dialog-form-reg-ubicacion.component.css'
})
export class DialogFormRegUbicacionComponent implements OnInit {
  readonly data = inject<{ esNuevo: boolean, objUbicacion: IUbicacionesEditDto }>(MAT_DIALOG_DATA);
  maestroService = inject(MaestrosService);
  ubicacionForm: FormGroup;

  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Ubicación' : 'Actualizar Ubicación';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegUbicacionComponent>,
  ) {

    this.ubicacionForm = this.fb.group({
      id: 0,
      nombre: ['', Validators.required],
      descripcion: '',
    });
  }

  ngOnInit(): void {
    this.ubicacionForm.reset();
    if (this.data.esNuevo) {

    } else {

    console.log(this.data.objUbicacion);


      this.ubicacionForm.patchValue(this.data.objUbicacion);
    }
  }


  onSubmit(): void {
    if (this.ubicacionForm.invalid) {
      return;
    }

    const ubicacionData = this.ubicacionForm.value;
    const ubicacionDataCreate: IUbicacionesCreateResponseDto = ubicacionData;
    const ubicacionDataUpdate: IUbicacionesEditDto = ubicacionData;


    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.maestroService.crearUbicacion(ubicacionDataCreate)
      : this.maestroService.actualizarUbicacion(ubicacionDataUpdate);

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
