import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { DashboardRrhhComponent } from './views/dashboard-rrhh/dashboard-rrhh.component';
import { AreasComponent } from './views/catalogos/areas/areas.component';
import { CargosComponent } from './views/catalogos/cargos/cargos.component';
import { TrabajadoresListComponent } from './views/trabajadores/trabajadores-list/trabajadores-list.component';
import { TrabajadorFormComponent } from './views/trabajadores/trabajador-form/trabajador-form.component';
import { TrabajadorDetailComponent } from './views/trabajadores/trabajador-detail/trabajador-detail.component';
import { AsistenciaMarcacionComponent } from './views/asistencia/asistencia-marcacion/asistencia-marcacion.component';
import { AsistenciaIncidenciasComponent } from './views/asistencia/asistencia-incidencias/asistencia-incidencias.component';
import { AsistenciaHorasExtraComponent } from './views/asistencia/asistencia-horas-extra/asistencia-horas-extra.component';
import { PrestamosComponent } from './views/prestamos/prestamos.component';
import { PlanillasComponent } from './views/planillas/planillas.component';
import { PlanillaDetailComponent } from './views/planillas/planilla-detail/planilla-detail.component';
import { ReportesComponent } from './views/reportes/reportes.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardRrhhComponent },

  { path: 'areas', component: AreasComponent },
  { path: 'cargos', component: CargosComponent },

  { path: 'trabajadores', component: TrabajadoresListComponent },
  { path: 'trabajadores/nuevo', component: TrabajadorFormComponent },
  { path: 'trabajadores/:id', component: TrabajadorDetailComponent },

  { path: 'asistencia/marcacion', component: AsistenciaMarcacionComponent },
  { path: 'asistencia/incidencias', component: AsistenciaIncidenciasComponent },
  { path: 'asistencia/horas-extra', component: AsistenciaHorasExtraComponent },

  { path: 'prestamos', component: PrestamosComponent, canActivate: [permissionGuard], data: { permission: 'payroll.access' } },

  { path: 'planillas', component: PlanillasComponent, canActivate: [permissionGuard], data: { permission: 'payroll.access' } },
  { path: 'planillas/:id', component: PlanillaDetailComponent, canActivate: [permissionGuard], data: { permission: 'payroll.access' } },

  { path: 'reportes', component: ReportesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RrhhRoutingModule { }
