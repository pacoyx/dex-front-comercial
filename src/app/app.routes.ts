import { Routes } from '@angular/router';
import { LoginComponent } from './core/components/login/login.component';
import { LayoutPlataformaComponent } from './core/views/layout-plataforma/layout-plataforma.component';
import { ProfileUserComponent } from './core/pages/profile-user/profile-user.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'profileUser', component: ProfileUserComponent },
    {
        path: 'recepcion', component: LayoutPlataformaComponent, children: [
            { path: '', loadChildren: () => import('./modules/recepcion/recepcion.module').then(m => m.RecepcionModule) }
        ]
    }
];
