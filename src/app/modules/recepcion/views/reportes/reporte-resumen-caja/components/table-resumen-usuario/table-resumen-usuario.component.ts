import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';


interface DataResumenUsuario {
  usuario: string;
  totalIngreso: number;
}

@Component({
  selector: 'app-table-resumen-usuario',
  standalone: true,
  imports: [DecimalPipe, MatTableModule],
  templateUrl: './table-resumen-usuario.component.html',
  styleUrl: './table-resumen-usuario.component.css'
})
export class TableResumenUsuarioComponent {
  @Input() dataDetalleUsuario: DataResumenUsuario[] = [];
  @Output() dataDetalleUsuarioClick = new EventEmitter<string>();

  displayedColumns: string[] = [
    'item',
    'usuario',
    'totalIngreso',    
  ];

  tabledataSource = new MatTableDataSource<DataResumenUsuario>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataDetalleUsuario'] && changes['dataDetalleUsuario'].currentValue) {
      this.tabledataSource = new MatTableDataSource<DataResumenUsuario>(this.dataDetalleUsuario);
    }
  }

  getTotalIngreso() {
    return this.dataDetalleUsuario.map(t => t.totalIngreso).reduce((acc, value) => acc + value, 0);
  }

  onClickUsuario(usuario: string) {
    this.dataDetalleUsuarioClick.emit(usuario);
  }

}
