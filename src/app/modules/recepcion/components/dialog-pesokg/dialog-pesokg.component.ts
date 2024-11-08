import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
export class DialogPesokgComponent implements OnInit, AfterViewInit {
  @ViewChild('publicTotalBox') totalBoxField!: ElementRef;

  readonly store = inject(EmisionStoreService);
  readonly dialogRef = inject(MatDialogRef<DialogPesokgComponent>);
  pesoKg = 0.0;
  precioKg = 3.0;
  total = 0.0;
  obs = '';
  codProd = 1;
  nomProd = 'Lavado KG';

  ngAfterViewChecked(): void {
    console.log('ngAfterViewChecked()');
    // this.totalBoxField.nativeElement.focus();
    // this.totalBoxField.nativeElement.select();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit()');    
    // this.totalBoxField.nativeElement.focus();
    // this.totalBoxField.nativeElement.select();

    setTimeout(() => {
      this.totalBoxField.nativeElement.focus();
      this.totalBoxField.nativeElement.select();
    }, 0);
  }


  constructor() { }

  ngOnInit(): void {
    this.total = 0;        
    this.totalBoxField.nativeElement.focus();
  }

  precioFocus() {

  }

  registrarItem() {    
    this.store.add({
      codProd: this.codProd.toString(),
      nomProd: this.nomProd,
      Cant: this.pesoKg,
      Precio: this.precioKg,
      Subtotal: this.total,
      Obs: this.obs
    })
  }

  calcularPeso() {
    this.pesoKg = this.roundTo(this.total / this.precioKg, 2);
    this.registrarItem();
    this.cerrar();
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
