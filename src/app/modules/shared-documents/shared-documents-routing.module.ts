import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedDocumentsListComponent } from './views/shared-documents-list/shared-documents-list.component';

const routes: Routes = [
  { path: '', component: SharedDocumentsListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedDocumentsRoutingModule { }
