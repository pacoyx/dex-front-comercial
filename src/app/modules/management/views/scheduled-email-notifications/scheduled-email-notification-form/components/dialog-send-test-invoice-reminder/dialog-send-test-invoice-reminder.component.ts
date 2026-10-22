import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, debounceTime, of, startWith, switchMap } from 'rxjs';
import { ClientesService } from '../../../../../../facturacion/services/clientes.service';
import { ICompanySearchResult } from '../../../../../../facturacion/interfaces/ICustomer';
import { ISendTestInvoiceReminderRequest } from '../../../../../../facturacion/interfaces/IInvoiceReminder';

@Component({
  selector: 'app-dialog-send-test-invoice-reminder',
  standalone: true,
  imports: [
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    ReactiveFormsModule, FormsModule, AsyncPipe,
  ],
  templateUrl: './dialog-send-test-invoice-reminder.component.html',
  styleUrl: './dialog-send-test-invoice-reminder.component.css'
})
export class DialogSendTestInvoiceReminderComponent {

  private clientesService = inject(ClientesService);
  readonly dialogRef = inject(MatDialogRef<DialogSendTestInvoiceReminderComponent>);

  customerControl = new FormControl<string | ICompanySearchResult>('');
  filteredCustomers: Observable<ICompanySearchResult[]>;
  selectedCustomer: ICompanySearchResult | null = null;

  testEmail = '';

  constructor() {
    this.filteredCustomers = this.customerControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => {
        this.selectedCustomer = typeof value === 'string' || !value ? null : value;
        if (!value || typeof value !== 'string' || value.trim() === '') {
          return of([]);
        }
        return this.clientesService.buscarEmpresas({ businessName: value }).pipe(
          switchMap(resp => of(resp.data ?? []))
        );
      })
    );
  }

  get esValido(): boolean {
    return !!this.selectedCustomer && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.testEmail.trim());
  }

  displayCustomerFn(customer: ICompanySearchResult | string): string {
    return typeof customer === 'string' ? customer : (customer?.businessName ?? '');
  }

  onCustomerSelected(event: { option: { value: ICompanySearchResult } }): void {
    this.selectedCustomer = event.option.value;
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  enviar(): void {
    if (!this.esValido || !this.selectedCustomer) return;
    const req: ISendTestInvoiceReminderRequest = {
      customerId: this.selectedCustomer.customerId,
      testEmail: this.testEmail.trim(),
    };
    this.dialogRef.close(req);
  }

}
