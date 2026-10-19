import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MaestrosService } from '../../../../../recepcion/services/maestros.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { IBranchSalesCreateDto, IBranchSalesEditDto } from '../../../../../recepcion/interfaces/IBranchSales';
import { IPrinterResponseDto } from '../../../../../recepcion/interfaces/IPrinter';

@Component({
  selector: 'app-dialog-form-reg-sucursal',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule
  ],
  templateUrl: './dialog-form-reg-sucursal.component.html',
  styleUrl: './dialog-form-reg-sucursal.component.css'
})
export class DialogFormRegSucursalComponent implements OnInit {
  readonly data = inject<{ esNuevo: boolean, objSucursal: IBranchSalesEditDto }>(MAT_DIALOG_DATA);
  maestroService = inject(MaestrosService);
  sucursalForm: FormGroup;

  loadingSave = false;
  impresoras: IPrinterResponseDto[] = [];
  titulo = this.data.esNuevo ? 'Registrar Sucursal' : 'Actualizar Sucursal';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegSucursalComponent>,
  ) {

    this.sucursalForm = this.fb.group({
      id: 0,
      description: ['', Validators.required],
      address: ['', Validators.required],
      status: ['A', Validators.required],
      code: ['', Validators.required],
      defaultPrinterId: ['', Validators.required],
    });

  }

  ngOnInit(): void {
    this.cargarImpresoras();
    this.sucursalForm.reset();
    if (this.data.esNuevo) {
      this.sucursalForm.patchValue({ status: 'A' });
    } else {
      this.sucursalForm.patchValue(this.data.objSucursal);
    }
  }

  cargarImpresoras(): void {
    this.maestroService.obtenerImpresoras().subscribe({
      next: (response) => {
        this.impresoras = response.data;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  onSubmit(): void {
    if (this.sucursalForm.invalid) {
      return;
    }

    const sucursalData = this.sucursalForm.value;
    const sucursalDataCreate: IBranchSalesCreateDto = sucursalData;
    const sucursalDataUpdate: IBranchSalesEditDto = sucursalData;

    this.loadingSave = true;

    const request$ = this.data.esNuevo
      ? this.maestroService.crearSucursal(sucursalDataCreate)
      : this.maestroService.actualizarSucursal(sucursalDataUpdate);

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
