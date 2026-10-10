import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../../recepcion/components/dialog-question/dialog-question.component';
import { PickupGuidesService } from '../../../services/pickup-guides.service';
import { IPickupGuide } from '../../../interfaces/IPickupGuide';
import { PickupGuideStatus } from '../../../shared/pickup-guide-status';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { StatusSelectorComponent } from './components/status-selector/status-selector.component';

@Component({
  selector: 'app-pickup-guide-detail',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatTableModule, RouterModule, LoadingComponent,
    CurrencyPipe, DatePipe, DecimalPipe, StatusSelectorComponent,
  ],
  templateUrl: './pickup-guide-detail.component.html',
  styleUrl: './pickup-guide-detail.component.css'
})
export class PickupGuideDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private pickupGuidesService = inject(PickupGuidesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  guideId = 0;
  guide: IPickupGuide | null = null;
  loading = true;

  detailColumns: string[] = ['serviceItemName', 'quantity', 'weight', 'unitPrice', 'total', 'observation'];

  readonly PickupGuideStatus = PickupGuideStatus;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!id) return;
      this.guideId = id;
      this.cargarGuia();
    });
  }

  private cargarGuia(): void {
    this.loading = true;
    this.pickupGuidesService.obtenerPorId(this.guideId).subscribe({
      next: (resp) => {
        this.guide = resp.data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener la guía de recojo.'));
      },
    });
  }

  get canEdit(): boolean {
    return this.guide?.status === PickupGuideStatus.Draft;
  }

  get canCancel(): boolean {
    return !!this.guide && this.guide.status !== PickupGuideStatus.Cancelled && this.guide.status !== PickupGuideStatus.Invoiced;
  }

  cambiarEstado(status: PickupGuideStatus): void {
    if (!this.guide) return;
    this.pickupGuidesService.cambiarEstado(this.guide.id, { status }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Estado actualizado correctamente.');
        this.cargarGuia();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar el estado de la guía.'));
      },
    });
  }

  anular(): void {
    if (!this.guide) return;
    const dialogRef = this.dialog.open(DialogQuestionComponent, {
      width: '400px',
      data: {
        title: 'Anular Guía de Recojo',
        message: `¿Está seguro de anular la guía "${this.guide.guideNumber}"? Esta acción no se puede deshacer.`,
        msgButton: 'Anular',
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'OK') {
        this.cambiarEstado(PickupGuideStatus.Cancelled);
      }
    });
  }

}
