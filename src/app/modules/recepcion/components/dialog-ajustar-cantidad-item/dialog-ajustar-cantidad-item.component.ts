import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../services/notification-service.service';
import { EmisionService } from '../../services/emision.service';
import { IAdjustWorkGuideItemQuantityRequest, IAdjustWorkGuideItemQuantityResponse } from '../../interfaces/IWorkGuideItemAdjust';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

interface DialogAjustarCantidadItemData {
  workGuideDetailId: number;
  productName?: string;
  cantidadActual: number;
  precioActual: number;
  totalActual: number;
  /** true = servicio por peso (kilos), false = servicio por unidad. */
  esPorPeso: boolean;
}

@Component({
  selector: 'app-dialog-ajustar-cantidad-item',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-ajustar-cantidad-item.component.html',
  styleUrl: './dialog-ajustar-cantidad-item.component.css'
})
export class DialogAjustarCantidadItemComponent implements OnDestroy {

  readonly data = inject<DialogAjustarCantidadItemData>(MAT_DIALOG_DATA);
  private emisionService = inject(EmisionService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  validationErrors: string[] = [];

  // Recordamos cual de los dos campos edito la persona por ultima vez, para saber cual de los
  // dos mandar al backend (son mutuamente excluyentes -ver AdjustWorkGuideItemQuantityEndpoint).
  private ultimoCampoEditado: 'cantidad' | 'total' = 'cantidad';
  private suscripciones = new Subscription();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAjustarCantidadItemComponent>,
  ) {
    this.form = this.fb.group({
      newQuantity: [this.data.cantidadActual, [Validators.required, Validators.min(0.01)]],
      newTotal: [this.data.totalActual, [Validators.required, Validators.min(0.01)]],
      observation: [''],
    });

    this.suscripciones.add(
      this.form.get('newQuantity')!.valueChanges.subscribe((cantidad: number) => {
        this.ultimoCampoEditado = 'cantidad';
        if (cantidad > 0 && this.data.precioActual > 0) {
          const total = Math.round(cantidad * this.data.precioActual * 100) / 100;
          this.form.get('newTotal')!.setValue(total, { emitEvent: false });
        }
      })
    );

    this.suscripciones.add(
      this.form.get('newTotal')!.valueChanges.subscribe((total: number) => {
        this.ultimoCampoEditado = 'total';
        // Si es por peso, el precio por kilo es fijo y la cantidad (kilos) se recalcula en vivo.
        // Si es por unidad, la cantidad no se mueve (ver explicacion en el html) -el precio
        // unitario es el que se recalcula, pero eso lo hace el backend al grabar.
        if (total > 0 && this.data.esPorPeso && this.data.precioActual > 0) {
          const cantidad = Math.round((total / this.data.precioActual) * 100) / 100;
          this.form.get('newQuantity')!.setValue(cantidad, { emitEvent: false });
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;

    const payload: IAdjustWorkGuideItemQuantityRequest = this.ultimoCampoEditado === 'total'
      ? { newTotal: value.newTotal, observation: value.observation || undefined }
      : { newQuantity: value.newQuantity, observation: value.observation || undefined };

    this.emisionService.ajustarCantidadItemGuia(this.data.workGuideDetailId, payload).subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(`Ítem actualizado. Nuevo total: S/ ${resp.data.newTotal.toFixed(2)}`);
        this.dialogRef.close(resp.data as IAdjustWorkGuideItemQuantityResponse);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo ajustar el ítem.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
