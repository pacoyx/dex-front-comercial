import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecepcionEmisionComponent } from './views/recepcion-emision/recepcion-emision.component';
import { RecepcionRetirarComponent } from './views/recepcion-retirar/recepcion-retirar.component';
import { RecepcionCajaComponent } from './views/recepcion-caja/recepcion-caja.component';
import { RecepcionConsultasComponent } from './views/recepcion-consultas/recepcion-consultas.component';

const routes: Routes = [
  { path: '', redirectTo: 'emision', pathMatch: 'full' },
  { path: 'emision', component: RecepcionEmisionComponent },
  { path: 'retiros', component: RecepcionRetirarComponent },
  { path: 'caja', component: RecepcionCajaComponent },
  { path: 'consultas', component: RecepcionConsultasComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecepcionRoutingModule { }
