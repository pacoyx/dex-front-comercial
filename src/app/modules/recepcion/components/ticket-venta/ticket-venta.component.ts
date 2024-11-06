import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit, effect } from '@angular/core';
import { EmisionStoreService } from '../../services/emision.store.service';

@Component({
  selector: 'app-ticket-venta',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, DatePipe],
  templateUrl: './ticket-venta.component.html',
  styleUrl: './ticket-venta.component.css'
})
export class TicketVentaComponent implements OnInit {
  readonly store = inject(EmisionStoreService);

  hora: string = '';  
  bol_cancelado: boolean = false;
  total = 0;
  adelanto = 0 ;
  saldo = 0 ;
  tipoPago='SP';
  isDelivery = false;

  constructor() {
    effect(() => {
      console.log('constructor reporte');
      this.total = this.store.itemSumTotal();
      this.adelanto = this.store.selectedPago()?.monto!;
      this.tipoPago = this.store.selectedPago()?.tipo!;
      this.isDelivery = this.store.selectedRecepcion() === 'D';
      this.saldo =  this.total - this.adelanto;  
      this.bol_cancelado = this.total === this.adelanto;  
    });
  }

  ngOnInit(): void {
    const f = new Date();
    this.hora = f.getHours() + ':' + f.getMinutes() + ':' + f.getSeconds();    
    
  }
}
