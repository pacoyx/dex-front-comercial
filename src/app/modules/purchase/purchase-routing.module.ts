import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '../../core/guards/permission.guard';
import { DashboardPurchaseComponent } from './views/dashboard-purchase/dashboard-purchase.component';
import { SupplierComponent } from './views/maestros/supplier/supplier.component';
import { ProductComponent } from './views/maestros/product/product.component';
import { UnitMeasurementComponent } from './views/maestros/unit-measurement/unit-measurement.component';
import { CategoryProdComponent } from './views/maestros/category-prod/category-prod.component';
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
  { path: 'products', component: ProductComponent },
  { path: 'unitmeasure', component: UnitMeasurementComponent },
  { path: 'categoriesProduct', component: CategoryProdComponent },
  { path: 'consultas/facturas', component:  PurchaseReportesFacturasxparamsComponent},
  { path: 'consultas/facturas/view/:invoiceId', component: PurchaseInvoiceDetailViewComponent },
  { path: 'reportes/registro-compras', component: PurchaseRegistroComprasComponent, canActivate: [permissionGuard], data: { permission: 'reports.access' } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseRoutingModule { }
