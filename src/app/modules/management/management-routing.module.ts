import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
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
import { BancosComponent } from './views/bancos/bancos.component';
import { TiposCuentaBancariaComponent } from './views/tipos-cuenta-bancaria/tipos-cuenta-bancaria.component';
import { ScheduledEmailNotificationsComponent } from './views/scheduled-email-notifications/scheduled-email-notifications.component';
import { ScheduledEmailNotificationFormComponent } from './views/scheduled-email-notifications/scheduled-email-notification-form/scheduled-email-notification-form.component';

const routes: Routes = [
  // El dashboard requiere el permiso adicional "dashboard.access" (pensado solo para
  // Gerencia), a diferencia del resto de pantallas que solo requieren "settings.access"
  // (el permiso de modulo). Por eso el landing por defecto NO apunta al dashboard: la
  // mayoria de usuarios que entran a /management no lo tendran asignado.
  { path: '', redirectTo: 'empresa', pathMatch: 'full' },
  { path: 'dashboard', component: ManagementDashboardComponent, canActivate: [permissionGuard], data: { permission: 'dashboard.access' } },
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
  { path: 'bancos', component: BancosComponent },
  { path: 'tiposCuentaBancaria', component: TiposCuentaBancariaComponent },
  { path: 'correosProgramados', component: ScheduledEmailNotificationsComponent },
  { path: 'correosProgramados/nueva', component: ScheduledEmailNotificationFormComponent },
  { path: 'correosProgramados/:id', component: ScheduledEmailNotificationFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementRoutingModule { }
