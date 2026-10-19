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
  { path: 'emision', component: RecepcionEmisionComponent },
  { path: 'touch', component: RecepcionTouchComponent },
  { path: 'retiros', component: RecepcionRetirarComponent },
  { path: 'retiros/:serie/:numGuia', component: RecepcionRetirarComponent },
  { path: 'caja', component: RecepcionCajaComponent },
  { path: 'consultas', component: RecepcionConsultasComponent },
  { path: 'consultas/:clienteId', component: RecepcionConsultasComponent },
  { path: 'gastos', component: RecepcionGastosComponent },
  { path: 'clientes', component: MntClientesComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'usuarios', component: MntUsuariosComponent, canActivate: [permissionGuard], data: { permission: 'settings.access' } },
  { path: 'servicios', component: MntProdservicesComponent },
  { path: 'ubicaciones', component: MntUbicacionComponent },
  { path: 'registroUbicaciones', component: RecepcionRegUbicacionesComponent },
  { path: 'resumenCaja', component: ReporteResumenCajaComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },
  { path: 'dashboardcash', component: DashboardcajaComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },
  { path: 'inspeccion-resumen', component: InspeccionResumenComponent },
  { path: 'inspeccion-resumen/:workGuideId', component: InspeccionResumenComponent },
  { path: 'reportes/sneakers', component: ReporteSneakersComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecepcionRoutingModule { }
