import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AsyncPipe, NgFor, TitleCasePipe } from '@angular/common';
import { IProductListarPatronResponse } from '../../../../../interfaces/IMaestros';
import { PurchaseSettingServiceService } from '../../../../../services/purchase-setting-service.service';
import { PurchaseInvoiceStoreService } from '../../../../../services/purchase-invoice-store.service';
import { PurchaseStoreInvoiceDetail } from '../../../../../interfaces/IOperaciones';

@Component({
  selector: 'app-dialog-add-item-invoice-purchase',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIcon, MatButtonModule, FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule, MatFormFieldModule, MatInputModule, TitleCasePipe, AsyncPipe, NgFor
  ],
  templateUrl: './dialog-add-item-invoice-purchase.component.html',
  styleUrl: './dialog-add-item-invoice-purchase.component.css'
})
export class DialogAddItemInvoicePurchaseComponent implements OnInit {
  readonly data = inject<{ isAdd: boolean, objDetail: PurchaseStoreInvoiceDetail }>(MAT_DIALOG_DATA);
  purchaseSettingService = inject(PurchaseSettingServiceService);
  invoiceStoreService = inject(PurchaseInvoiceStoreService);

  loadingSave = false;
  titulo = this.data.isAdd ? 'Agregar Item' : 'Editar Item';

  productControl = new FormControl();
  filteredProducts!: Observable<IProductListarPatronResponse[]>;

  productoId = 0;
  productoNombre = '';
  unidadMedida = '';
  unidadMedidaId = 0;
  cantidad = 1;
  precioUnitario = 0.0;

  constructor(
    private dialogRef: MatDialogRef<DialogAddItemInvoicePurchaseComponent>,
  ) {

    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (value === '') {
          return of([]);
        }

        if (typeof value === 'object') {
          return of([value]);
        }

        return this.purchaseSettingService.listarProductosPorPatron(value).pipe(
          map(response => response.data),
        );
      }));
  }
  ngOnInit(): void {
    if (this.data.isAdd) {
      this.productControl.setValue(null);
    }
    else {
      this.productControl.setValue(this.data.objDetail.productName);
      this.cantidad = this.data.objDetail.quantity;
      this.precioUnitario = this.data.objDetail.price;
      this.unidadMedidaId = this.data.objDetail.unitMeasurementId;
      this.unidadMedida = this.data.objDetail.unitMeasurement;
      this.productoNombre = this.data.objDetail.productName;
      this.productoId = this.data.objDetail.productId;
    }
  }

  onProductSelected(event: any) {
    const product = event.option.value;
    this.precioUnitario = product.price;
    this.productoId = product.id;
    this.productoNombre = product.name;
    this.unidadMedida = product.unitMeasurementDescription;
  }

  displayFn(product: any): string {
    var returnDisplay = product && product.name ? product.name : product;
    return returnDisplay;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {


    if (this.data.isAdd) {

      this.invoiceStoreService.add({
        item: 0,
        productId: this.productoId,
        productName: this.productoNombre,
        unitMeasurementId: this.unidadMedidaId,
        unitMeasurement: this.unidadMedida,
        quantity: this.cantidad,
        price: this.precioUnitario,
        total: this.cantidad * this.precioUnitario
      });
    } else {
      this.invoiceStoreService.update({
        item: this.data.objDetail.item,
        productId: this.productoId,
        productName: this.productoNombre,
        unitMeasurementId: this.unidadMedidaId,
        unitMeasurement: this.unidadMedida,
        quantity: this.cantidad,
        price: this.precioUnitario,
        total: this.cantidad * this.precioUnitario
      });
    }

    this.dialogRef.close(true);
  }

}
