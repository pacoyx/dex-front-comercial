import { Component, effect, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { InvoiceDetailStoreService } from '../../invoice-detail-store.service';
import { IInvoiceStoreDetailLine } from '../../../../../interfaces/IInvoices';
import { DialogAddItemFacturaComponent } from '../dialog-add-item-factura/dialog-add-item-factura.component';

@Component({
  selector: 'app-table-detalle-factura',
  standalone: true,
  imports: [MatTableModule, MatIconModule, MatButtonModule, MatTooltipModule, CurrencyPipe],
  templateUrl: './table-detalle-factura.component.html',
  styleUrl: './table-detalle-factura.component.css'
})
export class TableDetalleFacturaComponent {
  readonly store = inject(InvoiceDetailStoreService);
  dialog = inject(MatDialog);
  dataSource = new MatTableDataSource<IInvoiceStoreDetailLine>([]);
  total = 0;

  @Input() disabled = false;

  displayedColumns: string[] = ['item', 'description', 'quantity', 'unitPrice', 'discount', 'lineTotal', 'actions'];

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.items();
      this.dataSource._updateChangeSubscription();
      this.total = this.store.itemSumTotal();
    });
  }

  editItem(item: IInvoiceStoreDetailLine) {
    const dialogRef = this.dialog.open(DialogAddItemFacturaComponent, {
      data: { isAdd: false, objDetail: item }
    });
    dialogRef.afterClosed().subscribe();
  }

  deleteItem(item: IInvoiceStoreDetailLine) {
    this.store.deleteItem(item.item);
  }

}
