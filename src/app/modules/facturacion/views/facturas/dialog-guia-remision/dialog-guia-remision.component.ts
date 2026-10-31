import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GuiasRemisionService } from '../../../services/guias-remision.service';
import { VehiclesService } from '../../../../corporate-operations/services/vehicles.service';
import { IVehicle } from '../../../../corporate-operations/interfaces/IVehicle';
import { IGuiaRemision } from '../../../interfaces/IGuiaRemision';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';

export interface DialogGuiaRemisionData {
  invoiceId: number;
  invoiceSerie: string;
  invoiceNumero: string;
  guia?: IGuiaRemision;
}

@Component({
  selector: 'app-dialog-guia-remision',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-guia-remision.component.html',
  styleUrl: './dialog-guia-remision.component.css',
})
export class DialogGuiaRemisionComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DialogGuiaRemisionComponent>);
  readonly data = inject<DialogGuiaRemisionData>(MAT_DIALOG_DATA);

  private guiasRemisionService = inject(GuiasRemisionService);
  private vehiclesService = inject(VehiclesService);
  private notificationService = inject(NotificationsSystemService);

  guia: IGuiaRemision | null = this.data.guia ?? null;
  vehiculos: IVehicle[] = [];

  guardando = false;
  imprimiendo = false;

  form = new FormGroup({
    driverName: new FormControl('', [Validators.required, Validators.maxLength(150)]),
    driverDni: new FormControl('', [Validators.required, Validators.maxLength(20)]),
    deliveryAddress: new FormControl('', [Validators.maxLength(300)]),
    fechaTraslado: new FormControl('', [Validators.required]),
    motivoTraslado: new FormControl('Venta', [Validators.maxLength(100)]),
    vehicleId: new FormControl<number | null>(null),
  });

  ngOnInit(): void {
    if (!this.guia) {
      this.vehiclesService.listar().subscribe({
        next: (response) => (this.vehiculos = response.data),
        error: () => (this.vehiculos = []),
      });
    }
  }

  crear(): void {
    if (this.form.invalid || this.guardando) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const valor = this.form.getRawValue();

    this.guiasRemisionService.crearGuiaRemision({
      serie: this.data.invoiceSerie,
      numero: this.data.invoiceNumero,
      driverName: valor.driverName!,
      driverDni: valor.driverDni!,
      deliveryAddress: valor.deliveryAddress!,
      fechaTraslado: valor.fechaTraslado!,
      motivoTraslado: valor.motivoTraslado || undefined,
      vehicleId: valor.vehicleId ?? undefined,
    }).subscribe({
      next: (response) => {
        this.guardando = false;
        this.guia = response.data;
        this.notificationService.showSuccess('Guía de remisión creada correctamente.');
      },
      error: (err) => {
        this.guardando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo crear la guía de remisión.'));
      },
    });
  }

  imprimir(): void {
    if (!this.guia || this.imprimiendo) return;

    this.imprimiendo = true;
    this.guiasRemisionService.descargarGuiaRemisionPdf(this.guia.id).subscribe({
      next: (blob) => {
        this.imprimiendo = false;
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        this.imprimiendo = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar el PDF de la guía de remisión.'));
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(this.guia);
  }
}
