import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IListaItemsBusqueda } from '../../interfaces/IListaItemsBusqueda';
import { IListaCategorias } from '../../interfaces/IListaCategorias';
import { MatIconModule } from '@angular/material/icon';
import { EmisionStoreService } from '../../services/emision.store.service';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'app-dialog-categorias',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CurrencyPipe],
  templateUrl: './dialog-categorias.component.html',
  styleUrl: './dialog-categorias.component.css'
})
export class DialogCategoriasComponent implements OnInit {
  readonly store = inject(EmisionStoreService);
  readonly dialogRef = inject(MatDialogRef<DialogCategoriasComponent>);
  readonly data = inject<IListaCategorias>(MAT_DIALOG_DATA);
  categoria = this.data;

  items: IListaItemsBusqueda[] = [
    { id: 1, name: 'Edredon 2 PZ', price: 15 },
    { id: 2, name: 'Frazada Polar 2 PZ', price: 15 },
    { id: 3, name: 'Cubrecama 2 PZ', price: 15 },
    { id: 4, name: 'Frazada 2 PZ', price: 15 },
    { id: 5, name: 'Terno 2 piezas', price: 15 },
    { id: 6, name: 'Cubrecolchon', price: 10 },
    { id: 7, name: 'Juego de sabanas', price: 7 },
    { id: 8, name: 'Ropa por peso KG', price: 3 },
    { id: 9, name: 'Secado por peso KG', price: 3 },
    { id: 10, name: 'Planchado', price: 3 },
  ];

  ngOnInit(): void {
    console.log('la categoria es', this.categoria);
    this.cargarItemsPorCategoria();
  }

  cargarItemsPorCategoria() {
    //TODO: llamar api para cargar items
  }

  agregar(item: IListaItemsBusqueda) {
    console.log('enviando item a la grilla', item);
    this.store.add({ codProd: item.id.toString(), nomProd: item.name, Cant: 1, Precio: item.price, Subtotal: item.price, Obs: '[sin comentarios]' })
  }

  aceptar() {
    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }


}
