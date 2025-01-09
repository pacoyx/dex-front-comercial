import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { ICajasPorFecha } from '../../../../../interfaces/IReports';


interface DataResumenUsuario {
  usuario: string;
  totalIngreso: number;
}

@Component({
  selector: 'app-table-resumen-usuario',
  standalone: true,
  imports: [DecimalPipe, MatTableModule, DatePipe],
  templateUrl: './table-resumen-usuario.component.html',
  styleUrl: './table-resumen-usuario.component.css'
})
export class TableResumenUsuarioComponent {
  @Input() dataDetalleUsuario: ICajasPorFecha[] = [];
  @Output() dataDetalleUsuarioClick = new EventEmitter<number>();

  displayedColumns: string[] = [
    'item',
    'cajaId',
    'usuario',
    'fechaHoraApertura',
    'saldoInicial',
    'saldoFinal',
    'totalIngreso',
    'totalSalida',
    'estadoCaja'
  ];

  tabledataSource = new MatTableDataSource<ICajasPorFecha>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataDetalleUsuario'] && changes['dataDetalleUsuario'].currentValue) {
      this.tabledataSource = new MatTableDataSource<ICajasPorFecha>(this.dataDetalleUsuario);
    }
  }

  getTotalIngreso() {
    return this.dataDetalleUsuario.map(t => t.totalIngreso).reduce((acc, value) => acc + value, 0);
  }

  onClickUsuario(userId: number) {
    this.dataDetalleUsuarioClick.emit(userId);
  }

}
