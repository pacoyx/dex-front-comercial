import { Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { ProfileUserService } from '../../../../services/profile-user.service';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const TAMANO_MAXIMO_MB = 10;

@Component({
  selector: 'app-dialog-agregar-documento',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-agregar-documento.component.html',
  styleUrl: './dialog-agregar-documento.component.css'
})
export class DialogAgregarDocumentoComponent implements OnDestroy {

  private profileUserService = inject(ProfileUserService);
  private notificationService = inject(NotificationsSystemService);

  @ViewChild('inputCamara') inputCamara!: ElementRef<HTMLInputElement>;
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  loadingSave = false;
  validationErrors: string[] = [];
  errorArchivo = '';

  archivoSeleccionado: File | null = null;
  previewUrl: string | null = null;

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogAgregarDocumentoComponent>,
  ) {
    this.form = this.fb.group({
      documentName: ['', [Validators.required, Validators.maxLength(100)]],
      notes: [''],
    });
  }

  get esImagen(): boolean {
    return !!this.archivoSeleccionado && this.archivoSeleccionado.type.startsWith('image/');
  }

  get tamanoArchivo(): string {
    if (!this.archivoSeleccionado) return '';
    const kb = this.archivoSeleccionado.size / 1024;
    return kb < 1024 ? `${kb.toFixed(0)} KB` : `${(kb / 1024).toFixed(1)} MB`;
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
      this.errorArchivo = `"${file.name}" no es un tipo de archivo válido (jpg, png, webp o pdf).`;
      return;
    }
    if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      this.errorArchivo = `"${file.name}" supera el tamaño máximo de ${TAMANO_MAXIMO_MB}MB.`;
      return;
    }

    this.setArchivo(file);
  }

  private setArchivo(file: File): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.archivoSeleccionado = file;
    this.previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
  }

  quitarArchivo(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    this.previewUrl = null;
    this.archivoSeleccionado = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    if (!this.archivoSeleccionado) {
      this.errorArchivo = 'Debes seleccionar un archivo o tomar una foto.';
      return;
    }

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    this.profileUserService.subirDocumento({
      documentName: value.documentName,
      notes: value.notes || null,
      file: this.archivoSeleccionado,
    }).subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Documento agregado correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo agregar el documento.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }

}
