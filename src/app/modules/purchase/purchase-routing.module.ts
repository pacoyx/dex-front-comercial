import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPurchaseComponent } from './views/dashboard-purchase/dashboard-purchase.component';
import { SupplierComponent } from './views/maestros/supplier/supplier.component';
import { ProductComponent } from './views/maestros/product/product.component';
import { UnitMeasurementComponent } from './views/maestros/unit-measurement/unit-measurement.component';
import { CategoryProdComponent } from './views/maestros/category-prod/category-prod.component';
import { PurchaseInvoiceComponent } from './views/operaciones/purchase-invoice/purchase-invoice.component';
import { PurchaseReportesFacturasxparamsComponent } from './views/reports/purchase-reportes-facturasxparams/purchase-reportes-facturasxparams.component';
import { PurchaseInvoiceDetailViewComponent } from './views/operaciones/purchase-invoice-detail-view/purchase-invoice-detail-view.component';


const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPurchaseComponent },
  { path: 'invoices', component: PurchaseInvoiceComponent },
  { path: 'suppliers', component: SupplierComponent },
  { path: 'products', component: ProductComponent },
  { path: 'unitmeasure', component: UnitMeasurementComponent },
  { path: 'categoriesProduct', component: CategoryProdComponent },
  { path: 'consultas/facturas', component:  PurchaseReportesFacturasxparamsComponent},
  { path: 'consultas/facturas/view/:invoiceId', component: PurchaseInvoiceDetailViewComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseRoutingModule { }
