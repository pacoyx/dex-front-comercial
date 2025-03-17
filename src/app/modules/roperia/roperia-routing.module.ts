import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoperiaDashboardComponent } from './views/roperia-dashboard/roperia-dashboard.component';
import { RoperiaTicketsComponent } from './views/roperia-tickets/roperia-tickets.component';
import { RoperiaGuiarecojoComponent } from './views/roperia-guiarecojo/roperia-guiarecojo.component';
import { RoperiaConsultasComponent } from './views/roperia-consultas/roperia-consultas.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: RoperiaDashboardComponent },
  { path: 'tickets', component: RoperiaTicketsComponent },
  { path: 'guia-recojo', component: RoperiaGuiarecojoComponent },
  { path: 'consultas', component: RoperiaConsultasComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoperiaRoutingModule { }
