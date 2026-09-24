import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PurchaseSettingServiceService } from '../../../../../services/purchase-setting-service.service';
import { PurchaseOperationsService } from '../../../../../services/purchase-operations.service';
import { IPaymentMethod } from '../../../../../interfaces/IMaestros';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';

@Component({
  selector: 'app-dialog-registrar-pago-compra',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatButtonModule, MatIconModule, CurrencyPipe,
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule
  ],
  templateUrl: './dialog-registrar-pago-compra.component.html',
  styleUrl: './dialog-registrar-pago-compra.component.css'
})
export class DialogRegistrarPagoCompraComponent implements OnInit {
  readonly data = inject<{ purchaseInvoiceId: number, balance: number }>(MAT_DIALOG_DATA);
  purchaseSettingService = inject(PurchaseSettingServiceService);
  purchaseOperationsService = inject(PurchaseOperationsService);
  notificationService = inject(NotificationsSystemService);

  paymentMethods: IPaymentMethod[] = [];
  frmPago: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogRegistrarPagoCompraComponent>,
  ) {
    this.frmPago = this.fb.group({
      paymentMethodId: [null, Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01), Validators.max(this.data.balance)]],
      operationNumber: [''],
      observation: [''],
    });
  }

  ngOnInit(): void {
    this.purchaseSettingService.obtenerMetodosPago().subscribe({
      next: (response) => this.paymentMethods = response.data.filter(m => m.isActive),
      error: () => this.notificationService.showError('No se pudieron cargar los métodos de pago.')
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onSubmit(): void {
    if (this.frmPago.invalid) {
      this.notificationService.showError('Verifique los datos del pago. El monto no puede exceder el saldo pendiente.');
      return;
    }

    this.saving = true;
    this.purchaseOperationsService.registrarPago(this.data.purchaseInvoiceId, this.frmPago.value).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.showSuccess('Pago registrado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.notificationService.showError(validation.join(' '));
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar el pago.'));
        }
      }
    });
  }

}
