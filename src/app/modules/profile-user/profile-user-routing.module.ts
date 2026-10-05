import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MiPerfilComponent } from './views/mi-perfil/mi-perfil.component';

const routes: Routes = [
  { path: '', component: MiPerfilComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileUserRoutingModule { }
