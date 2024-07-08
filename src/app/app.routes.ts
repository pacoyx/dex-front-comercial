import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { LayoutPlataformaComponent } from './core/views/layout-plataforma/layout-plataforma.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    {
        path: 'recepcion', component: LayoutPlataformaComponent, children: [
            { path: '', loadChildren: () => import('./modules/recepcion/recepcion.module').then(m => m.RecepcionModule) }
        ]
    }
];
