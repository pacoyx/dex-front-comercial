import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { WorkGuidePhotoResponse } from '../../../../../interfaces/IInspeccion';

export interface IVerFotosData {
  fotos: WorkGuidePhotoResponse[];
  fotoUrls: Map<number, string>;
  startIndex: number;
}

const UMBRAL_SWIPE_PX = 40;

const ETAPA_LABELS: Record<string, string> = {
  Recojo: 'Recojo',
  Revision: 'Revisión',
  Entrega: 'Entrega',
};

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
export class DialogVerFotosComponent {

  readonly dialogRef = inject(MatDialogRef<DialogVerFotosComponent>);
  readonly data = inject<IVerFotosData>(MAT_DIALOG_DATA);

  index = this.data.startIndex ?? 0;

  private touchStartX: number | null = null;

  get fotoActual(): WorkGuidePhotoResponse | undefined {
    return this.data.fotos[this.index];
  }

  get urlActual(): string | undefined {
    const foto = this.fotoActual;
    return foto ? this.data.fotoUrls.get(foto.id) : undefined;
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
    }
  }

  siguiente(): void {
    if (this.haySiguiente) {
      this.index++;
    }
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
