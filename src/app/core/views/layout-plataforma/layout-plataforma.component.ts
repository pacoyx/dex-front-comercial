import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { LoginService } from '../../services/login.service';
import { ToggleStoreServiceService } from '../../services/toggle-store-service.service';

@Component({
  selector: 'app-layout-plataforma',
  standalone: true,
  imports: [
    RouterOutlet, MatToolbarModule, MatIconModule,
    MatButtonModule, RouterModule, MatSidenavModule,
    MatListModule, MatMenuModule
  ],
  templateUrl: './layout-plataforma.component.html',
  styleUrl: './layout-plataforma.component.css'
})
export class LayoutPlataformaComponent {

  loginService = inject(LoginService);
  constructor(
    private router: Router,
    private toggleStore: ToggleStoreServiceService
  ) { }

  cerrarSesion() {
    localStorage.setItem('dex24Auth', '');
    this.router.navigate(['/login']);
    this.toggleStore.setToggleState(false);
  }


  toggleSidenav() {
    this.toggleStore.setToggleState(true);
  }



}
