import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FixedAssetsListComponent } from './views/fixed-assets-list/fixed-assets-list.component';
import { FixedAssetDetailComponent } from './views/fixed-asset-detail/fixed-asset-detail.component';
import { FixedAssetsReportComponent } from './views/fixed-assets-report/fixed-assets-report.component';

const routes: Routes = [
  { path: '', component: FixedAssetsListComponent },
  { path: 'reporte', component: FixedAssetsReportComponent },
  { path: ':id', component: FixedAssetDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FixedAssetsRoutingModule { }
