import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { EmisionStoreService } from '../../services/emision.store.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { IEmisionItem } from '../../models/IEmisionItems';
import { IListaItemsBusqueda } from '../../interfaces/IListaItemsBusqueda';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';


interface Marcas {
  value: string;
  name: string;
}

@Component({
  selector: 'app-dialog-edit-item',
  standalone: true,
  imports: [
    MatFormFieldModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatIconModule, MatInputModule, MatButtonModule,
    MatChipsModule, MatCheckboxModule, MatTabsModule, MatListModule
  ],
  templateUrl: './dialog-edit-item.component.html',
  styleUrl: './dialog-edit-item.component.css'
})
export class DialogEditItemComponent implements OnInit {

  readonly store = inject(EmisionStoreService);
  readonly dialogRef = inject(MatDialogRef<DialogEditItemComponent>);
  readonly data = inject<{ edicion: boolean, item: IListaItemsBusqueda }>(MAT_DIALOG_DATA);
  cantidad = 0.0;
  precio = 0.0;
  total = 0.0;
  obs = '';
  itemEdit: IEmisionItem | null = null;

  form: FormGroup;
  formTemas: FormGroup;
  formMarcas: FormGroup;
  formMarcasx: FormGroup;

  colores = [
    { nombre: 'Blanco', valor: '#FFFFFF' },
    { nombre: 'Negro', valor: '#000000' },
    { nombre: 'Azul', valor: '#0000FF' },
    { nombre: 'Celeste', valor: '#87CEEB' },
    { nombre: 'Amarillo', valor: '#FFFF00' },
    { nombre: 'Rosado', valor: '#FFC0CB' },
    { nombre: 'Morado', valor: '#800080' },
    { nombre: 'Beig', valor: '#F5F5DC' },
    { nombre: 'Marron', valor: '#A52A2A' },
    { nombre: 'Acero', valor: '#B0C4DE' },
    { nombre: 'Rojo', valor: '#FF0000' },
    { nombre: 'Verde', valor: 'green' }
  ];
  temas = ['Rayado', 'Circulos', 'Jaspeado', 'Cebra', 'Floreado', 'dibujos'];

  temaStyles = [
    { nombre: 'Rayado', estilo: 'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px);' },
    { nombre: 'Circulos', estilo: 'radial-gradient(circle, #ffcc33, #ffcc33 10%, #ff9933 10%, #ff9933 20%);' },
    { nombre: 'Jaspeado', estilo: 'linear-gradient(135deg, #f6d365 25%, #fda085 25%, #fda085 50%, #f6d365 50%, #f6d365 75%, #fda085 75%, #fda085 100%);' },
    { nombre: 'Cebra', estilo: 'repeating-linear-gradient(45deg, #000000, #000000 10px, #ffffff 10px, #ffffff 20px);' }
  ];

  marcasRopas = [
    'ADIDAS', 'ARMANI', 'BARONET', 'BILLABONG', 'CACHAREL', 'CALVIN KLEIN', 'CAT',
    'CHEROKEE', 'COLUMBIA', 'CONVERSE', 'DC SHOES', 'DIADORA', 'DIESEL', 'DOO AUSTRALIA', 'FILA',
    'FILLIPO ALPI', 'GAP', 'GUCCI', 'GUESS', 'GZUCK', 'H&M', 'HANK', 'HOLLISTER', 'HURLEY', 'LA MARTINA',
    'LACOSTE', 'LANCASTER', 'LEONISA', 'LEVI\'S', 'LOIS', 'LOUIS VUITTON', 'MARTINA', 'MC GREGOR', 'MOSSIMO',
    'NEW BALANCE', 'NEW PORT', 'NIKE', 'O\'NEILL', 'OAKLEY', 'PIONIER', 'POWER', 'PRADA', 'PUMA', 'QUIKSILVER',
    'RALPH LAUREN', 'REEBOK', 'RIP CURL', 'ROSE', 'SYBILLA', 'TIGRE', 'TOMMY HILFIGER', 'TOPITOP', 'TPT', 'UMBRO',
    'UNDER ARMOR', 'UNDER ARMOUR', 'UNIQLO', 'UNIVERSITY CLUB', 'VANS', 'XIOMI', 'ZARA'
  ];


