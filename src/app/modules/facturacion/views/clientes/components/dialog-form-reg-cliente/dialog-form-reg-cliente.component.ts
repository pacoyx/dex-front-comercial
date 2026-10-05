import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { ClientesService } from '../../../../services/clientes.service';
import { CUSTOMER_TYPE_OPTIONS, CustomerType, ICustomer, ICustomerCreateRequest, ICustomerUpdateRequest } from '../../../../interfaces/ICustomer';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-reg-cliente',
  standalone: true,
  imports: [
    FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-form-reg-cliente.component.html',
  styleUrl: './dialog-form-reg-cliente.component.css'
})
export class DialogFormRegClienteComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, objCliente: ICustomer | null }>(MAT_DIALOG_DATA);
  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationsSystemService);
  private router = inject(Router);

  loadingSave = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? 'Registrar Cliente' : 'Actualizar Cliente';
  customerTypeOptions = CUSTOMER_TYPE_OPTIONS;
  readonly CustomerType = CustomerType;

  clienteForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormRegClienteComponent>,
  ) {
    this.clienteForm = this.fb.group({
      id: [0],
      firstName: ['', Validators.required],
      lastName: [''],
      docPersonal: [''],
      phone: [''],
      email: [''],
      address: [''],
      status: ['A', Validators.required],
      customerType: [CustomerType.Company, Validators.required],
      internalCode: [''],
    });
  }

  ngOnInit(): void {
    if (this.data.esNuevo) {
      this.clienteForm.patchValue({ status: 'A', customerType: CustomerType.Company });
    } else if (this.data.objCliente) {
      this.clienteForm.patchValue(this.data.objCliente);
    }
  }

  get esEmpresaExistente(): boolean {
    // Se basa en el tipo YA GUARDADO (no en el valor del combo sin grabar), porque la
    // ficha de facturación requiere que el cliente exista con ese tipo en el backend.
    return !this.data.esNuevo && Number(this.data.objCliente?.customerType) === CustomerType.Company;
  }

  irADatosFacturacion(): void {
    const cliente = this.data.objCliente;
    if (!cliente) return;
    this.dialogRef.close(false);
    this.router.navigate(['/facturacion/clientes', cliente.id], { state: { cliente } });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.notificationService.showError('Debe completar los campos obligatorios.');
      return;
    }

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.clienteForm.value;

    const request$ = this.data.esNuevo
      ? this.clientesService.registrarCliente(value as ICustomerCreateRequest)
      : this.clientesService.actualizarCliente(value as ICustomerUpdateRequest);

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.data.esNuevo ? 'Cliente registrado correctamente.' : 'Cliente actualizado correctamente.');
        this.dialogRef.close(resp);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el cliente.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
