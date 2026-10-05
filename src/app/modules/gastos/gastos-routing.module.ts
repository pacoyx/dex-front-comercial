import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardGastosComponent } from './views/dashboard-gastos/dashboard-gastos.component';
import { GastosComponent } from './views/gastos/gastos.component';
import { GastoFormComponent } from './views/gastos/gasto-form/gasto-form.component';
import { ExpenseCategoriesComponent } from './views/expense-categories/expense-categories.component';
import { ReportesGastosComponent } from './views/reportes-gastos/reportes-gastos.component';

const routes: Routes = [
  { path: '', redirectTo: 'gastos', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardGastosComponent },
  { path: 'gastos', component: GastosComponent },
  { path: 'gastos/nuevo', component: GastoFormComponent },
  { path: 'gastos/:id/editar', component: GastoFormComponent },
  { path: 'categorias', component: ExpenseCategoriesComponent },
  { path: 'reportes', component: ReportesGastosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GastosRoutingModule { }
