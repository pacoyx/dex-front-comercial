import { Component, inject, Input, OnChanges, OnInit, Output, SimpleChanges, EventEmitter, OnDestroy } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IListaItemsBusqueda } from '../../../../interfaces/IListaItemsBusqueda';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EmisionStoreService } from '../../../../services/emision.store.service';
import { DialogEditItemComponent } from '../../../../components/dialog-edit-item/dialog-edit-item.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recepcion-grilla-busqueda-servicios',
  standalone: true,
  imports: [MatTableModule, MatButtonModule, MatIconModule, CurrencyPipe],
  templateUrl: './recepcion-grilla-busqueda-servicios.component.html',
  styleUrl: './recepcion-grilla-busqueda-servicios.component.css'
})
export class RecepcionGrillaBusquedaServiciosComponent implements OnInit, OnChanges, OnDestroy {

  @Input() itemsData: IListaItemsBusqueda[] = [];
  @Output() updatePayEvent = new EventEmitter<boolean>();

  readonly dialog = inject(MatDialog);
  readonly store = inject(EmisionStoreService);

  displayedColumns: string[] = ['name', 'price'];
  dataSource = new MatTableDataSource<IListaItemsBusqueda>(this.itemsData);
  dialogSubscription!: Subscription;

  constructor() { }
  
  ngOnDestroy(): void {
    if (this.dialogSubscription) {
      this.dialogSubscription.unsubscribe();
    }
  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemsData'] && changes['itemsData'].currentValue) {
      this.dataSource = new MatTableDataSource<IListaItemsBusqueda>(this.itemsData);
    }
  }

  agregarItem(item: IListaItemsBusqueda): void {
    this.store.select(item.id);
    this.dialogSubscription = this.dialog.open(DialogEditItemComponent, { data: { edicion: false, item: item } })
      .afterClosed()
      .subscribe((_) => this.updatePayEvent.emit(true));
  }




}
