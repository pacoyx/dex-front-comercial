import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { DashboardPurchaseComponent } from './views/dashboard-purchase/dashboard-purchase.component';
import { SupplierComponent } from './views/maestros/supplier/supplier.component';
import { SupplierImportComponent } from './views/maestros/supplier/supplier-import/supplier-import.component';
import { PurchaseInvoiceComponent } from './views/operaciones/purchase-invoice/purchase-invoice.component';
import { PurchaseInvoicesComponent } from './views/operaciones/purchase-invoices/purchase-invoices.component';
import { PurchaseReportesFacturasxparamsComponent } from './views/reports/purchase-reportes-facturasxparams/purchase-reportes-facturasxparams.component';
import { PurchaseInvoiceDetailViewComponent } from './views/operaciones/purchase-invoice-detail-view/purchase-invoice-detail-view.component';
import { CuentasPorPagarComponent } from './views/cuentas-por-pagar/cuentas-por-pagar.component';
import { PurchaseRegistroComprasComponent } from './views/reports/purchase-registro-compras/purchase-registro-compras.component';


const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPurchaseComponent },
  { path: 'invoices', component: PurchaseInvoicesComponent },
  { path: 'invoices/nueva', component: PurchaseInvoiceComponent },
  { path: 'invoices/view/:invoiceId', component: PurchaseInvoiceDetailViewComponent },
  { path: 'cuentas-pagar', component: CuentasPorPagarComponent },
  { path: 'suppliers', component: SupplierComponent, canActivate: [permissionGuard], data: { permission: 'suppliers.access' } },
  { path: 'suppliers/import', component: SupplierImportComponent, canActivate: [permissionGuard], data: { permission: 'suppliers.access' } },
  // Los maestros de productos se trasladaron al módulo de Inventarios (rutas antiguas redirigen).
  { path: 'products', redirectTo: '/inventario/productos', pathMatch: 'full' },
  { path: 'unitmeasure', redirectTo: '/inventario/unidades', pathMatch: 'full' },
  { path: 'categoriesProduct', redirectTo: '/inventario/categorias', pathMatch: 'full' },
  { path: 'consultas/facturas', component:  PurchaseReportesFacturasxparamsComponent},
  { path: 'consultas/facturas/view/:invoiceId', component: PurchaseInvoiceDetailViewComponent },
  { path: 'reportes/registro-compras', component: PurchaseRegistroComprasComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseRoutingModule { }
