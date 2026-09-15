import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FacturasComponent } from './views/facturas/facturas.component';
import { FacturaFormComponent } from './views/facturas/factura-form/factura-form.component';
import { FacturaDetailComponent } from './views/facturas/factura-detail/factura-detail.component';
import { CuentasPorCobrarComponent } from './views/cuentas-por-cobrar/cuentas-por-cobrar.component';
import { PlanillasComponent } from './views/planillas/planillas.component';
import { PlanillaDetailComponent } from './views/planillas/planilla-detail/planilla-detail.component';
import { RegistroVentasComponent } from './views/reportes/registro-ventas/registro-ventas.component';

const routes: Routes = [
  { path: '', redirectTo: 'facturas', pathMatch: 'full' },
  { path: 'facturas', component: FacturasComponent },
  { path: 'facturas/nueva', component: FacturaFormComponent },
  { path: 'facturas/:id', component: FacturaDetailComponent },
  { path: 'cuentas-cobrar', component: CuentasPorCobrarComponent },
  { path: 'planillas', component: PlanillasComponent },
  { path: 'planillas/:id', component: PlanillaDetailComponent },
  { path: 'reportes/registro-ventas', component: RegistroVentasComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRoutingModule { }
