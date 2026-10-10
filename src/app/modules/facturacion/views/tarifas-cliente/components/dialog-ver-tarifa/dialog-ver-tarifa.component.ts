import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ICustomerPriceList } from '../../../../interfaces/IPriceList';

export interface IDialogVerTarifaData {
  tarifa: ICustomerPriceList;
}

@Component({
  selector: 'app-dialog-ver-tarifa',
  standalone: true,
  imports: [MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, MatTableModule, CurrencyPipe, DatePipe],
  templateUrl: './dialog-ver-tarifa.component.html',
  styleUrl: './dialog-ver-tarifa.component.css'
})
export class DialogVerTarifaComponent {
  readonly data = inject<IDialogVerTarifaData>(MAT_DIALOG_DATA);

  displayedColumns: string[] = ['serviceItemName', 'unitPrice'];

  constructor(
    private dialogRef: MatDialogRef<DialogVerTarifaComponent>,
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

}
