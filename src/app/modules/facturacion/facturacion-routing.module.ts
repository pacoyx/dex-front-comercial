import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { FacturasComponent } from './views/facturas/facturas.component';
import { FacturaFormComponent } from './views/facturas/factura-form/factura-form.component';
import { FacturaDetailComponent } from './views/facturas/factura-detail/factura-detail.component';
import { ImportarFacturaXmlComponent } from './views/facturas/importar-factura-xml/importar-factura-xml.component';
import { CuentasPorCobrarComponent } from './views/cuentas-por-cobrar/cuentas-por-cobrar.component';
import { PlanillasComponent } from './views/planillas/planillas.component';
import { PlanillaDetailComponent } from './views/planillas/planilla-detail/planilla-detail.component';
import { RegistroVentasComponent } from './views/reportes/registro-ventas/registro-ventas.component';
import { DashboardFacturacionComponent } from './views/dashboard-facturacion/dashboard-facturacion.component';
import { FacturacionPorClienteComponent } from './views/reportes/facturacion-por-cliente/facturacion-por-cliente.component';
import { ClientesComponent } from './views/clientes/clientes.component';
import { FichaClienteComponent } from './views/clientes/ficha-cliente/ficha-cliente.component';
import { TarifasClienteComponent } from './views/tarifas-cliente/tarifas-cliente.component';
import { CustomerImportComponent } from './views/clientes/customer-import/customer-import.component';
import { CustomerPortalAdminComponent } from './views/customer-portal-admin/customer-portal-admin.component';
import { ValorizacionMensualComponent } from './views/reportes/valorizacion-mensual/valorizacion-mensual.component';
import { RecordatoriosFacturasComponent } from './views/reportes/recordatorios-facturas/recordatorios-facturas.component';

const routes: Routes = [
  { path: '', redirectTo: 'facturas', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardFacturacionComponent },
  { path: 'clientes', component: ClientesComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'clientes-import', component: CustomerImportComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'clientes/:id', component: FichaClienteComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'tarifas-cliente', component: TarifasClienteComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'tarifas-cliente/:customerId', component: TarifasClienteComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'customer-portal-admin', component: CustomerPortalAdminComponent, canActivate: [permissionGuard], data: { permission: 'customers.access' } },
  { path: 'facturas', component: FacturasComponent },
  { path: 'facturas/nueva', component: FacturaFormComponent },
  { path: 'facturas/importar-xml', component: ImportarFacturaXmlComponent },
  { path: 'facturas/:id', component: FacturaDetailComponent },
  { path: 'cuentas-cobrar', component: CuentasPorCobrarComponent },
  { path: 'planillas', component: PlanillasComponent },
  { path: 'planillas/:id', component: PlanillaDetailComponent },
  { path: 'reportes/registro-ventas', component: RegistroVentasComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },
  { path: 'reportes/facturacion-por-cliente', component: FacturacionPorClienteComponent },
  { path: 'reportes/valorizacion-mensual', component: ValorizacionMensualComponent, canActivate: [permissionGuard], data: { permission: 'invoices.access' } },
  { path: 'recordatorios-facturas', component: RecordatoriosFacturasComponent, canActivate: [permissionGuard], data: { permission: 'invoices.access' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FacturacionRoutingModule { }
