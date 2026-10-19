import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { ManagentSystemService } from '../../../../services/managent-system.service';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 2;

@Component({
  selector: 'app-logo-empresa-tab',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, LoadingComponent],
  templateUrl: './logo-empresa-tab.component.html',
  styleUrl: './logo-empresa-tab.component.css'
})
export class LogoEmpresaTabComponent implements OnChanges, OnDestroy {

  @Input() companyId: number | null = null;

  private managementService = inject(ManagentSystemService);
  private notificationService = inject(NotificationsSystemService);

  @ViewChild('inputCamara') inputCamara!: ElementRef<HTMLInputElement>;
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  logoUrl: string | null = null;
  loadingLogo = false;

  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;
  errorArchivo = '';
  loadingSave = false;
  validationErrors: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['companyId'] && this.companyId) {
      this.cargarLogo();
    }
  }

  ngOnDestroy(): void {
    if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

  private cargarLogo(): void {
    if (!this.companyId) return;
    this.loadingLogo = true;
    this.managementService.obtenerLogoEmpresa(this.companyId).subscribe({
      next: (blob) => {
        if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
        this.logoUrl = URL.createObjectURL(blob);
        this.loadingLogo = false;
      },
      error: () => {
        // 404: la empresa todavia no tiene logo cargado.
        if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
        this.logoUrl = null;
        this.loadingLogo = false;
      }
    });
  }

  abrirCamara(): void {
    this.inputCamara.nativeElement.click();
  }

  abrirExplorador(): void {
    this.inputArchivo.nativeElement.click();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.errorArchivo = '';

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      this.errorArchivo = `"${file.name}" no es un tipo de imagen válido (jpg, png o webp).`;
      return;
    }
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      this.errorArchivo = `"${file.name}" supera el tamaño máximo de ${TAMANO_MAXIMO_MB}MB.`;
      return;
    }

    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.archivoSeleccionado = file;
    this.previewUrl = URL.createObjectURL(file);
  }

  quitarArchivoSeleccionado(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
    this.archivoSeleccionado = null;
    this.errorArchivo = '';
  }

  guardarLogo(): void {
    if (!this.companyId || !this.archivoSeleccionado) {
      this.errorArchivo = 'Debes seleccionar una imagen o tomar una foto.';
      return;
    }

    this.validationErrors = [];
    this.loadingSave = true;
    this.managementService.subirLogoEmpresa(this.companyId, this.archivoSeleccionado).subscribe({
      next: () => {
        this.loadingSave = false;
        this.quitarArchivoSeleccionado();
        this.cargarLogo();
        this.notificationService.showSuccess('Logo actualizado correctamente.');
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar el logo.'));
        }
      }
    });
  }

}
