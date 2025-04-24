import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { PurchaseSettingServiceService } from '../../../../../services/purchase-setting-service.service';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import { IGetCategoriaProductoShortResponse, IGetUniMedidaShortResponse, IProductCreateRequest, IProductCreateResponse, IProductUpdateRequest, IResponseGeneric } from '../../../../../interfaces/IMaestros';

@Component({
  selector: 'app-dialogform-reg-product',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule,
    MatButtonModule, MatSelectModule
  ],
  templateUrl: './dialogform-reg-product.component.html',
  styleUrl: './dialogform-reg-product.component.css'
})
export class DialogformRegProductComponent {
  readonly data = inject<{ esNuevo: boolean, objProduct: IProductCreateRequest, objUM: IGetUniMedidaShortResponse[], objCP: IGetCategoriaProductoShortResponse[] }>(MAT_DIALOG_DATA);
  productService = inject(PurchaseSettingServiceService);
  productForm: FormGroup;

  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Producto' : 'Actualizar Producto';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogformRegProductComponent>,
  ) {

    this.productForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      description: '',
      price: '',
      stock: '',
      unitMeasurementId: '',
      categoryProdId: '',
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.productForm.reset();
    if (this.data.esNuevo) {
      this.productForm.patchValue({ status: 'A', price: 0, stock: 0, unitMeasurementId: 1, categoryProdId: 1});
    } else {
      this.productForm.patchValue(this.data.objProduct);
    }
  }


  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const ProductData = this.productForm.value;
    const productDataCreate: IProductCreateRequest = ProductData;
    const productDataUpdate: IProductUpdateRequest = ProductData;


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
        console.log(err);
        this.loadingSave = false;
      }
    });
  }


  onCancel(): void {
    this.dialogRef.close();
  }
}
