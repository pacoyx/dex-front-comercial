import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import { CajaAperturaComponent } from './components/caja-apertura/caja-apertura.component';
import { CajaMovimientosComponent } from './components/caja-movimientos/caja-movimientos.component';
import { CajaCierreComponent } from './components/caja-cierre/caja-cierre.component';

@Component({
  selector: 'app-recepcion-caja',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatTabsModule,
    CajaAperturaComponent, CajaMovimientosComponent, CajaCierreComponent
  ],
  templateUrl: './recepcion-caja.component.html',
  styleUrl: './recepcion-caja.component.css'
})
export class RecepcionCajaComponent {

}
