import { Component, OnInit, output } from '@angular/core';
import { IDataPrenda, IResponseServiceQuickAccess } from '../../../../interfaces/Tickets';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-menu-ropa',
  standalone: true,
  imports: [NgClass],
  templateUrl: './menu-ropa.component.html',
  styleUrl: './menu-ropa.component.css'
})
export class MenuRopaComponent implements OnInit {
  dataServiciosAccesosRapido: IResponseServiceQuickAccess[] = [];
  selectedItemId: number | null = null;
  prendaEvent = output<IDataPrenda>();
  obsPrenda: string[] = [];

  onItemClick(itemId: number): void {
    this.selectedItemId = itemId;
    this.prendaEvent.emit({
      idPrenda: itemId,
      descripcion: this.dataServiciosAccesosRapido.find(x => x.id === itemId)!.shortName      
    });
  }

  isSelected(itemId: number): boolean {
    return this.selectedItemId === itemId;
  }


  constructor() {

  }

  ngOnInit(): void {
    this.cargarMenuRopa();
  }


  cargarMenuRopa() {
    this.dataServiciosAccesosRapido.push(
      {
        id: 1,
        iconName: 'camisa.png',
        shortName: 'Camisa'
      },
      {
        id: 2,
        iconName: 'pantalon.png',
        shortName: 'Pantalon'
      },
      {
        id: 3,
        iconName: 'casaca.png',
        shortName: 'Casaca'
      },
      {
        id: 4,
        iconName: 'chompa.png',
        shortName: 'Chompa'
      },
      {
        id: 5,
        iconName: 'saco.png',
        shortName: 'Bata'
      }
    );
  }

}
