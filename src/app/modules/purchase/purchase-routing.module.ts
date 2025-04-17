import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPurchaseComponent } from './views/dashboard-purchase/dashboard-purchase.component';
import { SupplierComponent } from './views/maestros/supplier/supplier.component';
import { ProductComponent } from './views/maestros/product/product.component';
import { UnitMeasurementComponent } from './views/maestros/unit-measurement/unit-measurement.component';
import { CategoryProdComponent } from './views/maestros/category-prod/category-prod.component';
import { PurchaseInvoiceComponent } from './views/operaciones/purchase-invoice/purchase-invoice.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPurchaseComponent },
  { path: 'invoices', component: PurchaseInvoiceComponent },
  { path: 'suppliers', component: SupplierComponent },
  { path: 'products', component: ProductComponent },
  { path: 'unitmeasure', component: UnitMeasurementComponent },
  { path: 'categoriesProduct', component: CategoryProdComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PurchaseRoutingModule { }
