import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { RecepcionEmisionComponent } from './views/recepcion-emision/recepcion-emision.component';
import { RecepcionTouchComponent } from './views/recepcion-touch/recepcion-touch.component';
import { RecepcionRetirarComponent } from './views/recepcion-retirar/recepcion-retirar.component';
import { RecepcionCajaComponent } from './views/recepcion-caja/recepcion-caja.component';
import { RecepcionConsultasComponent } from './views/recepcion-consultas/recepcion-consultas.component';
import { RecepcionGastosComponent } from './views/recepcion-gastos/recepcion-gastos.component';
import { MntClientesComponent } from './views/maestros/mnt-clientes/mnt-clientes.component';
import { MntUsuariosComponent } from './views/maestros/mnt-usuarios/mnt-usuarios.component';
import { MntProdservicesComponent } from './views/maestros/mnt-prodservices/mnt-prodservices.component';
import { MntUbicacionComponent } from './views/maestros/mnt-ubicacion/mnt-ubicacion.component';
import { RecepcionRegUbicacionesComponent } from './views/recepcion-reg-ubicaciones/recepcion-reg-ubicaciones.component';
import { ReporteResumenCajaComponent } from './views/reportes/reporte-resumen-caja/reporte-resumen-caja.component';
import { DashboardcajaComponent } from './views/reportes/dashboardcaja/dashboardcaja.component';
import { InspeccionResumenComponent } from './views/reportes/inspeccion-resumen/inspeccion-resumen.component';
import { ReporteSneakersComponent } from './views/reportes/reporte-sneakers/reporte-sneakers.component';

const routes: Routes = [
  { path: '', redirectTo: 'emision', pathMatch: 'full' },
  { path: 'emision', component: RecepcionEmisionComponent, canActivate: [permissionGuard], data: { permission: 'reception.emision.access' } },
  { path: 'touch', component: RecepcionTouchComponent, canActivate: [permissionGuard], data: { permission: 'reception.emision.access' } },
  { path: 'retiros', component: RecepcionRetirarComponent, canActivate: [permissionGuard], data: { permission: 'reception.retiro.access' } },
  { path: 'retiros/:serie/:numGuia', component: RecepcionRetirarComponent, canActivate: [permissionGuard], data: { permission: 'reception.retiro.access' } },
  { path: 'caja', component: RecepcionCajaComponent, canActivate: [permissionGuard], data: { permission: 'reception.caja.access' } },
  { path: 'consultas', component: RecepcionConsultasComponent, canActivate: [permissionGuard], data: { permission: 'reception.consultas.access' } },
  { path: 'consultas/:clienteId', component: RecepcionConsultasComponent, canActivate: [permissionGuard], data: { permission: 'reception.consultas.access' } },
  { path: 'gastos', component: RecepcionGastosComponent, canActivate: [permissionGuard], data: { permission: 'reception.gastos.access' } },
  { path: 'clientes', component: MntClientesComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'usuarios', component: MntUsuariosComponent, canActivate: [permissionGuard], data: { permission: 'settings.access' } },
  { path: 'servicios', component: MntProdservicesComponent, canActivate: [permissionGuard], data: { permission: 'reception.maestros.access' } },
  { path: 'ubicaciones', component: MntUbicacionComponent, canActivate: [permissionGuard], data: { permission: 'reception.maestros.access' } },
  { path: 'registroUbicaciones', component: RecepcionRegUbicacionesComponent, canActivate: [permissionGuard], data: { permission: 'reception.maestros.access' } },
  { path: 'resumenCaja', component: ReporteResumenCajaComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },
  { path: 'dashboardcash', component: DashboardcajaComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },
  { path: 'inspeccion-resumen', component: InspeccionResumenComponent, canActivate: [permissionGuard], data: { permission: 'reception.consultas.access' } },
  { path: 'inspeccion-resumen/:serie/:numGuia', component: InspeccionResumenComponent, canActivate: [permissionGuard], data: { permission: 'reception.consultas.access' } },
  { path: 'reportes/sneakers', component: ReporteSneakersComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecepcionRoutingModule { }
