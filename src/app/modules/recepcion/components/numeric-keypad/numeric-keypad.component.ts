import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-numeric-keypad',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './numeric-keypad.component.html',
  styleUrl: './numeric-keypad.component.css',
})
export class NumericKeypadComponent {
  @Input() allowDecimal = true;

  /**
   * Hacia donde se despliega el teclado respecto del control que lo ancla.
   * - 'down'/'up': popover flotante (position:absolute); usar 'up' cuando el
   *   control esta pegado al borde inferior/derecho de su contenedor, para
   *   que el teclado no se corte fuera de la pantalla.
   * - 'inline': se renderiza en el flujo normal del documento, sin posicion
   *   absoluta ni flechita. Pensado para dialogos de Angular Material, que
   *   ya scrollean su contenido y no tienen el mismo riesgo de recorte.
   */
  @Input() placement: 'down' | 'up' | 'inline' = 'down';

  @HostBinding('class.numeric-keypad--up')
  get isUp(): boolean {
    return this.placement === 'up';
  }

  @HostBinding('class.numeric-keypad--inline')
  get isInline(): boolean {
    return this.placement === 'inline';
  }

  @Output() digit = new EventEmitter<string>();
  @Output() backspace = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();
  @Output() done = new EventEmitter<void>();

  digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];
}
