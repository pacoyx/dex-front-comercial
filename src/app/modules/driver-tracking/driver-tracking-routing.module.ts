import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriverTrackingMapComponent } from './views/driver-tracking-map/driver-tracking-map.component';
import { DriverRouteComponent } from './views/driver-route/driver-route.component';

const routes: Routes = [
  { path: '', component: DriverTrackingMapComponent },
  { path: 'recorrido', component: DriverRouteComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverTrackingRoutingModule { }
