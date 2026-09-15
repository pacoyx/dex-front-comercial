import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MaestrosService } from '../../../../../services/maestros.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IBranchSalesUserCreateDto, IBranchSalesUserEditDto, IUsuarioSistema } from '../../../../../interfaces/IBranchSales';

@Component({
  selector: 'app-dialog-form-sucursal-usuario',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule
  ],
  templateUrl: './dialog-form-sucursal-usuario.component.html',
  styleUrl: './dialog-form-sucursal-usuario.component.css'
})
export class DialogFormSucursalUsuarioComponent implements OnInit {
  readonly data = inject<{ esNuevo: boolean, branchId: number, objSucursalUsuario: IBranchSalesUserEditDto }>(MAT_DIALOG_DATA);
  maestroService = inject(MaestrosService);
  sucursalUsuarioForm: FormGroup;

  loadingSave = false;
  listaUsuarios: IUsuarioSistema[] = [];
  titulo = this.data.esNuevo ? 'Registrar Usuario' : 'Actualizar Usuario';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormSucursalUsuarioComponent>,
  ) {

    this.sucursalUsuarioForm = this.fb.group({
      id: 0,
      branchSalesId: [this.data.branchId, Validators.required],
      userId: ['', Validators.required],
      status: ['A', Validators.required],
    });

  }

  ngOnInit(): void {
    this.cargarUsuarios();

    if (this.data.esNuevo) {
      this.sucursalUsuarioForm.patchValue({ branchSalesId: this.data.branchId, status: 'A' });
    } else {
      this.sucursalUsuarioForm.patchValue(this.data.objSucursalUsuario);
    }
  }

  cargarUsuarios(): void {
    this.maestroService.obtenerUsuariosSistema().subscribe({
      next: (response) => {
        this.listaUsuarios = response.data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    if (this.sucursalUsuarioForm.invalid) {
      return;
    }

    const sucursalUsuarioData = this.sucursalUsuarioForm.value;
    const sucursalUsuarioDataCreate: IBranchSalesUserCreateDto = sucursalUsuarioData;
    const sucursalUsuarioDataUpdate: IBranchSalesUserEditDto = sucursalUsuarioData;

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.maestroService.crearSucursalUsuario(sucursalUsuarioDataCreate)
      : this.maestroService.actualizarSucursalUsuario(sucursalUsuarioDataUpdate);

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
