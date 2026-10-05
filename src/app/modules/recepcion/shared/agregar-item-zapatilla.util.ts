import { MatDialog } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { EmisionStoreService } from '../services/emision.store.service';
import { IListaItemsBusqueda } from '../interfaces/IListaItemsBusqueda';
import { DialogZapatillaItemComponent } from '../components/dialog-zapatilla-item/dialog-zapatilla-item.component';
import { formatearZapatillaDraft } from './zapatilla-draft-format.util';

/**
 * Para ítems de categoría "zapatillas" no se muestra el modal genérico de cantidad/precio:
 * se agrega el ítem directo (cant=1, precio de lista) y se abre únicamente el modal
 * especializado de zapatilla, igual que ya ocurre con "Peso KG."/"Lavado ...".
 *
 * `dialogComponent` es opcional (default: el modal original) para que recepcion-touch
 * pueda pasar `DialogZapatillaItemTouchComponent` sin afectar a recepcion-emision.
 */
export function agregarItemZapatillaDirecto(
  dialog: MatDialog,
  store: EmisionStoreService,
  item: IListaItemsBusqueda,
  dialogComponent: ComponentType<unknown> = DialogZapatillaItemComponent,
): void {
  const nuevoItemId = store.add({
    codProd: item.id.toString(),
    nomProd: item.name,
    Cant: 1,
    Precio: item.price,
    Subtotal: item.price,
    Obs: '',
    Identificador: '',
    categoryDescription: item.categoryDescription
  });

  dialog.open(dialogComponent, {
    data: {
      workGuideDetailId: null,
      productName: item.name,
      initialValue: store.getZapatillaDraft(nuevoItemId)
    }
  }).afterClosed().subscribe((result) => {
    if (!result?.draft) return;

    store.setZapatillaDraft(nuevoItemId, result.draft);

    const itemActual = store.items().find((i) => i.id === nuevoItemId);
    if (itemActual) {
      store.update({
        ...itemActual,
        Obs: formatearZapatillaDraft(result.draft, result.brandName)
      });
    }
  });
}
