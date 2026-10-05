import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToggleStoreServiceService } from './core/services/toggle-store-service.service';
import { PermissionsStoreService } from './core/services/permissions-store.service';
import { LoginService } from './core/services/login.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, MatToolbarModule, MatIconModule,
    MatButtonModule, RouterModule, MatSidenavModule,
    MatListModule, MatMenuModule, MatDividerModule, MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  title = 'Dexfront-Comercial';

  /** Estado puramente visual: contrae el sidebar a un riel de iconos. No afecta la logica de apertura/cierre. */
  collapsed = false;

  constructor(
    private router: Router,
    private toggleStore: ToggleStoreServiceService,
    private permissionsStore: PermissionsStoreService,
    private loginService: LoginService,
  ) {
    console.log('backend.Base', environment.apiUrlBase);
  }

  ngOnInit(): void {
    // Rehidrata roles/permisos vigentes en el backend al recargar la pagina
    // (el store ya arranca con el ultimo valor guardado en localStorage para
    // evitar el parpadeo del menu mientras esta llamada resuelve).
    if (localStorage.getItem('dex24Auth')) {
      this.loginService.obtenerUsuarioActual().subscribe({
        next: (resp) => this.permissionsStore.setSession(resp.data.roles, resp.data.permissions),
        error: () => { /* el interceptor ya maneja el refresh/logout ante un 401 */ },
      });
    }
  }

  ngAfterViewInit(): void {
    // El ViewChild recien esta disponible aca; suscribirse en el constructor
    // fallaba porque BehaviorSubject emite su valor actual de forma sincrona
    // al suscribirse, antes de que la vista (y por ende el sidenav) exista.
    this.toggleStore.toggleState$.subscribe(state => {
      this.sidenav?.toggle(state);
    });
  }

  hasPermission(code: string): boolean {
    return this.permissionsStore.hasPermission(code);
  }

  cerrarSesion() {
    localStorage.setItem('dex24Auth', '');
    this.permissionsStore.clear();
    this.router.navigate(['/login']);
    this.toggleStore.setToggleState(false);
  }

  toggle() {
    this.toggleStore.setToggleState(false);
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

}
// https://www.arunyadav.in/codehacks/blogs/post/19/create-an-angular-app-and-deploy-using-in-nginx-and-docker