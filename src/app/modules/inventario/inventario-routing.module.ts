import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StockComponent } from './views/stock/stock.component';
import { MovimientosListComponent } from './views/movimientos/movimientos-list.component';
import { MovimientoNuevoComponent } from './views/movimientos/movimiento-nuevo.component';
import { MovimientoDetalleComponent } from './views/movimientos/movimiento-detalle.component';
import { KardexComponent } from './views/kardex/kardex.component';
import { ReportesInventarioComponent } from './views/reportes/reportes-inventario.component';
import { AlmacenesComponent } from './views/almacenes/almacenes.component';
// Maestros trasladados desde Compras: se reutilizan los mismos componentes (Compras los sigue usando
// para registrar facturas a través de su servicio).
import { ProductComponent } from '../purchase/views/maestros/product/product.component';
import { CategoryProdComponent } from '../purchase/views/maestros/category-prod/category-prod.component';
import { UnitMeasurementComponent } from '../purchase/views/maestros/unit-measurement/unit-measurement.component';

const routes: Routes = [
  { path: '', redirectTo: 'stock', pathMatch: 'full' },
  { path: 'stock', component: StockComponent },
  { path: 'movimientos', component: MovimientosListComponent },
  { path: 'movimientos/nuevo', component: MovimientoNuevoComponent },
  { path: 'movimientos/:id', component: MovimientoDetalleComponent },
  { path: 'kardex', component: KardexComponent },
  { path: 'reportes', component: ReportesInventarioComponent },
  { path: 'almacenes', component: AlmacenesComponent },
  { path: 'productos', component: ProductComponent },
  { path: 'categorias', component: CategoryProdComponent },
  { path: 'unidades', component: UnitMeasurementComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventarioRoutingModule { }
