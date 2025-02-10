import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagementConfiguracionesComponent } from './views/management-configuraciones/management-configuraciones.component';
import { ManagentEmpresaComponent } from './views/managent-empresa/managent-empresa.component';
import { ManagentUsersComponent } from './views/managent-users/managent-users.component';
import { ManagementDashboardComponent } from './views/management-dashboard/management-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ManagementDashboardComponent },
  { path: 'empresa', component: ManagentEmpresaComponent },
  { path: 'usuarios', component: ManagentUsersComponent },
  { path: 'configuraciones', component: ManagementConfiguracionesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
