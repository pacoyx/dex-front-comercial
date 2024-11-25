import { Component, Input } from '@angular/core';
import { IReportGuiasDetalleDetalleResponse } from '../../../../interfaces/IReports';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-table-detalle',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './table-detalle.component.html',
  styleUrl: './table-detalle.component.css'
})
export class TableDetalleComponent {

  @Input() dataSource: IReportGuiasDetalleDetalleResponse[] = [];

}
