import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecepcionEmisionComponent } from './views/recepcion-emision/recepcion-emision.component';
import { RecepcionRetirarComponent } from './views/recepcion-retirar/recepcion-retirar.component';
import { RecepcionCajaComponent } from './views/recepcion-caja/recepcion-caja.component';
import { RecepcionConsultasComponent } from './views/recepcion-consultas/recepcion-consultas.component';
import { RecepcionGastosComponent } from './views/recepcion-gastos/recepcion-gastos.component';
import { MntClientesComponent } from './views/maestros/mnt-clientes/mnt-clientes.component';
import { MntUsuariosComponent } from './views/maestros/mnt-usuarios/mnt-usuarios.component';
import { MntProdservicesComponent } from './views/maestros/mnt-prodservices/mnt-prodservices.component';
import { MntUbicacionComponent } from './views/maestros/mnt-ubicacion/mnt-ubicacion.component';
import { MntSucursalesComponent } from './views/maestros/mnt-sucursales/mnt-sucursales.component';
import { MntSucursalUsuariosComponent } from './views/maestros/mnt-sucursal-usuarios/mnt-sucursal-usuarios.component';
import { MntImpresorasComponent } from './views/maestros/mnt-impresoras/mnt-impresoras.component';
import { MntWorkerNodesComponent } from './views/maestros/mnt-worker-nodes/mnt-worker-nodes.component';
import { MntImpresionesPendientesComponent } from './views/administracion/mnt-impresiones-pendientes/mnt-impresiones-pendientes.component';
import { RecepcionRegUbicacionesComponent } from './views/recepcion-reg-ubicaciones/recepcion-reg-ubicaciones.component';
import { ReporteResumenCajaComponent } from './views/reportes/reporte-resumen-caja/reporte-resumen-caja.component';
import { DashboardcajaComponent } from './views/reportes/dashboardcaja/dashboardcaja.component';
import { DashboardprintersComponent } from './views/reportes/dashboardprinters/dashboardprinters.component';
import { InspeccionResumenComponent } from './views/reportes/inspeccion-resumen/inspeccion-resumen.component';
import { ReporteSneakersComponent } from './views/reportes/reporte-sneakers/reporte-sneakers.component';

const routes: Routes = [
  { path: '', redirectTo: 'emision', pathMatch: 'full' },
  { path: 'emision', component: RecepcionEmisionComponent },
  { path: 'retiros', component: RecepcionRetirarComponent },
  { path: 'retiros/:serie/:numGuia', component: RecepcionRetirarComponent },
  { path: 'caja', component: RecepcionCajaComponent },
  { path: 'consultas', component: RecepcionConsultasComponent },
  { path: 'consultas/:clienteId', component: RecepcionConsultasComponent },
  { path: 'gastos', component: RecepcionGastosComponent },
  { path: 'clientes', component: MntClientesComponent },
  { path: 'usuarios', component: MntUsuariosComponent },
  { path: 'servicios', component: MntProdservicesComponent },
  { path: 'ubicaciones', component: MntUbicacionComponent },
  { path: 'sucursales', component: MntSucursalesComponent },
  { path: 'sucursales/:branchId/usuarios', component: MntSucursalUsuariosComponent },
  { path: 'impresoras', component: MntImpresorasComponent },
  { path: 'workerNodes', component: MntWorkerNodesComponent },
  { path: 'impresionesPendientes', component: MntImpresionesPendientesComponent },
  { path: 'registroUbicaciones', component: RecepcionRegUbicacionesComponent },
  { path: 'resumenCaja', component: ReporteResumenCajaComponent },  
  { path: 'dashboardcash', component: DashboardcajaComponent },
  { path: 'dashboardprinters', component: DashboardprintersComponent },
  { path: 'inspeccion-resumen', component: InspeccionResumenComponent },
  { path: 'inspeccion-resumen/:workGuideId', component: InspeccionResumenComponent },
  { path: 'reportes/sneakers', component: ReporteSneakersComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RecepcionRoutingModule { }
