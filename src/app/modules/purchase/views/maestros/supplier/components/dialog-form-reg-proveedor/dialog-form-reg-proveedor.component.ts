import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { PurchaseSettingServiceService } from '../../../../../services/purchase-setting-service.service';
import { IResponseGeneric, ISupplierCreateRequest, ISupplierCreateResponse, ISupplierUpdateRequest } from '../../../../../interfaces/IMaestros';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-dialog-form-reg-proveedor',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dialog-form-reg-proveedor.component.html',
  styleUrl: './dialog-form-reg-proveedor.component.css'
})
export class DialogFormRegProveedorComponent {

  readonly data = inject<{ esNuevo: boolean, objSupplier: ISupplierCreateRequest }>(MAT_DIALOG_DATA);
  supplierService = inject(PurchaseSettingServiceService);
  supplierForm: FormGroup;

  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Proveedor' : 'Actualizar Proveedor';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegProveedorComponent>,
  ) {

    this.supplierForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      ruc: '',
      address: '',
      phone: '',
      email: '',
      status: ['', Validators.required],
      contactName: '',
      contactPhone: ''
    });
  }

  ngOnInit(): void {
    this.supplierForm.reset();
    if (this.data.esNuevo) {
      this.supplierForm.patchValue({ status: 'A' });
    } else {
      this.supplierForm.patchValue(this.data.objSupplier);
    }
  }


  onSubmit(): void {
    if (this.supplierForm.invalid) {
      return;
    }

    const SupplierData = this.supplierForm.value;
    const supllierDataCreate: ISupplierCreateRequest = SupplierData;
    const suplierDataUpdate: ISupplierUpdateRequest = SupplierData;


    this.loadingSave = true;

    const request$: Observable<IResponseGeneric<ISupplierCreateResponse> | IResponseGeneric<string>> = this.data.esNuevo
      ? this.supplierService.crearProveedor(supllierDataCreate)
      : this.supplierService.actualizarProveedor(suplierDataUpdate);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.dialogRef.close(resp);
      },
      error: (err: any) => {
        console.log(err);
        this.loadingSave = false;
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }

}
