import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CustomDateAdapter } from '../../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { PriceListsService } from '../../../../services/price-lists.service';
import { ICustomerPriceList } from '../../../../interfaces/IPriceList';
import { IProdServiceCatalogItem } from '../../../../interfaces/ICatalogos';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

export interface IDialogFormTarifaData {
  esNuevo: boolean;
  customerId: number;
  tarifa: ICustomerPriceList | null;
  servicios: IProdServiceCatalogItem[];
}

@Component({
  selector: 'app-dialog-form-tarifa',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, MatCheckboxModule, MatTableModule, LoadingComponent,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dialog-form-tarifa.component.html',
  styleUrl: './dialog-form-tarifa.component.css'
})
export class DialogFormTarifaComponent {
  readonly data = inject<IDialogFormTarifaData>(MAT_DIALOG_DATA);
  private priceListsService = inject(PriceListsService);
  private notificationService = inject(NotificationsSystemService);

  titulo = this.data.esNuevo ? 'Nueva Tarifa' : 'Editar Precios';
  saving = false;
  validationErrors: string[] = [];

  name = this.data.tarifa?.name ?? '';
  effectiveFrom: Date = this.data.tarifa ? new Date(this.data.tarifa.effectiveFrom) : new Date();
  effectiveTo: Date | null = this.data.tarifa?.effectiveTo ? new Date(this.data.tarifa.effectiveTo) : null;
  activate = false;

  precios: Record<number, number> = {};
  displayedColumns: string[] = ['name', 'unitPrice'];

  constructor(
    private dialogRef: MatDialogRef<DialogFormTarifaComponent>,
  ) {
    const existentes = new Map((this.data.tarifa?.details ?? []).map(d => [d.serviceItemId, d.unitPrice]));
    this.data.servicios.forEach(s => {
      this.precios[s.id] = existentes.get(s.id) ?? 0;
    });
  }

  get isValid(): boolean {
    return this.name.trim() !== '' && !!this.effectiveFrom;
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (!this.isValid) return;

    const details = this.data.servicios.map(s => ({
      serviceItemId: s.id,
      unitPrice: this.precios[s.id] ?? 0,
    }));

    this.saving = true;
    this.validationErrors = [];

    if (this.data.esNuevo) {
      this.priceListsService.crear(this.data.customerId, {
        name: this.name,
        effectiveFrom: this.effectiveFrom.toISOString(),
        effectiveTo: this.effectiveTo ? this.effectiveTo.toISOString() : null,
        activate: this.activate,
        details,
      }).subscribe({
        next: (resp) => {
          this.saving = false;
          this.notificationService.showSuccess('Tarifa registrada correctamente.');
          this.dialogRef.close(resp.data);
        },
        error: (err) => this.manejarError(err),
      });
    } else {
      this.priceListsService.actualizar(this.data.tarifa!.id, {
        name: this.name,
        effectiveFrom: this.effectiveFrom.toISOString(),
        effectiveTo: this.effectiveTo ? this.effectiveTo.toISOString() : null,
        details,
      }).subscribe({
        next: (resp) => {
          this.saving = false;
          this.notificationService.showSuccess('Precios de la tarifa actualizados correctamente.');
          this.dialogRef.close(resp.data);
        },
        error: (err) => this.manejarError(err),
      });
    }
  }

  private manejarError(err: unknown): void {
    this.saving = false;
    const validation = extractValidationErrors(err);
    if (validation.length > 0) {
      this.validationErrors = validation;
    } else {
      this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al guardar la tarifa.'));
    }
  }

}
