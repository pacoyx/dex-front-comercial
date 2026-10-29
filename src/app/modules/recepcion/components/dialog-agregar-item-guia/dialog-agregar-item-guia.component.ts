import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../services/notification-service.service';
import { MaestrosService } from '../../services/maestros.service';
import { EmisionService } from '../../services/emision.service';
import { IResponseProdServices } from '../../interfaces/IProdServices';
import { IAddWorkGuideItemResponse } from '../../interfaces/IWorkGuideItemAdjust';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

@Component({
  selector: 'app-dialog-agregar-item-guia',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule,
  ],
  templateUrl: './dialog-agregar-item-guia.component.html',
  styleUrl: './dialog-agregar-item-guia.component.css'
})
export class DialogAgregarItemGuiaComponent implements OnInit {

  readonly data = inject<{ workGuideMainId: number }>(MAT_DIALOG_DATA);
  private maestrosService = inject(MaestrosService);
  private emisionService = inject(EmisionService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  loadingServicios = false;
  validationErrors: string[] = [];
  servicios: IResponseProdServices[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAgregarItemGuiaComponent>,
  ) {
    this.form = this.fb.group({
      serviceItemId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(0.01)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      observation: [''],
    });
  }

  ngOnInit(): void {
    this.loadingServicios = true;
    this.maestrosService.obtenerProdServices(1, 500).subscribe({
      next: (resp) => {
        this.servicios = (resp.data.servicios || []).filter(s => s.status === 'A');
        this.loadingServicios = false;
      },
      error: (err) => {
        this.loadingServicios = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el catálogo de servicios.'));
      }
    });
  }

  onServicioSeleccionado(serviceItemId: number): void {
    const servicio = this.servicios.find(s => s.id === serviceItemId);
    if (servicio) {
      this.form.patchValue({ unitPrice: servicio.price });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;

    this.emisionService.agregarItemGuia(this.data.workGuideMainId, {
      serviceItemId: value.serviceItemId,
      quantity: value.quantity,
      unitPrice: value.unitPrice,
      observation: value.observation || undefined,
    }).subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(`Ítem agregado. Nuevo total: S/ ${resp.data.newTotal.toFixed(2)}`);
        this.dialogRef.close(resp.data as IAddWorkGuideItemResponse);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo agregar el ítem a la guía.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
