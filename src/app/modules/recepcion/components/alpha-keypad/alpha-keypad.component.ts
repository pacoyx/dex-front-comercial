import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alpha-keypad',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './alpha-keypad.component.html',
  styleUrl: './alpha-keypad.component.css',
})
export class AlphaKeypadComponent {
  @Output() key = new EventEmitter<string>();
  @Output() backspace = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];
}
