import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { PurchaseSettingServiceService } from '../../../../../services/purchase-setting-service.service';
import { ICategoryProd, IResponseGeneric } from '../../../../../interfaces/IMaestros';
import { extractErrorMessage } from '../../../../../shared/http-error.util';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dialog-form-reg-category-prod',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule,
    MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './dialog-form-reg-category-prod.component.html',
  styleUrl: './dialog-form-reg-category-prod.component.css'
})
export class DialogFormRegCategoryProdComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, objCategoria: ICategoryProd | null }>(MAT_DIALOG_DATA);
  private purchaseSettingService = inject(PurchaseSettingServiceService);
  private notificationService = inject(NotificationsSystemService);

  categoriaForm: FormGroup;
  loadingSave = false;
  titulo = this.data.esNuevo ? 'Registrar Categoría de Producto' : 'Actualizar Categoría de Producto';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegCategoryProdComponent>,
  ) {
    this.categoriaForm = this.fb.group({
      id: 0,
      name: ['', Validators.required],
      description: '',
      status: ['A', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.objCategoria) {
      this.categoriaForm.patchValue(this.data.objCategoria);
    }
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      return;
    }

    this.loadingSave = true;
    const formValue = this.categoriaForm.value;

    const request$: Observable<IResponseGeneric<ICategoryProd> | IResponseGeneric<string>> = this.data.esNuevo
      ? this.purchaseSettingService.crearCategoriaProducto(formValue)
      : this.purchaseSettingService.actualizarCategoriaProducto(formValue);

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(
          this.data.esNuevo ? 'Categoría registrada correctamente.' : 'Categoría actualizada correctamente.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar la categoría de producto.'));
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
