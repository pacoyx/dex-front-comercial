import { Component, Input, SimpleChanges } from '@angular/core';
import { DataResumenCajaExpenseBox } from '../../../../../interfaces/IReports';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-table-resumen-gastos',
  standalone: true,
  imports: [DecimalPipe, MatTableModule, DatePipe],
  templateUrl: './table-resumen-gastos.component.html',
  styleUrl: './table-resumen-gastos.component.css'
})
export class TableResumenGastosComponent {
  @Input() dataDetalleExpense: DataResumenCajaExpenseBox[] = [];

  displayedColumns: string[] = [
    'item',
    'fechaGasto',
    'detallesEgreso',
    'importe',
  ];

  tabledataSource = new MatTableDataSource<DataResumenCajaExpenseBox>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataDetalleExpense'] && changes['dataDetalleExpense'].currentValue) {
      this.tabledataSource = new MatTableDataSource<DataResumenCajaExpenseBox>(this.dataDetalleExpense);
    }
  }

  getTotalGasto() {
    return this.dataDetalleExpense.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }


}
