import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, debounceTime, of, startWith, switchMap } from 'rxjs';
import { CatalogosService } from '../../../../../services/catalogos.service';
import { IProdServiceSearchResult } from '../../../../../interfaces/ICatalogos';

@Component({
  selector: 'app-dialog-select-product',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    ReactiveFormsModule, AsyncPipe,
  ],
  templateUrl: './dialog-select-product.component.html',
  styleUrl: './dialog-select-product.component.css'
})
export class DialogSelectProductComponent {

  private catalogosService = inject(CatalogosService);
  readonly dialogRef = inject(MatDialogRef<DialogSelectProductComponent>);
  readonly data = inject<{ lineDescription: string } | null>(MAT_DIALOG_DATA, { optional: true });

  productControl = new FormControl<string | IProdServiceSearchResult>('');
  filteredProducts: Observable<IProdServiceSearchResult[]>;
  selected: IProdServiceSearchResult | null = null;

  constructor() {
    this.filteredProducts = this.productControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return of([]);
        }
        return this.catalogosService.buscarServiciosPorPatron(value);
      })
    );
  }

  displayFn(product: IProdServiceSearchResult | string): string {
    return typeof product === 'string' ? product : (product?.name ?? '');
  }

  onProductSelected(event: { option: { value: IProdServiceSearchResult } }): void {
    this.selected = event.option.value;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  confirmar(): void {
    if (!this.selected) return;
    this.dialogRef.close(this.selected);
  }

}
