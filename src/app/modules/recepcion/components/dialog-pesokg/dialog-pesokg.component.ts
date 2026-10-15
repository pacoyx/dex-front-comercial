import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EmisionStoreService } from '../../services/emision.store.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-pesokg',
  standalone: true,
  imports: [MatDialogModule, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './dialog-pesokg.component.html',
  styleUrl: './dialog-pesokg.component.css'
})
export class DialogPesokgComponent implements OnInit {

  readonly dataInput = inject<{ inTitulo: string, inPrecio: number, inEsPeso: boolean, inIdServicio: number, inDesServicio: string }>(MAT_DIALOG_DATA);



  readonly store = inject(EmisionStoreService);
  readonly dialogRef = inject(MatDialogRef<DialogPesokgComponent>);
  pesoKg = 1.0;
  precioKg = 1.0;
  total = 0.0;
  obs = '';
  codProd = 0;
  nomProd = '';

  constructor() { }

  ngOnInit(): void {

    this.codProd = this.dataInput.inIdServicio;
    this.nomProd = this.dataInput.inDesServicio;
    this.precioKg = this.dataInput.inPrecio;
    if (this.dataInput.inEsPeso) {
      this.pesoKg = 0;
    }

    this.total = 0;
  }

  seleccionarTotal(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  registrarItem() {
    this.store.add({
      codProd: this.codProd.toString(),
      nomProd: this.dataInput.inEsPeso ? 'Lavado por Peso' + ' '+ this.pesoKg +' Kg.' : this.nomProd,
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
