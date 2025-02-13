import { Injectable, computed } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { IEmisionCliente } from '../models/IEmisionCliente';
import { IEmisionItem } from '../models/IEmisionItems';
import { IEmisionPago } from '../models/IEmisionPago';
import { IEmisionDocumento } from '../models/IEmisionDocumento';


export type GuiaServicioState = {
  items: IEmisionItem[];
  selectedItem: IEmisionItem | null;
  cliente: IEmisionCliente | null;
  pago: IEmisionPago | null;
  documento: IEmisionDocumento | null;
  recepcion: string;
  usuario: string,
  bolsa: boolean
};

@Injectable({
  providedIn: 'root'
})
export class EmisionStoreService {

  private readonly guiaServicioState = signalState<GuiaServicioState>({
    items: [],
    selectedItem: null,
    cliente: null,
    pago: null,
    documento: null,
    recepcion: 'R',
    usuario: 'robot',
    bolsa: false
  });

  private idCounter = 1;
  alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  public readonly items = this.guiaServicioState.items;
  public readonly selectedItem = this.guiaServicioState.selectedItem;
  public readonly selectedCliente = this.guiaServicioState.cliente;
  public readonly selectedDocumento = this.guiaServicioState.documento;
  public readonly selectedPago = this.guiaServicioState.pago;
  public readonly selectedRecepcion = this.guiaServicioState.recepcion;
  public readonly selectedUser = this.guiaServicioState.usuario;
  public readonly selectedBolsa = this.guiaServicioState.bolsa;
  public readonly itemCounter = computed(() => this.items().length);
  public readonly itemSumTotal = computed(() => this.items().reduce((ant, act) => ant + act.Subtotal, 0));

  constructor() { }

  public resetState(): void {
    this.idCounter = 1;
    patchState(this.guiaServicioState, {
      items: [],
      selectedItem: null,
      cliente: null,
      pago: null,
      documento: null,
      recepcion: 'R',
      usuario: 'robot',
      bolsa: false
    });
  }

  public addRecepcion(recepcion: string): void {
    patchState(this.guiaServicioState, {
      recepcion: recepcion,
    });
  }

  public addBolsa(addBolsa: boolean): void {
    patchState(this.guiaServicioState, {
      bolsa: addBolsa,
    });
  }

  public addUser(user: string): void {
    patchState(this.guiaServicioState, {
      usuario: user,
    });
  }

  public add(item: Omit<IEmisionItem, 'id'>): void {
    const identifier = this.alphabet[(this.idCounter - 1) % this.alphabet.length];
    patchState(this.guiaServicioState, {
      items: [...this.guiaServicioState.items(), { ...item, id: this.idCounter++, Identificador: identifier }],
    });
  }

  public addCliente(cliente: IEmisionCliente): void {
    patchState(this.guiaServicioState, {
      cliente: cliente,
    });
  }

  public addDocumento(doc: IEmisionDocumento): void {
    patchState(this.guiaServicioState, { documento: doc });
  }

  public addPago(pago: IEmisionPago): void {
    patchState(this.guiaServicioState, { pago: pago });
  }

  public delete(id: number): void {
    const todos = this.items();
    patchState(this.guiaServicioState, {
      items: [...todos.filter((item) => item.id !== id)],
    });
  }

  public update(item: IEmisionItem): void {
    const indiceElemento = this.items().findIndex(el => el.id == item.id);
    let newItems = [...this.items()];
    // newItems[indiceElemento] = {...newItems[indiceElemento], tareaCompletada: true}
    newItems[indiceElemento] = item;
    patchState(this.guiaServicioState, {
      items: newItems
    });
  }

  public select(id: number): void {
    const todos = this.items();
    patchState(this.guiaServicioState, {
      selectedItem: todos.find((item) => item.id === id) || null,
    });
  }

}
