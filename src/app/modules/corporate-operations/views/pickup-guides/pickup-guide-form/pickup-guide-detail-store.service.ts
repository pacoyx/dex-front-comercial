import { computed, Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { IPickupGuideStoreDetailLine } from '../../../interfaces/IPickupGuide';

export type PickupGuideDetailStateType = {
  items: IPickupGuideStoreDetailLine[];
};

@Injectable({
  providedIn: 'root'
})
export class PickupGuideDetailStoreService {

  private readonly state = signalState<PickupGuideDetailStateType>({
    items: [],
  });

  public readonly items = this.state.items;
  public readonly itemCounter = computed(() => this.items().length);
  public readonly itemSumTotal = computed(() => this.items().reduce((ant, act) => ant + act.lineTotal, 0));

  public resetState(): void {
    patchState(this.state, { items: [] });
  }

  public loadItems(items: IPickupGuideStoreDetailLine[]): void {
    patchState(this.state, { items });
  }

  public add(item: Omit<IPickupGuideStoreDetailLine, 'item'>): void {
    patchState(this.state, {
      items: [...this.items(), { ...item, item: this.itemCounter() + 1 }],
    });
  }

  public update(item: IPickupGuideStoreDetailLine): void {
    const index = this.items().findIndex(el => el.item === item.item);
    const newItems = [...this.items()];
    newItems[index] = item;
    patchState(this.state, { items: newItems });
  }

  public deleteItem(item: number): void {
    patchState(this.state, {
      items: this.items().filter((el) => el.item !== item),
    });
  }

}
