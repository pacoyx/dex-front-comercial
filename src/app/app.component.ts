import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { ToggleStoreServiceService } from './core/services/toggle-store-service.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, MatToolbarModule, MatIconModule,
    MatButtonModule, RouterModule, MatSidenavModule,
    MatListModule, MatMenuModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  title = 'Dexfront-Comercial';

  constructor(
    private router: Router,
    private toggleStore: ToggleStoreServiceService
  ) {
    console.log('backend.Base', environment.apiUrlBase);
  }

  ngAfterViewInit(): void {
    // El ViewChild recien esta disponible aca; suscribirse en el constructor
    // fallaba porque BehaviorSubject emite su valor actual de forma sincrona
    // al suscribirse, antes de que la vista (y por ende el sidenav) exista.
    this.toggleStore.toggleState$.subscribe(state => {
      this.sidenav?.toggle(state);
    });
  }

  cerrarSesion() {
    localStorage.setItem('dex24Auth', '');
    this.router.navigate(['/login']);
    this.toggleStore.setToggleState(false);
  }

  toggle() {       
    this.toggleStore.setToggleState(false);
  }

}
// https://www.arunyadav.in/codehacks/blogs/post/19/create-an-angular-app-and-deploy-using-in-nginx-and-docker