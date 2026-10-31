import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FixedAssetsService } from '../../services/fixed-assets.service';
import { IFixedAssetDetail } from '../../interfaces/IFixedAsset';
import { FixedAssetStatus, FixedAssetStatusColorPipe, FixedAssetStatusLabelPipe } from '../../shared/fixed-asset-status';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogReassignFixedAssetComponent } from './components/dialog-reassign/dialog-reassign.component';
import { DialogDisposeFixedAssetComponent } from './components/dialog-dispose/dialog-dispose.component';
import { DialogMaintenanceComponent } from './components/dialog-maintenance/dialog-maintenance.component';

export interface TimelineEvent {
  date: string;
  type: 'acquisition' | 'reassignment' | 'maintenance' | 'disposal';
  icon: string;
  title: string;
  subtitle?: string;
  cost?: number;
  observations?: string | null;
  attachments?: { id: number; originalFileName: string }[];
}

@Component({
  selector: 'app-fixed-asset-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatCardModule, MatDialogModule, MatIconModule, MatTooltipModule,
    FixedAssetStatusLabelPipe, FixedAssetStatusColorPipe,
  ],
  templateUrl: './fixed-asset-detail.component.html',
  styleUrl: './fixed-asset-detail.component.css'
})
export class FixedAssetDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fixedAssetsService = inject(FixedAssetsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  readonly FixedAssetStatus = FixedAssetStatus;

  asset: IFixedAssetDetail | null = null;
  timeline: TimelineEvent[] = [];
  cargando = false;
  descargandoId: number | null = null;

  get assetId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.fixedAssetsService.obtenerDetalle(this.assetId).subscribe({
      next: (resp) => {
        this.asset = resp.data;
        this.timeline = this.construirTimeline(resp.data);
        this.cargando = false;
      },
      error: (err) => {
        this.cargando = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el activo fijo.'));
      },
    });
  }

  private construirTimeline(asset: IFixedAssetDetail): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    events.push({
      date: asset.acquisitionDate,
      type: 'acquisition',
      icon: 'add_shopping_cart',
      title: 'Adquisición',
      subtitle: `Costo: ${asset.acquisitionCost.toFixed(2)}${asset.supplierName ? ' — Proveedor: ' + asset.supplierName : ''}`,
    });

    for (const r of asset.reassignments) {
      events.push({
        date: r.date,
        type: 'reassignment',
        icon: 'swap_horiz',
        title: `Reasignado a ${r.newBranchName}`,
        subtitle: [
          r.previousBranchName ? `Antes: ${r.previousBranchName}` : null,
          r.newResponsibleUserName ? `Responsable: ${r.newResponsibleUserName}` : null,
        ].filter(Boolean).join(' · '),
        observations: r.reason,
      });
    }

    for (const m of asset.maintenances) {
      events.push({
        date: m.date,
        type: 'maintenance',
        icon: 'build',
        title: m.description,
        subtitle: m.type === 1 ? 'Preventivo' : 'Correctivo',
        cost: m.cost,
        observations: m.observations,
        attachments: m.attachments.map(a => ({ id: a.id, originalFileName: a.originalFileName })),
      });
    }

    if (asset.disposalDate) {
      events.push({
        date: asset.disposalDate,
        type: 'disposal',
        icon: 'delete_forever',
        title: asset.status === FixedAssetStatus.Sold ? 'Vendido' : 'Dado de baja',
        observations: asset.disposalReason,
      });
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  reasignar(): void {
    if (!this.asset) return;
    this.dialog.open(DialogReassignFixedAssetComponent, {
      width: '480px',
      data: { assetId: this.asset.id, currentBranchId: this.asset.branchId },
    }).afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
  }

  registrarMantenimiento(): void {
    if (!this.asset) return;
    this.dialog.open(DialogMaintenanceComponent, {
      width: '560px',
      data: { assetId: this.asset.id },
    }).afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
  }

  darDeBaja(): void {
    if (!this.asset) return;
    this.dialog.open(DialogDisposeFixedAssetComponent, {
      width: '480px',
      data: { assetId: this.asset.id },
    }).afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
  }

  descargarAdjunto(attachmentId: number, fileName: string): void {
    if (this.descargandoId !== null) return;
    this.descargandoId = attachmentId;
    this.fixedAssetsService.descargarAdjuntoMantenimiento(attachmentId).subscribe({
      next: (blob) => {
        this.descargandoId = null;
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      },
      error: (err) => {
        this.descargandoId = null;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo abrir el archivo.'));
      },
    });
  }

  volver(): void {
    this.router.navigate(['/fixed-assets']);
  }
}
