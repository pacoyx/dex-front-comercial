import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ICustomerPriceListDetail } from '../../../../../interfaces/ICustomerPriceList';
import { IPickupGuideStoreDetailLine } from '../../../../../interfaces/IPickupGuide';
import { PickupGuideDetailStoreService } from '../../pickup-guide-detail-store.service';

export interface IDialogAddItemGuideData {
  isAdd: boolean;
  objDetail: IPickupGuideStoreDetailLine | null;
  priceListDetails: ICustomerPriceListDetail[];
  isPesoMap: Map<number, boolean>;
}

@Component({
  selector: 'app-dialog-add-item-guide',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, DecimalPipe,
  ],
  templateUrl: './dialog-add-item-guide.component.html',
  styleUrl: './dialog-add-item-guide.component.css'
})
export class DialogAddItemGuideComponent {
  readonly data = inject<IDialogAddItemGuideData>(MAT_DIALOG_DATA);
  storeService = inject(PickupGuideDetailStoreService);

  titulo = this.data.isAdd ? 'Agregar Ítem' : 'Editar Ítem';

  selectedDetail: ICustomerPriceListDetail | null = null;
  quantity = 1;
  weight: number | null = null;
  observation = '';

  constructor(
    private dialogRef: MatDialogRef<DialogAddItemGuideComponent>,
  ) {
    if (!this.data.isAdd && this.data.objDetail) {
      const detail = this.data.objDetail;
      this.selectedDetail = this.data.priceListDetails.find(d => d.serviceItemId === detail.serviceItemId) ?? null;
      this.quantity = detail.quantity;
      this.weight = detail.weight ?? null;
      this.observation = detail.observation ?? '';
    }
  }

  get isPeso(): boolean {
    if (!this.selectedDetail) return false;
    return this.data.isPesoMap.get(this.selectedDetail.serviceItemId) ?? false;
  }

  get lineTotalPreview(): number {
    if (!this.selectedDetail) return 0;
    const cantidadBase = this.isPeso ? (this.weight ?? 0) : this.quantity;
    return cantidadBase * this.selectedDetail.unitPrice;
  }

  get isValid(): boolean {
    if (!this.selectedDetail) return false;
    return this.isPeso ? (this.weight ?? 0) > 0 : this.quantity > 0;
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (!this.isValid || !this.selectedDetail) {
      return;
    }

    const lineData = {
      serviceItemId: this.selectedDetail.serviceItemId,
      serviceItemName: this.selectedDetail.serviceItemName,
      isPeso: this.isPeso,
      unitPrice: this.selectedDetail.unitPrice,
      quantity: this.isPeso ? 1 : this.quantity,
      weight: this.isPeso ? this.weight : null,
      observation: this.observation || null,
      lineTotal: this.lineTotalPreview,
    };

    if (this.data.isAdd) {
      this.storeService.add(lineData);
    } else {
      this.storeService.update({ item: this.data.objDetail!.item, ...lineData });
    }

    this.dialogRef.close(true);
  }

}
