import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InputTrabajadorComponent } from './components/input-trabajador/input-trabajador.component';
import { MenuRopaComponent } from './components/menu-ropa/menu-ropa.component';
import { ObsRopaComponent } from './components/obs-ropa/obs-ropa.component';
import { TableDetalleTicketComponent } from './components/table-detalle-ticket/table-detalle-ticket.component';
import { ICreateTicketRequest, IDataPrenda } from '../../interfaces/Tickets';
import { TicketStoreService } from '../../services/ticket-store.service';


@Component({
  selector: 'app-roperia-tickets',
  standalone: true,
  imports: [
    InputTrabajadorComponent, TableDetalleTicketComponent,
    MenuRopaComponent, ObsRopaComponent,
    MatIconModule, MatButtonModule],
  templateUrl: './roperia-tickets.component.html',
  styleUrl: './roperia-tickets.component.css'
})
export class RoperiaTicketsComponent {
  store = inject(TicketStoreService);

  idWorker: number = 0;
  objPrenda: IDataPrenda;
  arrObs: string[] = [];

  constructor() {
    this.objPrenda = {
      idPrenda: 0,
      descripcion: ''
    }
  }


  addPrenda() {
    console.log(this.idWorker);
    console.log(this.objPrenda);
    console.log(this.arrObs);

    this.store.add({
      item: 1,
      IdPrenda: this.objPrenda.idPrenda,
      prenda: this.objPrenda.descripcion,
      observaciones: this.arrObs.join(',')
    });
   

  }

  registrarTicket() {
    console.log('Registrar Ticket');

    let objTicket: ICreateTicketRequest = {
      clothingWorkerId: this.idWorker,
      userRef: 1,
      ticketClothes: [
        {
          item: 1,
          clothingItemId: this.objPrenda.idPrenda,
          customObservations: 'Observaciones',
          observations: [
            {
              typeObservationId: 1,
              observationSectionId: 1,
              observations: 'Observaciones'
            }
          ]
        }
      ]
    }



  }

}