  marcasControl = new FormControl();

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      checkboxesColores: this.fb.array([]),
    });

    this.formTemas = this.fb.group({
      checkboxesTemas: this.fb.array([]),
    });
    this.formMarcas = this.fb.group({
      checkboxesMarcas: this.fb.array([]),
    });


    this.formMarcasx = new FormGroup({
      marcas: this.marcasControl,
    });

  }

  ngOnInit(): void {
    this.addCheckboxesColores();
    this.addCheckboxesTemas();
    this.addCheckboxesMarcas();

    if (this.data.edicion) {
      console.log('item seleccionado para edicion:', this.store.selectedItem());
      this.itemEdit = this.store.selectedItem();
      this.cantidad = this.itemEdit?.Cant!;
      this.precio = this.itemEdit?.Precio!;
      this.total = this.itemEdit?.Subtotal!;
      this.obs = this.itemEdit?.Obs!;
    } else {
      this.cantidad = 1
      this.precio = this.data.item.price;
      this.total = this.cantidad * this.precio;
      this.obs = '';
    }
  }

  private addCheckboxesColores() {
    this.colores.forEach(() => this.checkboxesColoresFormArray.push(new FormControl(false)));
  }

  private addCheckboxesTemas() {
    this.temaStyles.forEach(() => this.checkboxesTemasFormArray.push(new FormControl(false)));
  }

  private addCheckboxesMarcas() {
    this.marcasRopas.forEach(() => this.checkboxesMarcasFormArray.push(new FormControl(false)));
  }

  get checkboxesColoresFormArray() {
    return this.form.controls['checkboxesColores'] as FormArray;
  }

  get checkboxesTemasFormArray() {
    return this.formTemas.controls['checkboxesTemas'] as FormArray;
  }

  get checkboxesMarcasFormArray() {
    return this.formMarcas.controls['checkboxesMarcas'] as FormArray;
  }

  onCheckboxChange(event: any, index: number) {
    // console.log(`Checkbox ${index + 1} changed to ${event.checked}`);
    // console.log('Color seleccionado:', this.colores[index].nombre);
  }

  onSubmit() {
    // console.log(this.form.value);
  }

  calcularPrecio() {
    this.total = this.cantidad * this.precio;
  }

  calcularPrecioPesoKG() {

    this.cantidad = parseFloat((this.total / this.precio).toFixed(2));


    // if (this.itemEdit?.nomProd === 'Lavado KG' || this.itemEdit?.nomProd.toLocaleLowerCase().includes('alfombra')) {      
    //   this.cantidad = parseFloat((this.total / this.precio).toFixed(2));
    // } else {
    //   this.total = this.cantidad * this.precio;
    // }

  }

  focusTotal() {
    this.total = this.cantidad * this.precio;
  }

  cerrar() {
    this.dialogRef.close();
  }

  registrarItem() {

    const selectedColores = this.form.value.checkboxesColores
      .map((checked: boolean, i: number) => checked ? this.colores[i].nombre : null)
      .filter((v: string | null) => v !== null);

    // console.log('Colores seleccionados:', selectedColores.toString());

    const selectedTemas = this.formTemas.value.checkboxesTemas
      .map((checked: boolean, i: number) => checked ? this.temaStyles[i].nombre : null)
      .filter((v: string | null) => v !== null);

    // console.log('Temas seleccionados:', selectedTemas.toString());

    let obsControls = '';
    if (selectedColores.length > 0) {
      obsControls += ' |colores:' + selectedColores.toString();
    }
    if (selectedTemas.length > 0) {
      obsControls += ' |diseño:' + selectedTemas.toString();
    }
    if (this.marcasControl.value) {
      obsControls += ' |marca:' + this.marcasControl.value;
    }

    this.obs += obsControls;

    if (this.data.edicion) {
      this.store.update({
        id: this.itemEdit?.id!,
        codProd: this.itemEdit?.codProd!,
        nomProd: this.itemEdit?.nomProd!,
        Cant: this.cantidad,
        Precio: this.precio,
        Subtotal: this.total,
        Obs: this.obs,
        Identificador: this.itemEdit?.Identificador!
      });
    } else {
      this.store.add({
        codProd: this.data.item.id.toString(),
        nomProd: this.data.item.name,
        Cant: this.cantidad,
        Precio: this.precio,
        Subtotal: this.total,
        Obs: this.obs,
        Identificador: ''
      });
    }
    this.dialogRef.close();
  }
}
