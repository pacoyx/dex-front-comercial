import { computed, Injectable } from '@angular/core';
import { IStoreTicketItem, IStoreWorker } from '../interfaces/Tickets';
import { patchState, signalState } from '@ngrx/signals';

export type TicketState = {
  items: IStoreTicketItem[];
  selectedItem: IStoreTicketItem | null;
  worker: IStoreWorker | null;
};


@Injectable({
  providedIn: 'root'
})
export class TicketStoreService {

  private readonly ticketState = signalState<TicketState>({
    items: [],
    selectedItem: null,
    worker: null
  });


  constructor() { }

  public readonly items = this.ticketState.items;
  public readonly selectedItem = this.ticketState.selectedItem;
  public readonly selectedWorker = this.ticketState.worker;
  public readonly itemCounter = computed(() => this.items().length);


  public resetState(): void {
    patchState(this.ticketState, {
      items: [],
      selectedItem: null,
    });
  }

  public add(item: Omit<IStoreTicketItem, 'id'>): void {
    patchState(this.ticketState, {
      items: [...this.items(), { ...item, item: this.itemCounter() + 1 }],
    });
  }

  public addWorker(worker: IStoreWorker): void {
    patchState(this.ticketState, {
      worker: worker,
    });
  }

  public delete(id: number): void {
    const todos = this.items();
    patchState(this.ticketState, {
      items: [...todos.filter((item) => item.item !== id)],
    });
  }


}
