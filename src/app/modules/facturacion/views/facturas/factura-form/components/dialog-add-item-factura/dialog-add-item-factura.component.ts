import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AsyncPipe, DecimalPipe, NgFor, TitleCasePipe } from '@angular/common';
import { CatalogosService } from '../../../../../services/catalogos.service';
import { InvoiceDetailStoreService } from '../../invoice-detail-store.service';
import { IInvoiceStoreDetailLine } from '../../../../../interfaces/IInvoices';
import { IProdServiceSearchResult } from '../../../../../interfaces/ICatalogos';

@Component({
  selector: 'app-dialog-add-item-factura',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIcon, MatButtonModule, FormsModule,
    ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, TitleCasePipe,
    AsyncPipe, NgFor, DecimalPipe
  ],
  templateUrl: './dialog-add-item-factura.component.html',
  styleUrl: './dialog-add-item-factura.component.css'
})
export class DialogAddItemFacturaComponent implements OnInit {
  readonly data = inject<{ isAdd: boolean, objDetail: IInvoiceStoreDetailLine }>(MAT_DIALOG_DATA);
  catalogosService = inject(CatalogosService);
  invoiceStoreService = inject(InvoiceDetailStoreService);

  titulo = this.data.isAdd ? 'Agregar Producto/Servicio' : 'Editar Producto/Servicio';

  productControl = new FormControl();
  filteredProducts!: Observable<IProdServiceSearchResult[]>;

  productoId = 0;
  productoNombre = '';
  cantidad = 1;
  precioUnitario = 0.0;
  descuento = 0.0;

  constructor(
    private dialogRef: MatDialogRef<DialogAddItemFacturaComponent>,
  ) {
    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        return this.catalogosService.buscarServiciosPorPatron(value);
      }));
  }

  ngOnInit(): void {
    if (this.data.isAdd) {
      this.productControl.setValue(null);
    } else {
      this.productControl.setValue(this.data.objDetail.description);
      this.productoId = this.data.objDetail.productId;
      this.productoNombre = this.data.objDetail.description;
      this.cantidad = this.data.objDetail.quantity;
      this.precioUnitario = this.data.objDetail.unitPrice;
      this.descuento = this.data.objDetail.discount;
    }
  }

  onProductSelected(event: any) {
    const product = event.option.value;
    this.productoId = product.id;
    this.productoNombre = product.name;
    this.precioUnitario = product.price;
  }

  displayFn(product: any): string {
    return product && product.name ? product.name : product;
  }

  clearProduct(event: Event): void {
    event.stopPropagation();
    this.productControl.setValue(null);
    this.productoId = 0;
    this.productoNombre = '';
  }

  get lineTotalPreview(): number {
    return (this.cantidad * this.precioUnitario) - this.descuento;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (!this.productoId || this.cantidad <= 0 || this.precioUnitario < 0 || this.descuento < 0) {
      return;
    }

    const lineData = {
      productId: this.productoId,
      description: this.productoNombre,
      quantity: this.cantidad,
      unitPrice: this.precioUnitario,
      discount: this.descuento,
      lineTotal: this.lineTotalPreview,
    };

    if (this.data.isAdd) {
      this.invoiceStoreService.add(lineData);
    } else {
      this.invoiceStoreService.update({ item: this.data.objDetail.item, ...lineData });
    }

    this.dialogRef.close(true);
  }

}
