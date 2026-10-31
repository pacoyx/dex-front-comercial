import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { InvoicesService } from '../../../services/invoices.service';
import { IInvoiceListItem } from '../../../interfaces/IInvoices';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-buscar-factura',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatTableModule,
  ],
  templateUrl: './dialog-buscar-factura.component.html',
  styleUrl: './dialog-buscar-factura.component.css',
})
export class DialogBuscarFacturaComponent {
  readonly dialogRef = inject(MatDialogRef<DialogBuscarFacturaComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true });

  private invoicesService = inject(InvoicesService);
  private notificationService = inject(NotificationsSystemService);

  numeroControl = new FormControl('');
  buscando = false;
  resultados: IInvoiceListItem[] = [];
  displayedColumns = ['factura', 'cliente', 'emision', 'total', 'seleccionar'];

  buscar(): void {
    const numero = this.numeroControl.value?.trim();
    if (!numero) {
      return;
    }

    this.buscando = true;
    this.invoicesService.listarFacturas({ numero }).subscribe({
      next: (response) => {
        this.buscando = false;
        this.resultados = response.data;
      },
      error: (err) => {
        this.buscando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo buscar la factura.'));
      },
    });
  }

  seleccionar(factura: IInvoiceListItem): void {
    this.dialogRef.close(factura);
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
