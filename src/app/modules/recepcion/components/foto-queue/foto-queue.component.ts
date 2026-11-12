import { Component, ElementRef, Input, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InspeccionService } from '../../services/inspeccion.service';
import { extractErrorMessage } from '../../shared/http-error.util';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 15;

export interface FotoQueueItem {
  file: File;
  previewUrl: string;
  status: 'pendiente' | 'subiendo' | 'ok' | 'error';
  errorMessage?: string;
}

@Component({
  selector: 'app-foto-queue',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './foto-queue.component.html',
  styleUrl: './foto-queue.component.css'
})
export class FotoQueueComponent implements OnDestroy {

  @Input() workGuideId: number | null = null;

  private inspeccionService = inject(InspeccionService);

  @ViewChild('inputCamara') inputCamara!: ElementRef<HTMLInputElement>;

  cola: FotoQueueItem[] = [];
  subiendoTodo = false;
  errorMessage = '';

  get pendientes(): number {
    return this.cola.filter(f => f.status === 'pendiente' || f.status === 'error').length;
  }

  get subidas(): number {
    return this.cola.filter(f => f.status === 'ok').length;
  }

  abrirCamara(): void {
    this.inputCamara.nativeElement.click();
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.agregarArchivos(input.files);
    input.value = '';
  }

  agregarArchivos(archivos: FileList | File[] | null): void {
    if (!archivos || archivos.length === 0) {
      return;
    }

    this.errorMessage = '';
    Array.from(archivos).forEach((file) => {
      if (!TIPOS_PERMITIDOS.includes(file.type)) {
        this.errorMessage = `"${file.name}" no es una imagen válida (jpg, png o webp).`;
        return;
      }
      if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
        this.errorMessage = `"${file.name}" supera el tamaño máximo de ${TAMANO_MAXIMO_MB}MB.`;
        return;
      }
      this.cola.push({
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pendiente'
      });
    });
  }

  quitar(item: FotoQueueItem): void {
    if (item.status === 'subiendo') {
      return;
    }
    URL.revokeObjectURL(item.previewUrl);
    this.cola = this.cola.filter(f => f !== item);
  }

  limpiar(): void {
    this.cola.forEach(item => URL.revokeObjectURL(item.previewUrl));
    this.cola = [];
  }

  subirTodo(onFinalizado?: () => void): void {
    if (this.subiendoTodo || !this.workGuideId) {
      return;
    }
    const pendientes = this.cola.filter(f => f.status === 'pendiente' || f.status === 'error');
    if (pendientes.length === 0) {
      onFinalizado?.();
      return;
    }

    this.subiendoTodo = true;
    this.subirSecuencial(pendientes, 0, onFinalizado);
  }

  private subirSecuencial(items: FotoQueueItem[], index: number, onFinalizado?: () => void): void {
    if (index >= items.length) {
      this.subiendoTodo = false;
      onFinalizado?.();
      return;
    }

    const item = items[index];
    item.status = 'subiendo';
    item.errorMessage = undefined;

    this.inspeccionService.agregarFotoGuia(this.workGuideId!, item.file).subscribe({
      next: () => {
        item.status = 'ok';
        this.subirSecuencial(items, index + 1, onFinalizado);
      },
      error: (err) => {
        item.status = 'error';
        item.errorMessage = extractErrorMessage(err, 'No se pudo subir la foto.');
        this.subirSecuencial(items, index + 1, onFinalizado);
      }
    });
  }

  ngOnDestroy(): void {
    this.cola.forEach(item => URL.revokeObjectURL(item.previewUrl));
  }
}
