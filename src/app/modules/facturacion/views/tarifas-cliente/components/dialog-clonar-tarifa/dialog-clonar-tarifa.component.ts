import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CustomDateAdapter } from '../../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { PriceListsService } from '../../../../services/price-lists.service';
import { extractErrorMessage } from '../../../../shared/http-error.util';

export interface IDialogClonarTarifaData {
  priceListId: number;
  nombreActual: string;
}

@Component({
  selector: 'app-dialog-clonar-tarifa',
  standalone: true,
  imports: [
    MatDialogActions, MatDialogTitle, MatDialogContent, MatIconModule, MatButtonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatDatepickerModule, LoadingComponent,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dialog-clonar-tarifa.component.html',
  styleUrl: './dialog-clonar-tarifa.component.css'
})
export class DialogClonarTarifaComponent {
  readonly data = inject<IDialogClonarTarifaData>(MAT_DIALOG_DATA);
  private priceListsService = inject(PriceListsService);
  private notificationService = inject(NotificationsSystemService);

  saving = false;
  name = `${this.data.nombreActual} (copia)`;
  effectiveFrom: Date | null = new Date();
  effectiveTo: Date | null = null;

  constructor(
    private dialogRef: MatDialogRef<DialogClonarTarifaComponent>,
  ) { }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    this.saving = true;
    this.priceListsService.clonar(this.data.priceListId, {
      name: this.name || null,
      effectiveFrom: this.effectiveFrom ? this.effectiveFrom.toISOString() : null,
      effectiveTo: this.effectiveTo ? this.effectiveTo.toISOString() : null,
    }).subscribe({
      next: (resp) => {
        this.saving = false;
        this.notificationService.showSuccess('Tarifa clonada correctamente. Ajusta los precios de la nueva versión.');
        this.dialogRef.close(resp.data);
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo clonar la tarifa.'));
      },
    });
  }

}
