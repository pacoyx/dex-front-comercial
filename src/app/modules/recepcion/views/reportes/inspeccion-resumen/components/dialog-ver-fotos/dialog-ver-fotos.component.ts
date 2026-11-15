import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { WorkGuidePhotoResponse } from '../../../../../interfaces/IInspeccion';
import { InspeccionService } from '../../../../../services/inspeccion.service';

export interface IVerFotosData {
  fotos: WorkGuidePhotoResponse[];
  /** URLs de las miniaturas ya cargadas por la pantalla que abre el visor (se muestran mientras carga la completa). */
  fotoUrls: Map<number, string>;
  startIndex: number;
}

const UMBRAL_SWIPE_PX = 40;

const ETAPA_LABELS: Record<string, string> = {
  Recojo: 'Recojo',
  Revision: 'Revisión',
  Entrega: 'Entrega',
};

/**
 * Visor de fotos de la guía. Muestra al instante la miniatura que ya tiene la pantalla y descarga la foto
 * completa solo de la foto actual y la siguiente, en lugar de bajar todas las fotos completas de antemano.
 */
@Component({
  selector: 'app-dialog-ver-fotos',
  standalone: true,
  imports: [
    CommonModule, MatIconModule, MatButtonModule,
    MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose
  ],
  templateUrl: './dialog-ver-fotos.component.html',
  styleUrl: './dialog-ver-fotos.component.css'
})
export class DialogVerFotosComponent implements OnInit, OnDestroy {

  readonly dialogRef = inject(MatDialogRef<DialogVerFotosComponent>);
  readonly data = inject<IVerFotosData>(MAT_DIALOG_DATA);
  private inspeccionService = inject(InspeccionService);

  index = this.data.startIndex ?? 0;

  /** Fotos completas descargadas por este visor (se liberan al cerrarlo). */
  private urlsCompletas = new Map<number, string>();
  private descargando = new Set<number>();
  private cerrado = false;

  private touchStartX: number | null = null;

  ngOnInit(): void {
    this.cargarAlrededor();
  }

  ngOnDestroy(): void {
    this.cerrado = true;
    this.urlsCompletas.forEach((url) => URL.revokeObjectURL(url));
    this.urlsCompletas.clear();
  }

  get fotoActual(): WorkGuidePhotoResponse | undefined {
    return this.data.fotos[this.index];
  }

  /** Foto completa si ya llegó; mientras tanto, la miniatura. */
  get urlActual(): string | undefined {
    const foto = this.fotoActual;
    if (!foto) return undefined;
    return this.urlsCompletas.get(foto.id) ?? this.data.fotoUrls.get(foto.id);
  }

  /** True mientras se muestra la miniatura y la foto completa aún se está descargando. */
  get cargandoCompleta(): boolean {
    const foto = this.fotoActual;
    return !!foto && !this.urlsCompletas.has(foto.id) && this.descargando.has(foto.id);
  }

  get etapaActual(): string {
    const stage = this.fotoActual?.stage;
    return stage ? (ETAPA_LABELS[stage] ?? stage) : '';
  }

  get hayAnterior(): boolean {
    return this.index > 0;
  }

  get haySiguiente(): boolean {
    return this.index < this.data.fotos.length - 1;
  }

  anterior(): void {
    if (this.hayAnterior) {
      this.index--;
      this.cargarAlrededor();
    }
  }

  siguiente(): void {
    if (this.haySiguiente) {
      this.index++;
      this.cargarAlrededor();
    }
  }

  /** Descarga la foto completa actual y precarga la siguiente para que el cambio se sienta inmediato. */
  private cargarAlrededor(): void {
    this.cargarCompleta(this.index);
    this.cargarCompleta(this.index + 1);
  }

  private cargarCompleta(i: number): void {
    const foto = this.data.fotos[i];
    if (!foto || this.urlsCompletas.has(foto.id) || this.descargando.has(foto.id)) return;

    this.descargando.add(foto.id);
    this.inspeccionService.descargarFotoGuia(foto.id).subscribe({
      next: (blob) => {
        this.descargando.delete(foto.id);
        if (this.cerrado) return;
        this.urlsCompletas.set(foto.id, URL.createObjectURL(blob));
      },
      error: () => {
        // Si falla la completa, se sigue mostrando la miniatura.
        this.descargando.delete(foto.id);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.anterior();
    } else if (event.key === 'ArrowRight') {
      this.siguiente();
    }
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].clientX;
  }

  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) {
      return;
    }
    const deltaX = event.changedTouches[0].clientX - this.touchStartX;
    this.touchStartX = null;

    if (Math.abs(deltaX) < UMBRAL_SWIPE_PX) {
      return;
    }
    if (deltaX < 0) {
      this.siguiente();
    } else {
      this.anterior();
    }
  }
}
