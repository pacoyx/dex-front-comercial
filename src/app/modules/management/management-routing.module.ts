import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManagementConfiguracionesComponent } from './views/management-configuraciones/management-configuraciones.component';
import { ManagentEmpresaComponent } from './views/managent-empresa/managent-empresa.component';
import { ManagentUsersComponent } from './views/managent-users/managent-users.component';
import { ManagementDashboardComponent } from './views/management-dashboard/management-dashboard.component';
import { RolesComponent } from './views/roles/roles.component';
import { MntSucursalesComponent } from './views/mnt-sucursales/mnt-sucursales.component';
import { MntSucursalUsuariosComponent } from './views/mnt-sucursal-usuarios/mnt-sucursal-usuarios.component';
import { MntImpresorasComponent } from './views/mnt-impresoras/mnt-impresoras.component';
import { MntWorkerNodesComponent } from './views/mnt-worker-nodes/mnt-worker-nodes.component';
import { MntImpresionesPendientesComponent } from './views/mnt-impresiones-pendientes/mnt-impresiones-pendientes.component';
import { DashboardprintersComponent } from './views/dashboardprinters/dashboardprinters.component';
import { EmailAccountsComponent } from './views/email-accounts/email-accounts.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: ManagementDashboardComponent },
  { path: 'empresa', component: ManagentEmpresaComponent },
  { path: 'usuarios', component: ManagentUsersComponent },
  { path: 'configuraciones', component: ManagementConfiguracionesComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'sucursales', component: MntSucursalesComponent },
  { path: 'sucursales/:branchId/usuarios', component: MntSucursalUsuariosComponent },
  { path: 'impresoras', component: MntImpresorasComponent },
  { path: 'workerNodes', component: MntWorkerNodesComponent },
  { path: 'impresionesPendientes', component: MntImpresionesPendientesComponent },
  { path: 'dashboardprinters', component: DashboardprintersComponent },
  { path: 'cuentasCorreo', component: EmailAccountsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
