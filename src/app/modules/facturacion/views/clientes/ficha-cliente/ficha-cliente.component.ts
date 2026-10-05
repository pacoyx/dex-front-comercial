import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { ClientesService } from '../../../services/clientes.service';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { CustomerType, IAccountSummary, IBillingProfileRequest, ICustomer, ICustomerContact } from '../../../interfaces/ICustomer';
import { DialogFormContactoComponent } from './components/dialog-form-contacto/dialog-form-contacto.component';

@Component({
  selector: 'app-ficha-cliente',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSlideToggleModule, MatTableModule, CurrencyPipe, LoadingComponent,
  ],
  templateUrl: './ficha-cliente.component.html',
  styleUrl: './ficha-cliente.component.css'
})
export class FichaClienteComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  customerId = 0;
  cliente: ICustomer | null = null;
  loading = true;

  hasBillingProfile = false;
  loadingProfile = false;
  savingProfile = false;
  profileValidationErrors: string[] = [];
  frmPerfil: FormGroup;
  paymentTermOptions = [15, 30, 45];

  contactos: ICustomerContact[] = [];
  loadingContactos = false;
  contactColumns: string[] = ['fullName', 'position', 'phoneNumber', 'email', 'isPrimary', 'acciones'];

  resumen: IAccountSummary | null = null;
  loadingResumen = false;

  constructor(private fb: FormBuilder) {
    this.frmPerfil = this.fb.group({
      taxId: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      businessName: ['', Validators.required],
      commercialName: [''],
      fiscalAddress: ['', Validators.required],
      billingEmail: ['', Validators.email],
      paymentTermDays: [30, [Validators.required, Validators.min(0)]],
      creditLimit: [0, [Validators.required, Validators.min(0)]],
      isCreditEnabled: [false],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!id) {
        return;
      }
      this.customerId = id;

      // Si venimos del listado o del diálogo de edición, ya tenemos los datos del
      // cliente en memoria: los usamos directo y evitamos depender de GET /api/customer/{id},
      // que puede no estar disponible o responder distinto a lo esperado.
      const clienteDeNavegacion = history.state?.cliente as ICustomer | undefined;
      if (clienteDeNavegacion && Number(clienteDeNavegacion.id) === id) {
        this.usarCliente(clienteDeNavegacion);
      } else {
        this.cargarCliente();
      }
    });
  }

  private usarCliente(cliente: ICustomer): void {
    this.loading = false;
    this.cliente = cliente;

    if (Number(cliente.customerType) !== CustomerType.Company) {
      this.notificationService.showError('Esta ficha solo está disponible para clientes de tipo Empresa.');
      this.router.navigate(['/facturacion/clientes']);
      return;
    }

    this.cargarPerfilFacturacion();
    this.cargarContactos();
    this.cargarResumenCuenta();
  }

  private cargarCliente(): void {
    this.loading = true;
    this.clientesService.obtenerClientePorId(this.customerId).subscribe({
      next: (resp) => {
        if (!resp?.data) {
          this.loading = false;
          this.notificationService.showError('No se pudo obtener la información del cliente.');
          this.router.navigate(['/facturacion/clientes']);
          return;
        }
        this.usarCliente(resp.data);
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el cliente.'));
      }
    });
  }

  private cargarPerfilFacturacion(): void {
    this.loadingProfile = true;
    this.clientesService.obtenerPerfilFacturacion(this.customerId).subscribe({
      next: (resp) => {
        this.loadingProfile = false;
        if (!resp?.data) {
          this.hasBillingProfile = false;
          return;
        }
        this.hasBillingProfile = true;
        this.frmPerfil.patchValue(resp.data);
      },
      error: (err) => {
        this.loadingProfile = false;
        if (err.status === 404) {
          this.hasBillingProfile = false;
          return;
        }
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el perfil de facturación.'));
      }
    });
  }

  guardarPerfilFacturacion(): void {
    if (this.frmPerfil.invalid) {
      this.notificationService.showError('Verifica los datos del perfil de facturación (el RUC debe tener 11 dígitos).');
      return;
    }

    this.profileValidationErrors = [];
    this.savingProfile = true;
    const req: IBillingProfileRequest = this.frmPerfil.value;

    const request$ = this.hasBillingProfile
      ? this.clientesService.actualizarPerfilFacturacion(this.customerId, req)
      : this.clientesService.crearPerfilFacturacion(this.customerId, req);

    request$.subscribe({
      next: (resp) => {
        this.savingProfile = false;
        this.hasBillingProfile = true;
        if (resp?.data) {
          this.frmPerfil.patchValue(resp.data);
        }
        this.notificationService.showSuccess('Perfil de facturación guardado correctamente.');
        this.cargarResumenCuenta();
      },
      error: (err) => {
        this.savingProfile = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.profileValidationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el perfil de facturación.'));
        }
      }
    });
  }

  private cargarContactos(): void {
    this.loadingContactos = true;
    this.clientesService.listarContactos(this.customerId).subscribe({
      next: (resp) => {
        this.contactos = resp?.data ?? [];
        this.loadingContactos = false;
      },
      error: (err) => {
        this.loadingContactos = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los contactos.'));
      }
    });
  }

  agregarContacto(): void {
    const dialogRef = this.dialog.open(DialogFormContactoComponent, {
      data: { customerId: this.customerId, esNuevo: true, contacto: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarContactos();
      }
    });
  }

  editarContacto(contacto: ICustomerContact): void {
    const dialogRef = this.dialog.open(DialogFormContactoComponent, {
      data: { customerId: this.customerId, esNuevo: false, contacto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarContactos();
      }
    });
  }

  eliminarContacto(contacto: ICustomerContact): void {
    if (!confirm(`¿Está seguro de eliminar el contacto "${contacto.fullName}"?`)) {
      return;
    }

    this.clientesService.eliminarContacto(contacto.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Contacto eliminado correctamente.');
        this.cargarContactos();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el contacto.'));
      }
    });
  }

  private cargarResumenCuenta(): void {
    this.loadingResumen = true;
    this.clientesService.obtenerResumenCuenta(this.customerId).subscribe({
      next: (resp) => {
        this.resumen = resp?.data ?? null;
        this.loadingResumen = false;
      },
      error: (err) => {
        this.loadingResumen = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el resumen de cuenta.'));
      }
    });
  }

}
