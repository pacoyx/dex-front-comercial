import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, debounceTime, of, startWith, switchMap } from 'rxjs';
import { ClientesService } from '../../../../../../facturacion/services/clientes.service';
import { ICompanySearchResult } from '../../../../../../facturacion/interfaces/ICustomer';

@Component({
  selector: 'app-dialog-select-customer',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    ReactiveFormsModule, AsyncPipe,
  ],
  templateUrl: './dialog-select-customer.component.html',
  styleUrl: './dialog-select-customer.component.css'
})
export class DialogSelectCustomerComponent {

  private clientesService = inject(ClientesService);
  readonly dialogRef = inject(MatDialogRef<DialogSelectCustomerComponent>);
  readonly data = inject<{ title?: string; confirmLabel?: string } | null>(MAT_DIALOG_DATA, { optional: true });

  customerControl = new FormControl<string | ICompanySearchResult>('');
  filteredCustomers: Observable<ICompanySearchResult[]>;
  selected: ICompanySearchResult | null = null;

  constructor() {
    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return of([]);
        }
        return this.clientesService.buscarEmpresas({ businessName: value }).pipe(
          switchMap(resp => of(resp.data ?? []))
        );
      })
    );
  }

  displayCustomerFn(customer: ICompanySearchResult | string): string {
    return typeof customer === 'string' ? customer : (customer?.businessName ?? '');
  }

  onCustomerSelected(event: { option: { value: ICompanySearchResult } }): void {
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
