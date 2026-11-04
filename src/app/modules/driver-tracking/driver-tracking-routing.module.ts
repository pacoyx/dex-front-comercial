import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriverTrackingMapComponent } from './views/driver-tracking-map/driver-tracking-map.component';

const routes: Routes = [
  { path: '', component: DriverTrackingMapComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverTrackingRoutingModule { }
