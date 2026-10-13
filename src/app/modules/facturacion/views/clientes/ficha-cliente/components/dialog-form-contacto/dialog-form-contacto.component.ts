import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { ClientesService } from '../../../../../services/clientes.service';
import { ICustomerContact, ICustomerContactRequest } from '../../../../../interfaces/ICustomer';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-contacto',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatCheckboxModule,
    MatDialogActions, MatDialogTitle, MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-form-contacto.component.html',
  styleUrl: './dialog-form-contacto.component.css'
})
export class DialogFormContactoComponent implements OnInit {

  readonly data = inject<{ customerId: number, esNuevo: boolean, contacto: ICustomerContact | null }>(MAT_DIALOG_DATA);
  private clientesService = inject(ClientesService);
  private notificationService = inject(NotificationsSystemService);

  loadingSave = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? 'Agregar Contacto' : 'Actualizar Contacto';

  contactoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormContactoComponent>,
  ) {
    this.contactoForm = this.fb.group({
      fullName: ['', Validators.required],
      position: [''],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      isPrimary: [false],
      receivePickupGuideEmails: [false],
      receiveInvoices: [false],
      receivePortalNotifications: [false],
    });
  }

  ngOnInit(): void {
    if (!this.data.esNuevo && this.data.contacto) {
      this.contactoForm.patchValue(this.data.contacto);
    }
  }

  onSubmit(): void {
    if (this.contactoForm.invalid) {
      this.notificationService.showError('Debe completar los campos obligatorios.');
      return;
    }

    this.validationErrors = [];
    this.loadingSave = true;
    const req: ICustomerContactRequest = this.contactoForm.value;

    const request$ = this.data.esNuevo
      ? this.clientesService.crearContacto(this.data.customerId, req)
      : this.clientesService.actualizarContacto(this.data.contacto!.id, req);

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.data.esNuevo ? 'Contacto agregado correctamente.' : 'Contacto actualizado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el contacto.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
