import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { PurchaseSettingServiceService } from '../../../../../services/purchase-setting-service.service';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { IGetCategoriaProductoShortResponse, IGetUniMedidaShortResponse, IProductCreateRequest, IProductCreateResponse, IProductUpdateRequest, IResponseGeneric } from '../../../../../interfaces/IMaestros';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialogform-reg-product',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule,
    MatButtonModule, MatSelectModule, MatSlideToggleModule
  ],
  templateUrl: './dialogform-reg-product.component.html',
  styleUrl: './dialogform-reg-product.component.css'
})
export class DialogformRegProductComponent {
  readonly data = inject<{ esNuevo: boolean, objProduct: IProductCreateRequest, objUM: IGetUniMedidaShortResponse[], objCP: IGetCategoriaProductoShortResponse[] }>(MAT_DIALOG_DATA);
  productService = inject(PurchaseSettingServiceService);
  productForm: FormGroup;

  loadingSave = false;
  errorMessage = '';
  titulo = this.data.esNuevo ? 'Registrar Producto' : 'Actualizar Producto';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogformRegProductComponent>,
  ) {

    this.productForm = this.fb.group({
      id: 0,
      code: ['', Validators.maxLength(30)],
      name: ['', Validators.required],
      description: '',
      price: '',
      // El stock es informativo: sale de los movimientos de inventario y no se edita aquí.
      stock: [{ value: 0, disabled: true }],
      unitMeasurementId: '',
      categoryProdId: '',
      status: ['', Validators.required],
      tracksStock: true,
      minStock: [0, Validators.min(0)],
      isSellable: false
    });
  }

  ngOnInit(): void {
    if (this.data.esNuevo) {
      this.productForm.patchValue({ status: 'A', price: 0, stock: 0, unitMeasurementId: 1, categoryProdId: 1, tracksStock: true, minStock: 0, isSellable: false });
    } else {
      this.productForm.patchValue({
        ...this.data.objProduct,
        tracksStock: this.data.objProduct.tracksStock ?? true,
        minStock: this.data.objProduct.minStock ?? 0,
        isSellable: this.data.objProduct.isSellable ?? false
      });
    }
  }


  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const code = (this.productForm.value.code || '').trim();
    const ProductData = { ...this.productForm.getRawValue(), code: code || null };
    const productDataCreate: IProductCreateRequest = ProductData;
    const productDataUpdate: IProductUpdateRequest = ProductData;

    this.errorMessage = '';
    this.loadingSave = true;

    const request$: Observable<IResponseGeneric<IProductCreateResponse> | IResponseGeneric<string>> = this.data.esNuevo
      ? this.productService.crearProducto(productDataCreate)
      : this.productService.actualizarProducto(productDataUpdate);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.dialogRef.close(resp);
      },
      error: (err: any) => {
        this.loadingSave = false;
        // Reglas del backend (p. ej. código duplicado o desactivar el control de un producto con existencias).
        const validation = extractValidationErrors(err);
        this.errorMessage = validation.length > 0
          ? validation.join(' ')
          : extractErrorMessage(err, 'No se pudo grabar el producto.');
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  onBlurName(){
    let nombre =  this.productForm.get('name')?.value
    let descripcion =  this.productForm.get('description')?.value
    if(descripcion == null || descripcion == ''){
      this.productForm.get('description')?.setValue(nombre);
    }
  }
}
