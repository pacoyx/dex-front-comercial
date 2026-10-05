import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EmisionStoreService } from '../../services/emision.store.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NumericKeypadComponent } from '../numeric-keypad/numeric-keypad.component';

type CampoPeso = 'peso' | 'precio' | 'total';

/**
 * Version touch de DialogPesokgComponent: Peso/Precio/Total se editan con
 * botones + teclado numerico en pantalla en vez de inputs nativos. Es una
 * copia separada (no una variante condicional) para no afectar el modal
 * original que sigue usando recepcion-emision.
 */
@Component({
  selector: 'app-dialog-pesokg-touch',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule, NumericKeypadComponent],
  templateUrl: './dialog-pesokg-touch.component.html',
  styleUrl: './dialog-pesokg-touch.component.css'
})
export class DialogPesokgTouchComponent implements OnInit {
  readonly dataInput = inject<{ inTitulo: string, inPrecio: number, inEsPeso: boolean, inIdServicio: number, inDesServicio: string }>(MAT_DIALOG_DATA);

  readonly store = inject(EmisionStoreService);
  readonly dialogRef = inject(MatDialogRef<DialogPesokgTouchComponent>);
  pesoKg = 1.0;
  precioKg = 1.0;
  total = 0.0;
  obs = '';
  codProd = 0;
  nomProd = '';

  // --- teclado numerico flotante: mismo campo que antes se enfocaba con el teclado fisico ---
  campoActivo: CampoPeso = 'total';
  tecladoAbierto = false;
  buffer = '';

  constructor() { }

  ngOnInit(): void {
    this.codProd = this.dataInput.inIdServicio;
    this.nomProd = this.dataInput.inDesServicio;
    if (this.dataInput.inEsPeso) {
      this.pesoKg = 0;
      this.precioKg = this.dataInput.inPrecio;
    }

    this.total = 0;
    // el cajero normalmente escribe el Total y el peso se recalcula solo
    this.abrirTeclado('total');
  }

  abrirTeclado(campo: CampoPeso): void {
    this.campoActivo = campo;
    this.buffer = this.valorDe(campo).toFixed(2);
    this.tecladoAbierto = true;
  }

  cerrarTeclado(): void {
    this.tecladoAbierto = false;
  }

  onDigit(d: string): void {
    if (d === '.' && this.buffer.includes('.')) return;
    this.buffer += d;
    this.aplicarBuffer();
  }

  onBackspace(): void {
    this.buffer = this.buffer.slice(0, -1);
    this.aplicarBuffer();
  }

  onClear(): void {
    this.buffer = '';
    this.aplicarBuffer();
  }

  private valorDe(campo: CampoPeso): number {
    if (campo === 'peso') return this.pesoKg;
    if (campo === 'precio') return this.precioKg;
    return this.total;
  }

  private aplicarBuffer(): void {
    const valor = parseFloat(this.buffer) || 0;
    if (this.campoActivo === 'total') {
      this.total = valor;
      this.calcularPesoBlur();
    } else {
      if (this.campoActivo === 'peso') this.pesoKg = valor;
      else this.precioKg = valor;
      this.calcularPrecio();
    }
  }

  registrarItem() {
    this.store.add({
      codProd: this.codProd.toString(),
      nomProd: this.dataInput.inEsPeso ? 'Lavado por Peso' + ' ' + this.pesoKg + ' Kg.' : this.nomProd,
      Cant: this.pesoKg,
      Precio: this.precioKg,
      Subtotal: this.total,
      Obs: this.obs,
      Identificador: ''
    })
  }

  calcularPeso() {
    this.pesoKg = this.roundTo(this.total / this.precioKg, 2);
    this.registrarItem();
    this.cerrar();
  }

  calcularPesoBlur() {
    this.pesoKg = this.roundTo(this.total / this.precioKg, 2);
  }

  calcularPrecio() {
    this.total = this.roundTo(this.pesoKg * this.precioKg, 2);
  }

  registrarYcerrar() {
    this.registrarItem();
    this.cerrar();
  }

  cerrar() {
    this.dialogRef.close();
  }

  roundTo(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
  };
}
