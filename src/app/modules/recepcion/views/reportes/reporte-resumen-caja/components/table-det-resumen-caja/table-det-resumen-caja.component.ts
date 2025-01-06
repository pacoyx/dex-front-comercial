import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IResumenCajaDetalle } from '../../../../../interfaces/IReports';
import { DecimalPipe } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-table-det-resumen-caja',
  standalone: true,
  imports: [DecimalPipe, MatTableModule],
  templateUrl: './table-det-resumen-caja.component.html',
  styleUrl: './table-det-resumen-caja.component.css'
})
export class TableDetResumenCajaComponent implements OnChanges {
  @Input() dataSource: IResumenCajaDetalle[] = [];
  @Input() tipoPago: string = '';


  displayedColumns: string[] = [
    'item',
    'comprobante',
    'cliente',
    'adelanto',
    'importe',
  ];

  secondFooterColumns: string[] = [    
    'tituloFooter',
    'totalFooter',
  ];

  tabledataSource = new MatTableDataSource<IResumenCajaDetalle>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] && changes['dataSource'].currentValue) {
      this.tabledataSource = new MatTableDataSource<IResumenCajaDetalle>(this.dataSource);
    }
  }

  getTotalAdelanto() {
    return this.dataSource.map(t => t.adelanto).reduce((acc, value) => acc + value, 0);
  }

  getTotalImporte() {
    return this.dataSource.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }

}
