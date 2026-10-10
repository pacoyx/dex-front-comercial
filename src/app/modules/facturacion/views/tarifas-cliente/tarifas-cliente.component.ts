import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, Observable, of, startWith, switchMap } from 'rxjs';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { ClientesService } from '../../services/clientes.service';
import { ICompanySearchResult, ICustomer } from '../../interfaces/ICustomer';
import { extractErrorMessage } from '../../shared/http-error.util';
import { GestionTarifasComponent } from './components/gestion-tarifas/gestion-tarifas.component';

@Component({
  selector: 'app-tarifas-cliente',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule,
    ReactiveFormsModule, FormsModule, RouterModule, LoadingComponent, GestionTarifasComponent, AsyncPipe,
  ],
  templateUrl: './tarifas-cliente.component.html',
  styleUrl: './tarifas-cliente.component.css'
})
export class TarifasClienteComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationsSystemService);

  customerId: number | null = null;
  cliente: ICustomer | null = null;
  loading = false;

  customerControl = new FormControl<string | ICompanySearchResult>('');
  filteredCustomers!: Observable<ICompanySearchResult[]>;

  ngOnInit(): void {
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

    this.route.params.subscribe(params => {
      const id = Number(params['customerId']);
      this.customerId = id || null;
      if (this.customerId) {
        this.cargarCliente(this.customerId);
      }
    });
  }

  displayCustomerFn(customer: ICompanySearchResult | string): string {
    return typeof customer === 'string' ? customer : (customer?.businessName ?? '');
  }

  onCustomerSelected(event: { option: { value: ICompanySearchResult } }): void {
    this.router.navigate(['/facturacion/tarifas-cliente', event.option.value.customerId]);
  }

  private cargarCliente(id: number): void {
    this.loading = true;
    this.clientesService.obtenerClientePorId(id).subscribe({
      next: (resp) => {
        this.cliente = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el cliente.'));
      },
    });
  }

  cambiarCliente(): void {
    this.customerId = null;
    this.cliente = null;
    this.customerControl.setValue('');
    this.router.navigate(['/facturacion/tarifas-cliente']);
  }

}
