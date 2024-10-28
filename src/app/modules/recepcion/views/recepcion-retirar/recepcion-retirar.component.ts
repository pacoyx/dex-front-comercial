import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { IDetalleGuiaRetiro } from '../../interfaces/IDetalleGuiaRetiro';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DecimalPipe } from '@angular/common';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ButtonsheetPagosComponent } from '../../components/buttonsheet-pagos/buttonsheet-pagos.component';
import {MatChipsModule} from '@angular/material/chips';
import { ButtonsheetFechaEntregaComponent } from '../../components/buttonsheet-fecha-entrega/buttonsheet-fecha-entrega.component';

@Component({
  selector: 'app-recepcion-retirar',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, MatIconModule, MatTableModule, MatCheckboxModule, DecimalPipe, MatBottomSheetModule, MatChipsModule],
  templateUrl: './recepcion-retirar.component.html',
  styleUrl: './recepcion-retirar.component.css'
})
export class RecepcionRetirarComponent {
  numeroGuia = null;
  private _bottomSheet = inject(MatBottomSheet);

  DataDemo: IDetalleGuiaRetiro[] = [
    { codProd: '1', nomProd: 'lavado camisa', cant: 1, precio: 5, subtotal: 5, obs: 'color negro', estado: 'P', fechaEntrega: '25/09/2024', ubicacion: 'L' },
    { codProd: '2', nomProd: 'lavado pantalon', cant: 2, precio: 7, subtotal: 14, obs: 'color azul, color negro', estado: 'R', fechaEntrega: '24/09/2024', ubicacion: 'P' },
    { codProd: '34', nomProd: 'casaca negra', cant: 1, precio: 13, subtotal: 13, obs: 'cascaca acolchaa tommy hilfiger con manchas de lejia', estado: 'D', fechaEntrega: '29/09/2024', ubicacion: 'A' }
  ];

  displayedColumns: string[] = ['Cant', 'Producto', 'Observaciones', 'Precio', 'Subtotal', 'Estado', 'Entrega', 'Operaciones', 'Ubicacion'];
  dataSource = new MatTableDataSource<IDetalleGuiaRetiro>([]);






  buscarGuia() {
    console.log('bsucando guia', this.numeroGuia);
    this.dataSource = new MatTableDataSource<IDetalleGuiaRetiro>(this.DataDemo);
  }

  editData(ele: any) {
    console.log('editando:', ele);
    // this.store.select(ele.id);
    // this.dialog.open(DialogEditItemComponent);
  }

  deleteData(ele: any) {
    console.log('eliminado:', ele);
    // this.store.delete(ele.id);
  }

  cancelar(event:any){
    console.log(event);
    if(event.checked){
      this._bottomSheet.open(ButtonsheetPagosComponent);
    }    
  }

  cambiarEntrega(item:IDetalleGuiaRetiro){
    console.log('cambiando fecha entrega:', item);
    this._bottomSheet.open(ButtonsheetFechaEntregaComponent);
  }


}
