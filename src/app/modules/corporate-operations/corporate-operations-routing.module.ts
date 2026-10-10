import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PickupGuidesComponent } from './views/pickup-guides/pickup-guides.component';
import { PickupGuideFormComponent } from './views/pickup-guides/pickup-guide-form/pickup-guide-form.component';
import { PickupGuideDetailComponent } from './views/pickup-guides/pickup-guide-detail/pickup-guide-detail.component';

const routes: Routes = [
  { path: '', redirectTo: 'pickup-guides', pathMatch: 'full' },
  { path: 'pickup-guides', component: PickupGuidesComponent },
  { path: 'pickup-guides/nueva', component: PickupGuideFormComponent },
  { path: 'pickup-guides/:id', component: PickupGuideDetailComponent },
  { path: 'pickup-guides/:id/editar', component: PickupGuideFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CorporateOperationsRoutingModule { }
