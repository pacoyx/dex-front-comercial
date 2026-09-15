import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { CollectionSheetsService } from '../../../services/collection-sheets.service';
import { ICollectionSheet } from '../../../interfaces/ICollectionSheets';
import { IInvoicePayment } from '../../../interfaces/IInvoices';
import { CollectionSheetStatus, CollectionSheetStatusColorPipe, CollectionSheetStatusLabelPipe } from '../../../shared/collection-sheet-status';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogAgregarCobroComponent } from './components/dialog-agregar-cobro/dialog-agregar-cobro.component';

@Component({
  selector: 'app-planilla-detail',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatTableModule, RouterModule, CurrencyPipe, DatePipe,
    CollectionSheetStatusLabelPipe, CollectionSheetStatusColorPipe
  ],
  templateUrl: './planilla-detail.component.html',
  styleUrl: './planilla-detail.component.css'
})
export class PlanillaDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  collectionSheetsService = inject(CollectionSheetsService);
  notificationService = inject(NotificationsSystemService);
  dialog = inject(MatDialog);

  planillaId = 0;
  planilla: ICollectionSheet | null = null;

  paymentsDataSource = new MatTableDataSource<IInvoicePayment>([]);
  paymentColumns: string[] = ['paymentDate', 'invoiceId', 'paymentMethodName', 'amount', 'operationNumber', 'observation'];

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.planillaId = Number(params['id']);
        this.cargar();
      }
    });
  }

  cargar() {
    this.collectionSheetsService.obtenerPlanillaPorId(this.planillaId).subscribe({
      next: (response) => this.planilla = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener la planilla.'))
    });

    this.collectionSheetsService.listarCobros(this.planillaId).subscribe({
      next: (response) => this.paymentsDataSource.data = response.data,
      error: (err) => this.notificationService.showError(extractErrorMessage(err, 'No se pudieron obtener los cobros.'))
    });
  }

  get isOpen(): boolean {
    return this.planilla?.status === CollectionSheetStatus.Open;
  }

  agregarCobro() {
    if (!this.planilla) return;
    const dialogRef = this.dialog.open(DialogAgregarCobroComponent, {
      data: { collectionSheetId: this.planilla.id }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  cerrarPlanilla() {
    if (!this.planilla) return;
    if (!confirm('¿Está seguro de cerrar esta planilla? Esta acción no se puede deshacer.')) {
      return;
    }
    this.collectionSheetsService.cerrarPlanilla(this.planilla.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Planilla cerrada correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cerrar la planilla.'));
      }
    });
  }

}
