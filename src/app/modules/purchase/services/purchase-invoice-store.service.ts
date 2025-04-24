import { computed, Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { PurchaseStoreInvoiceDetail } from '../interfaces/IOperaciones';


export type InvoiceStateType = {
  items: PurchaseStoreInvoiceDetail[];
  selectedItem: PurchaseStoreInvoiceDetail | null;
  stateEmit: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class PurchaseInvoiceStoreService {

  private readonly invoiceState = signalState<InvoiceStateType>({
    items: [],
    selectedItem: null,
    stateEmit: false,
  });


  public readonly items = this.invoiceState.items;
  public readonly selectedItem = this.invoiceState.selectedItem;
  public readonly stateEmit = this.invoiceState.stateEmit;
  public readonly itemCounter = computed(() => this.items().length);
  public readonly itemSumTotal = computed(() => this.items().reduce((ant, act) => ant + act.total, 0));


  public resetState(): void {
    patchState(this.invoiceState, {
      items: [],
      selectedItem: null,
      stateEmit: false,
    });
  }

  public setStateEmit(state: boolean): void {
    patchState(this.invoiceState, {
      stateEmit: state,
    });
  }

  public add(item: Omit<PurchaseStoreInvoiceDetail, 'id'>): void {
    patchState(this.invoiceState, {
      items: [...this.items(), { ...item, item: this.itemCounter() + 1 }],
    });
  }

  public update(item: PurchaseStoreInvoiceDetail): void {
    const indiceElemento = this.items().findIndex(el => el.item == item.item);
    let newItems = [...this.items()];
    // newItems[indiceElemento] = {...newItems[indiceElemento], tareaCompletada: true}
    newItems[indiceElemento] = item;
    patchState(this.invoiceState, {
      items: newItems
    });
  }

  public deleteItem(id: number): void {
    const todos = this.items();
    patchState(this.invoiceState, {
      items: [...todos.filter((item) => item.item !== id)],
    });
  }


}
