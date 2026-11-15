import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Observable, catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { InventarioService } from '../../services/inventario.service';
import { IProductOption } from '../../interfaces/IInventario';

/**
 * Buscador de productos que controlan stock (por nombre o código). Si se indica el almacén, muestra el
 * stock disponible en ese almacén.
 */
@Component({
  selector: 'app-product-picker',
  standalone: true,
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, DecimalPipe, AsyncPipe],
  template: `
    <mat-form-field appearance="outline" class="picker">
      <mat-label>{{ label }}</mat-label>
      <input matInput [formControl]="control" [matAutocomplete]="auto" placeholder="Nombre o código">
      @if (control.value) {
      <button matSuffix mat-icon-button type="button" aria-label="Limpiar" (click)="limpiar()">
        <mat-icon>close</mat-icon>
      </button>
      }
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="mostrar" (optionSelected)="seleccionar($event)">
        @for (p of opciones$ | async; track p.id) {
        <mat-option [value]="p">
          <span class="opt-name">{{ p.code ? p.code + ' · ' : '' }}{{ p.name }}</span>
          <span class="opt-stock">Stock: {{ (p.stock ?? 0) | number:'1.0-4' }} {{ p.unitMeasurementDescription }}</span>
        </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [`
    .picker { width: 100%; }
    .opt-name { display: block; line-height: 1.2; }
    .opt-stock { display: block; font-size: .75rem; color: var(--mat-sys-on-surface-variant); line-height: 1.2; }
  `]
})
export class ProductPickerComponent implements OnInit {
  @Input() label = 'Producto';
  @Input() warehouseId: number | null = null;
  @Input() set seleccionado(value: IProductOption | null) {
    this.control.setValue(value, { emitEvent: false });
  }
  @Output() productoSeleccionado = new EventEmitter<IProductOption | null>();

  private inventarioService = inject(InventarioService);
  control = new FormControl<IProductOption | string | null>(null);
  opciones$!: Observable<IProductOption[]>;

  ngOnInit(): void {
    this.opciones$ = this.control.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => (typeof value === 'string' ? value : '')),
      distinctUntilChanged(),
      switchMap(term => this.inventarioService.buscarProductos(term, this.warehouseId).pipe(
        map(resp => resp.data),
        catchError(() => of([]))
      ))
    );
  }

  mostrar = (p: IProductOption | string | null): string =>
    !p ? '' : typeof p === 'string' ? p : `${p.code ? p.code + ' · ' : ''}${p.name}`;

  seleccionar(event: MatAutocompleteSelectedEvent): void {
    this.productoSeleccionado.emit(event.option.value as IProductOption);
  }

  limpiar(): void {
    this.control.setValue('');
    this.productoSeleccionado.emit(null);
  }
}
