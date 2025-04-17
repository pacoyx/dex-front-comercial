import { Component, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
@Component({
  selector: 'app-layout-roperia',
  standalone: true,
  imports: [
    RouterModule, MatToolbarModule, MatIconModule, MatButtonModule, MatListModule, MatMenuModule
  ],
  templateUrl: './layout-roperia.component.html',
  styleUrl: './layout-roperia.component.css'
})
export class LayoutRoperiaComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  loginService = inject(LoginService);

  constructor(private router: Router) { }

  cerrarSesion() {
    localStorage.setItem('dex24Auth', '');
    this.router.navigate(['/login']);
  }
}
