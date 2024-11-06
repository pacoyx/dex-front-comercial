import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-layout-plataforma',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatIconModule, MatButtonModule, RouterModule, MatSidenavModule,
    MatListModule,],
  templateUrl: './layout-plataforma.component.html',
  styleUrl: './layout-plataforma.component.css'
})
export class LayoutPlataformaComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(private router: Router) { }

  cerrarSesion() {
    localStorage.setItem('dex24Auth', '');
    this.router.navigate(['/login']);
  }

}
