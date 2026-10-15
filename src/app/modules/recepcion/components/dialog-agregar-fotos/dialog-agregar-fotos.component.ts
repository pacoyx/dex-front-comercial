import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { InspeccionService } from '../../services/inspeccion.service';
import { extractErrorMessage } from '../../shared/http-error.util';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 15;

interface FotoQueueItem {
  file: File;
  previewUrl: string;
  status: 'pendiente' | 'subiendo' | 'ok' | 'error';
  errorMessage?: string;
}

@Component({
  selector: 'app-dialog-agregar-fotos',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatTooltipModule,
    MatDialogTitle, MatDialogContent, MatDialogActions
  ],
  templateUrl: './dialog-agregar-fotos.component.html',
  styleUrl: './dialog-agregar-fotos.component.css'
})
export class DialogAgregarFotosComponent implements OnDestroy {

  readonly dialogRef = inject(MatDialogRef<DialogAgregarFotosComponent>);
  readonly data = inject<{ workGuideId: number }>(MAT_DIALOG_DATA);
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
    const archivos = input.files;
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

    input.value = '';
  }

  quitar(item: FotoQueueItem): void {
    if (item.status === 'subiendo') {
      return;
    }
    URL.revokeObjectURL(item.previewUrl);
    this.cola = this.cola.filter(f => f !== item);
  }

  subirTodo(): void {
    if (this.subiendoTodo) {
      return;
    }
    const pendientes = this.cola.filter(f => f.status === 'pendiente' || f.status === 'error');
    if (pendientes.length === 0) {
      return;
    }

    this.subiendoTodo = true;
    this.subirSecuencial(pendientes, 0);
  }

  private subirSecuencial(items: FotoQueueItem[], index: number): void {
    if (index >= items.length) {
      this.subiendoTodo = false;
      return;
    }

    const item = items[index];
    item.status = 'subiendo';
    item.errorMessage = undefined;

    this.inspeccionService.agregarFotoGuia(this.data.workGuideId, item.file).subscribe({
      next: () => {
        item.status = 'ok';
        this.subirSecuencial(items, index + 1);
      },
      error: (err) => {
        item.status = 'error';
        item.errorMessage = extractErrorMessage(err, 'No se pudo subir la foto.');
        this.subirSecuencial(items, index + 1);
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close({ subidas: this.subidas });
  }

  ngOnDestroy(): void {
    this.cola.forEach(item => URL.revokeObjectURL(item.previewUrl));
  }
}
