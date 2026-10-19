import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { DialogQuestionComponent } from '../../../../recepcion/components/dialog-question/dialog-question.component';
import { PickupGuidesService } from '../../../services/pickup-guides.service';
import { IPickupGuide, IPickupGuideAttachment, IPickupGuideRevision, PickupGuideAttachmentType } from '../../../interfaces/IPickupGuide';
import {
  PickupGuideEmailStatusColorPipe,
  PickupGuideEmailStatusLabelPipe,
  PickupGuideStatus,
} from '../../../shared/pickup-guide-status';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { StatusSelectorComponent } from './components/status-selector/status-selector.component';
import { DialogVerFotoRevisionComponent, IFotoLightbox } from './components/dialog-ver-foto-revision/dialog-ver-foto-revision.component';

const EVIDENCIAS_TAB_INDEX = 2;
const REVISIONES_TAB_INDEX = 3;

@Component({
  selector: 'app-pickup-guide-detail',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatTableModule, MatTabsModule, RouterModule, LoadingComponent,
    CurrencyPipe, DatePipe, DecimalPipe, StatusSelectorComponent, PickupGuideEmailStatusLabelPipe, PickupGuideEmailStatusColorPipe,
  ],
  templateUrl: './pickup-guide-detail.component.html',
  styleUrl: './pickup-guide-detail.component.css'
})
export class PickupGuideDetailComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private pickupGuidesService = inject(PickupGuidesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  guideId = 0;
  guide: IPickupGuide | null = null;
  loading = true;
  resendingEmail = false;
  cambiandoEstado = false;

  detailColumns: string[] = ['serviceItemName', 'quantity', 'weight', 'unitPrice', 'total', 'observation'];
  revisionDetailColumns: string[] = ['actionType', 'serviceItemName', 'originalQuantity', 'newQuantity', 'reason'];

  readonly PickupGuideStatus = PickupGuideStatus;
  readonly AttachmentType = PickupGuideAttachmentType;

  attachmentUrls = new Map<number, string>();
  loadingAttachments = false;
  private attachmentsLoaded = false;

  revisiones: IPickupGuideRevision[] = [];
  loadingRevisiones = false;
  private revisionesLoaded = false;
  revisionPhotoUrls = new Map<number, string>();

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!id) return;
      this.guideId = id;
      this.cargarGuia();
    });
  }

  ngOnDestroy(): void {
    this.liberarUrls();
  }

  private liberarUrls(): void {
    this.attachmentUrls.forEach(url => URL.revokeObjectURL(url));
    this.attachmentUrls.clear();
    this.revisionPhotoUrls.forEach(url => URL.revokeObjectURL(url));
    this.revisionPhotoUrls.clear();
  }

  private cargarGuia(): void {
    this.loading = true;
    this.attachmentsLoaded = false;
    this.revisionesLoaded = false;
    this.revisiones = [];
    this.liberarUrls();
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

  get canResendEmail(): boolean {
    return !!this.guide && this.guide.status !== PickupGuideStatus.Draft;
  }

  onTabChange(event: MatTabChangeEvent): void {
    if (event.index === EVIDENCIAS_TAB_INDEX) {
      this.cargarEvidencias();
    }
    if (event.index === REVISIONES_TAB_INDEX) {
      this.cargarRevisiones();
    }
  }

  private cargarRevisiones(): void {
    if (this.revisionesLoaded || !this.guide) {
      return;
    }
    this.revisionesLoaded = true;
    this.loadingRevisiones = true;

    this.pickupGuidesService.listarRevisiones(this.guideId).subscribe({
      next: (resp) => {
        this.revisiones = resp.data ?? [];
        this.loadingRevisiones = false;
        this.cargarFotosDeRevisiones();
      },
      error: (err) => {
        this.loadingRevisiones = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el historial de revisiones.'));
      },
    });
  }

  private cargarFotosDeRevisiones(): void {
    this.revisiones.forEach(revision => {
      revision.photos.forEach(photo => {
        this.pickupGuidesService.descargarFotoRevision(photo.id).subscribe({
          next: (blob) => this.revisionPhotoUrls.set(photo.id, URL.createObjectURL(blob)),
          error: () => { /* si falla una miniatura, simplemente no se muestra */ },
        });
      });
    });
  }

  urlFotoRevision(photoId: number): string | null {
    return this.revisionPhotoUrls.get(photoId) ?? null;
  }

  abrirFotoRevision(revision: IPickupGuideRevision, index: number): void {
    const fotos: IFotoLightbox[] = revision.photos
      .map(photo => ({ url: this.urlFotoRevision(photo.id), nombre: photo.originalFileName ?? photo.fileName }))
      .filter((f): f is IFotoLightbox => !!f.url);

    if (fotos.length === 0) {
      return;
    }

    this.dialog.open(DialogVerFotoRevisionComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: { fotos, startIndex: index },
    });
  }

  private cargarEvidencias(): void {
    if (this.attachmentsLoaded || !this.guide || this.guide.attachments.length === 0) {
      this.attachmentsLoaded = true;
      return;
    }
    this.attachmentsLoaded = true;
    this.loadingAttachments = true;

    let pendientes = this.guide.attachments.length;
    this.guide.attachments.forEach(attachment => {
      this.pickupGuidesService.descargarAdjunto(attachment.id).subscribe({
        next: (blob) => {
          this.attachmentUrls.set(attachment.id, URL.createObjectURL(blob));
          pendientes--;
          if (pendientes === 0) this.loadingAttachments = false;
        },
        error: (err) => {
          pendientes--;
          if (pendientes === 0) this.loadingAttachments = false;
          this.notificationService.showError(extractErrorMessage(err, `No se pudo cargar el archivo "${attachment.originalFileName}".`));
        },
      });
    });
  }

  urlDe(attachment: IPickupGuideAttachment): string | null {
    return this.attachmentUrls.get(attachment.id) ?? null;
  }

  descargar(attachment: IPickupGuideAttachment): void {
    const url = this.urlDe(attachment);
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = attachment.originalFileName;
    a.click();
  }

  verEnNuevaPestana(attachment: IPickupGuideAttachment): void {
    const url = this.urlDe(attachment);
    if (!url) return;
    window.open(url, '_blank');
  }

  formatearTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  cambiarEstado(status: PickupGuideStatus): void {
    if (!this.guide) return;

    if (this.guide.status === PickupGuideStatus.Draft && status === PickupGuideStatus.Collected) {
      const dialogRef = this.dialog.open(DialogQuestionComponent, {
        width: '440px',
        data: {
          title: 'Confirmar Recolección',
          message: 'Se generará la constancia PDF y se enviará por correo al cliente automáticamente. ¿Desea continuar?',
          msgButton: 'Continuar',
        },
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'OK') this.ejecutarCambioEstado(status);
      });
      return;
    }

    this.ejecutarCambioEstado(status);
  }

  private ejecutarCambioEstado(status: PickupGuideStatus): void {
    if (!this.guide) return;
    this.cambiandoEstado = true;
    this.pickupGuidesService.cambiarEstado(this.guide.id, { status }).subscribe({
      next: () => {
        this.notificationService.showSuccess('Estado actualizado correctamente.');
        this.cambiandoEstado = false;
        this.cargarGuia();
      },
      error: (err) => {
        this.cambiandoEstado = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar el estado de la guía.'));
      },
    });
  }

  reenviarConstancia(): void {
    if (!this.guide) return;
    this.resendingEmail = true;
    this.pickupGuidesService.reenviarCorreo(this.guide.id).subscribe({
      next: (resp) => {
        this.resendingEmail = false;
        if (resp.success) {
          this.notificationService.showSuccess(resp.message);
        } else {
          this.notificationService.showError(resp.message);
        }
        this.cargarGuia();
      },
      error: (err) => {
        this.resendingEmail = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo reenviar la constancia.'));
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
        this.ejecutarCambioEstado(PickupGuideStatus.Cancelled);
      }
    });
  }

}
