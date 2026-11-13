import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 10;

/**
 * Selector de foto del activo:
 * - "Tomar foto": abre la cámara con getUserMedia (webcam en PC, cámara trasera en celular/tablet).
 *   Si el navegador no da acceso (sin cámara, permiso denegado o sitio sin HTTPS) cae al
 *   <input capture="environment">, que en móviles abre la app de cámara.
 * - "Subir imagen": elige un archivo.
 *
 * No sube nada: emite el archivo elegido (photoChange) y el componente padre decide
 * cuándo enviarlo, porque al crear un activo primero hace falta su Id.
 */
@Component({
  selector: 'app-fixed-asset-photo-picker',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './fixed-asset-photo-picker.component.html',
  styleUrl: './fixed-asset-photo-picker.component.css',
})
export class FixedAssetPhotoPickerComponent implements OnDestroy {
  /** URL (object URL) de la foto que ya tiene el activo, para mostrarla en modo edición. */
  @Input() currentPhotoUrl: string | null = null;

  /** File nuevo elegido, o null si se quitó la foto. */
  @Output() photoChange = new EventEmitter<File | null>();

  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('inputCamara') inputCamara?: ElementRef<HTMLInputElement>;

  camaraAbierta = false;
  iniciandoCamara = false;
  previewUrl: string | null = null;
  errorMessage = '';
  /** true si el usuario quitó la foto existente (sin elegir otra). */
  quitada = false;

  private stream: MediaStream | null = null;

  get fotoMostrada(): string | null {
    if (this.previewUrl) return this.previewUrl;
    return this.quitada ? null : this.currentPhotoUrl;
  }

  async abrirCamara(): Promise<void> {
    this.errorMessage = '';
    if (!navigator.mediaDevices?.getUserMedia) {
      this.inputCamara?.nativeElement.click();
      return;
    }

    this.iniciandoCamara = true;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      this.camaraAbierta = true;
      // Esperar a que el <video> exista en el DOM
      setTimeout(() => {
        const video = this.videoRef?.nativeElement;
        if (video && this.stream) {
          video.srcObject = this.stream;
          video.play().catch(() => undefined);
        }
      });
    } catch {
      // Sin cámara o permiso denegado: usar el selector nativo (en móviles abre la cámara)
      this.inputCamara?.nativeElement.click();
    } finally {
      this.iniciandoCamara = false;
    }
  }

  capturar(): void {
    const video = this.videoRef?.nativeElement;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) {
        this.errorMessage = 'No se pudo capturar la foto.';
        return;
      }
      const file = new File([blob], `activo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.establecerFoto(file);
      this.cerrarCamara();
    }, 'image/jpeg', 0.9);
  }

  cerrarCamara(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.camaraAbierta = false;
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      this.errorMessage = `"${file.name}" no es un formato válido (jpg, png o webp).`;
      return;
    }
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      this.errorMessage = `La imagen supera el tamaño máximo de ${TAMANO_MAXIMO_MB}MB.`;
      return;
    }
    this.errorMessage = '';
    this.establecerFoto(file);
  }

  quitar(): void {
    this.liberarPreview();
    this.quitada = true;
    this.photoChange.emit(null);
  }

  private establecerFoto(file: File): void {
    this.liberarPreview();
    this.previewUrl = URL.createObjectURL(file);
    this.quitada = false;
    this.photoChange.emit(file);
  }

  private liberarPreview(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
  }

  ngOnDestroy(): void {
    this.cerrarCamara();
    this.liberarPreview();
  }
}
