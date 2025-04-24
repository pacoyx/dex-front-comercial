import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PurchaseInvoiceStoreService } from '../../../../../services/purchase-invoice-store.service';
import { PurchaseStoreInvoiceDetail } from '../../../../../interfaces/IOperaciones';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddItemInvoicePurchaseComponent } from '../dialog-add-item-invoice-purchase/dialog-add-item-invoice-purchase.component';


@Component({
  selector: 'app-table-detail-invoice-purchase',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule, CurrencyPipe],
  templateUrl: './table-detail-invoice-purchase.component.html',
  styleUrl: './table-detail-invoice-purchase.component.css'
})
export class TableDetailInvoicePurchaseComponent {
  readonly store = inject(PurchaseInvoiceStoreService);
  dataSource = new MatTableDataSource<PurchaseStoreInvoiceDetail>([]);
  dialog = inject(MatDialog);
  total = 0;
  subTotal = 0;
  igv = 0;
  statusButton = false;

  displayedColumns: string[] = [
     'item',
    // 'productId',
    'productName',
    'unitMeasure',
    'price',
    'quantity',
    'total',
    'actions'
  ];

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.items();
      this.dataSource._updateChangeSubscription();
      this.total = this.store.itemSumTotal();

      this.subTotal = parseFloat((this.total / 1.18).toFixed(2));
      this.igv = parseFloat((this.total - this.subTotal).toFixed(2));

      this.statusButton = this.store.stateEmit();
    });
  }

  editItem(item: PurchaseStoreInvoiceDetail) {
    console.log('editItem', item);
    const dialogRef = this.dialog.open(DialogAddItemInvoicePurchaseComponent, {
          data: { isAdd: false, objDetail : item }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            console.log('Dialog result:', result);
          }
        });
  }

  deleteItem(item: PurchaseStoreInvoiceDetail) {
    console.log('deleteItem', item);
    this.store.deleteItem(item.item);
  }

  getTotalCost() {
    return this.dataSource.data.reduce((acc, item) => acc + item.total, 0);
  }
  

}
