import { Component, Input } from '@angular/core';
import { IResumenCajaDetalle } from '../../../../../interfaces/IReports';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-table-det-resumen-caja',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './table-det-resumen-caja.component.html',
  styleUrl: './table-det-resumen-caja.component.css'
})
export class TableDetResumenCajaComponent {
  @Input() dataSource: IResumenCajaDetalle[] = [];
  @Input() tipoPago: string = '';


  getTotalAdelanto() {
    return this.dataSource.map(t => t.adelanto).reduce((acc, value) => acc + value, 0);
  }

  getTotalImporte() {
    return this.dataSource.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }

}
