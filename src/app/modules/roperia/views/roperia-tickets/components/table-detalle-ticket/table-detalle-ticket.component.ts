import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TicketStoreService } from '../../../../services/ticket-store.service';


export interface IDetalleTicket {
  item: number;
  prenda: string;
  observaciones: string;
}

const ELEMENT_DATA: IDetalleTicket[] = [
  { item: 1, prenda: 'camisa', observaciones: 'A1,A2,R3' },
  { item: 1, prenda: 'pantalon', observaciones: 'A1,A2,R3' },

];

@Component({
  selector: 'app-table-detalle-ticket',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './table-detalle-ticket.component.html',
  styleUrl: './table-detalle-ticket.component.css'
})
export class TableDetalleTicketComponent {

  store = inject(TicketStoreService);

  displayedColumns: string[] = ['prenda', 'observaciones', 'acciones'];
  // dataSource = ELEMENT_DATA;

  // dataSource = new MatTableDataSource<IEmisionPrevia>(this.store.items());
  dataSource = new MatTableDataSource<IDetalleTicket>([]);

  constructor() {
    effect(() => {
      this.dataSource.data = this.store.items();
    });
  }

  deleteItem(item: number) {
    this.store.delete(item);
  }


}
