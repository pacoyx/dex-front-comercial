import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FixedAssetsService } from '../../services/fixed-assets.service';
import { IFixedAssetCategory, IFixedAssetDetail, IFixedAssetMaintenance } from '../../interfaces/IFixedAsset';
import { FixedAssetStatus, FixedAssetStatusColorPipe, FixedAssetStatusLabelPipe } from '../../shared/fixed-asset-status';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogReassignFixedAssetComponent } from './components/dialog-reassign/dialog-reassign.component';
import { DialogDisposeFixedAssetComponent } from './components/dialog-dispose/dialog-dispose.component';
import { DialogMaintenanceComponent } from './components/dialog-maintenance/dialog-maintenance.component';
import { DialogFinishMaintenanceComponent } from './components/dialog-finish-maintenance/dialog-finish-maintenance.component';
import { DialogFormFixedAssetComponent } from '../fixed-assets-list/components/dialog-form-fixed-asset/dialog-form-fixed-asset.component';
import { CatalogosService } from '../../../facturacion/services/catalogos.service';
import { IBranchSales } from '../../../facturacion/interfaces/ICatalogos';
import { descargarArchivo } from '../../../gastos/shared/file-download.util';

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
export class FixedAssetDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private catalogosService = inject(CatalogosService);
  private router = inject(Router);
  private fixedAssetsService = inject(FixedAssetsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  readonly FixedAssetStatus = FixedAssetStatus;

  asset: IFixedAssetDetail | null = null;
  timeline: TimelineEvent[] = [];
  cargando = false;
  descargandoId: number | null = null;
  descargandoFicha = false;

  /** Object URL de la foto del activo (se pide como blob porque el endpoint requiere token). */
  fotoUrl: string | null = null;
  private fotoCargadaVersion: string | null = null;

  private branches: IBranchSales[] = [];
  private categories: IFixedAssetCategory[] = [];

  get assetId(): number {
    return Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    this.cargar();
    this.catalogosService.obtenerSucursales().subscribe({ next: (resp) => this.branches = resp.data });
    this.fixedAssetsService.listarCategorias().subscribe({ next: (resp) => this.categories = resp.data });
  }

  ngOnDestroy(): void {
    this.liberarFoto();
  }

  cargar(): void {
    this.cargando = true;
    this.fixedAssetsService.obtenerDetalle(this.assetId).subscribe({
      next: (resp) => {
        this.asset = resp.data;
        this.timeline = this.construirTimeline(resp.data);
        this.cargando = false;
        this.cargarFoto(resp.data);
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

    const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('es-PE') : '';

    for (const m of asset.maintenances) {
      const partes: (string | null)[] = [m.type === 1 ? 'Preventivo' : 'Correctivo'];
      if (m.serviceProvider) partes.push(`Proveedor/técnico: ${m.serviceProvider}`);
      if (m.putsAssetOutOfService) {
        partes.push(m.actualEndDate
          ? `Fuera de servicio del ${fmt(m.date)} al ${fmt(m.actualEndDate)}`
          : `En mantenimiento desde ${fmt(m.date)} (fin estimado ${fmt(m.estimatedEndDate)})`);
        partes.push(`Motivo: ${m.outOfServiceReason}`);
      }

      events.push({
        date: m.date,
        type: 'maintenance',
        icon: m.putsAssetOutOfService && !m.actualEndDate ? 'engineering' : 'build',
        title: m.description,
        subtitle: partes.filter(Boolean).join(' · '),
        cost: m.cost,
        observations: [m.observations, m.closingNotes ? `Cierre: ${m.closingNotes}` : null].filter(Boolean).join('\n') || null,
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

  private cargarFoto(asset: IFixedAssetDetail): void {
    if (!asset.hasPhoto) {
      this.liberarFoto();
      return;
    }
    // Solo se vuelve a descargar si la foto cambió
    if (this.fotoUrl && this.fotoCargadaVersion === asset.photoUpdatedAt) return;

    this.fixedAssetsService.obtenerFoto(asset.id).subscribe({
      next: (blob) => {
        this.liberarFoto();
        this.fotoUrl = URL.createObjectURL(blob);
        this.fotoCargadaVersion = asset.photoUpdatedAt;
      },
      error: () => this.liberarFoto(),
    });
  }

  private liberarFoto(): void {
    if (this.fotoUrl) URL.revokeObjectURL(this.fotoUrl);
    this.fotoUrl = null;
    this.fotoCargadaVersion = null;
  }

  descargarFicha(): void {
    if (!this.asset) return;
    const code = this.asset.code;
    this.descargandoFicha = true;
    this.fixedAssetsService.descargarFichaPdf(this.asset.id).subscribe({
      next: (resp) => {
        this.descargandoFicha = false;
        descargarArchivo(resp, `FichaActivo_${code}.pdf`);
      },
      error: (err) => {
        this.descargandoFicha = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo generar la ficha PDF.'));
      },
    });
  }

  verFoto(): void {
    if (this.fotoUrl) window.open(this.fotoUrl, '_blank');
  }

  editar(): void {
    if (!this.asset) return;
    this.dialog.open(DialogFormFixedAssetComponent, {
      width: '640px',
      data: {
        branches: this.branches,
        categories: this.categories,
        asset: this.asset,
        currentPhotoUrl: this.fotoUrl,
      },
    }).afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
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
      data: {
        assetId: this.asset.id,
        puedePonerEnMantenimiento: this.asset.status === FixedAssetStatus.Active,
      },
    }).afterClosed().subscribe(result => {
      if (result) this.cargar();
    });
  }

  /** Mantenimiento que dejó el activo fuera de servicio y aún no se finaliza. */
  get mantenimientoEnCurso(): IFixedAssetMaintenance | null {
    return this.asset?.maintenances.find(m => m.putsAssetOutOfService && !m.actualEndDate) ?? null;
  }

  get mantenimientoVencido(): boolean {
    const m = this.mantenimientoEnCurso;
    if (!m?.estimatedEndDate) return false;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return new Date(m.estimatedEndDate) < hoy;
  }

  finalizarMantenimiento(): void {
    const maintenance = this.mantenimientoEnCurso;
    if (!maintenance) return;
    this.dialog.open(DialogFinishMaintenanceComponent, {
      width: '480px',
      data: { maintenance },
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
