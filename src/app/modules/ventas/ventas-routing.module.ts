import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PosComponent } from './views/pos/pos.component';
import { VentasListComponent } from './views/ventas-list/ventas-list.component';
import { VentaDetalleComponent } from './views/venta-detalle/venta-detalle.component';

const routes: Routes = [
  { path: '', redirectTo: 'pos', pathMatch: 'full' },
  { path: 'pos', component: PosComponent },
  { path: 'historial', component: VentasListComponent },
  { path: 'historial/:id', component: VentaDetalleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule { }
