import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { ProfileUserService } from '../../services/profile-user.service';
import { IMyDocument, IMyProfile } from '../../interfaces/IProfileUser';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';
import { DialogAgregarDocumentoComponent } from './components/dialog-agregar-documento/dialog-agregar-documento.component';

const TIPOS_PERMITIDOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_FOTO_MB = 5;

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatTableModule, DatePipe, LoadingComponent,
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent implements OnInit, OnDestroy {

  private profileUserService = inject(ProfileUserService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  @ViewChild('inputCamaraFoto') inputCamaraFoto!: ElementRef<HTMLInputElement>;
  @ViewChild('inputArchivoFoto') inputArchivoFoto!: ElementRef<HTMLInputElement>;

  loading = true;
  perfil: IMyProfile | null = null;

  frmDatos: FormGroup;
  savingDatos = false;

  fotoUrl: string | null = null;
  loadingFoto = false;
  editandoFoto = false;
  archivoFotoSeleccionado: File | null = null;
  previewFotoUrl: string | null = null;
  errorArchivoFoto = '';
  savingFoto = false;
  removingFoto = false;

  frmPassword: FormGroup;
  savingPassword = false;
  passwordValidationErrors: string[] = [];
  hideCurrent = signal(true);
  hideNew = signal(true);
  hideConfirm = signal(true);

  documentos: IMyDocument[] = [];
  loadingDocumentos = false;
  documentosDescargando = new Set<number>();
  documentColumns: string[] = ['documentName', 'fileName', 'createdAt', 'acciones'];
  documentsDataSource = new MatTableDataSource<IMyDocument>([]);

  constructor(private fb: FormBuilder) {
    this.frmDatos = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.maxLength(20)],
    });

    this.frmPassword = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarFoto();
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    if (this.fotoUrl) URL.revokeObjectURL(this.fotoUrl);
    if (this.previewFotoUrl) URL.revokeObjectURL(this.previewFotoUrl);
  }

  private cargarPerfil(): void {
    this.loading = true;
    this.profileUserService.obtenerMiPerfil().subscribe({
      next: (response) => {
        this.perfil = response.data;
        this.frmDatos.patchValue({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
        });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar tu perfil.'));
      }
    });
  }

  private cargarFoto(): void {
    this.loadingFoto = true;
    this.profileUserService.obtenerFoto().subscribe({
      next: (blob) => {
        if (this.fotoUrl) URL.revokeObjectURL(this.fotoUrl);
        this.fotoUrl = URL.createObjectURL(blob);
        this.loadingFoto = false;
      },
      error: () => {
        // 404: el usuario no tiene foto cargada todavia.
        if (this.fotoUrl) URL.revokeObjectURL(this.fotoUrl);
        this.fotoUrl = null;
        this.loadingFoto = false;
      }
    });
  }

  guardarDatos(): void {
    if (this.frmDatos.invalid) {
      this.notificationService.showError('Verifica los datos ingresados.');
      return;
    }

    this.savingDatos = true;
    this.profileUserService.actualizarMiPerfil(this.frmDatos.value).subscribe({
      next: (response) => {
        this.savingDatos = false;
        this.perfil = response.data;
        this.notificationService.showSuccess('Datos actualizados correctamente.');
      },
      error: (err) => {
        this.savingDatos = false;
        const validation = extractValidationErrors(err);
        const mensaje = validation.length > 0 ? validation.join(' ') : extractErrorMessage(err, 'No se pudieron guardar los datos.');
        this.notificationService.showError(mensaje);
      }
    });
  }

  abrirCambiarFoto(): void {
    this.errorArchivoFoto = '';
    this.editandoFoto = true;
  }

  cancelarCambiarFoto(): void {
    this.quitarArchivoFotoSeleccionado();
    this.editandoFoto = false;
  }

  abrirCamaraFoto(): void {
    this.inputCamaraFoto.nativeElement.click();
  }

  abrirExploradorFoto(): void {
    this.inputArchivoFoto.nativeElement.click();
  }

  onArchivoFotoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.errorArchivoFoto = '';

    if (!TIPOS_PERMITIDOS_FOTO.includes(file.type)) {
      this.errorArchivoFoto = `"${file.name}" no es un tipo de imagen válido (jpg, png o webp).`;
      return;
    }
    if (file.size > TAMANO_MAXIMO_FOTO_MB * 1024 * 1024) {
      this.errorArchivoFoto = `"${file.name}" supera el tamaño máximo de ${TAMANO_MAXIMO_FOTO_MB}MB.`;
      return;
    }

    if (this.previewFotoUrl) URL.revokeObjectURL(this.previewFotoUrl);
    this.archivoFotoSeleccionado = file;
    this.previewFotoUrl = URL.createObjectURL(file);
  }

  quitarArchivoFotoSeleccionado(): void {
    if (this.previewFotoUrl) URL.revokeObjectURL(this.previewFotoUrl);
    this.previewFotoUrl = null;
    this.archivoFotoSeleccionado = null;
    this.errorArchivoFoto = '';
  }

  guardarFoto(): void {
    if (!this.archivoFotoSeleccionado) {
      this.errorArchivoFoto = 'Debes seleccionar una imagen o tomar una foto.';
      return;
    }

    this.savingFoto = true;
    this.profileUserService.actualizarFoto({ file: this.archivoFotoSeleccionado }).subscribe({
      next: () => {
        this.savingFoto = false;
        this.editandoFoto = false;
        this.quitarArchivoFotoSeleccionado();
        this.cargarFoto();
        this.notificationService.showSuccess('Foto actualizada correctamente.');
      },
      error: (err) => {
        this.savingFoto = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar la foto.'));
      }
    });
  }

  quitarFoto(): void {
    if (!confirm('¿Quitar tu foto de perfil?')) {
      return;
    }

    this.removingFoto = true;
    this.profileUserService.eliminarFoto().subscribe({
      next: () => {
        this.removingFoto = false;
        if (this.fotoUrl) URL.revokeObjectURL(this.fotoUrl);
        this.fotoUrl = null;
        this.notificationService.showSuccess('Foto eliminada correctamente.');
      },
      error: (err) => {
        this.removingFoto = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo quitar la foto.'));
      }
    });
  }

  toggleHideCurrent(event: MouseEvent): void {
    event.stopPropagation();
    this.hideCurrent.set(!this.hideCurrent());
  }

  toggleHideNew(event: MouseEvent): void {
    event.stopPropagation();
    this.hideNew.set(!this.hideNew());
  }

  toggleHideConfirm(event: MouseEvent): void {
    event.stopPropagation();
    this.hideConfirm.set(!this.hideConfirm());
  }

  cambiarPassword(): void {
    this.passwordValidationErrors = [];

    if (this.frmPassword.invalid) {
      this.passwordValidationErrors = ['La nueva contraseña debe tener al menos 6 caracteres.'];
      return;
    }

    const { currentPassword, newPassword, confirmNewPassword } = this.frmPassword.value;

    if (newPassword !== confirmNewPassword) {
      this.passwordValidationErrors = ['La confirmación no coincide con la nueva contraseña.'];
      return;
    }

    if (newPassword === currentPassword) {
      this.passwordValidationErrors = ['La nueva contraseña debe ser distinta a la actual.'];
      return;
    }

    this.savingPassword = true;
    this.profileUserService.cambiarPassword({ currentPassword, newPassword, confirmNewPassword }).subscribe({
      next: () => {
        this.savingPassword = false;
        this.notificationService.showSuccessDialog(
          'Tu contraseña se actualizó correctamente. Por seguridad, vuelve a iniciar sesión.',
        );
        localStorage.setItem('dex24Auth', '');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.savingPassword = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.passwordValidationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo cambiar la contraseña.'));
        }
      }
    });
  }

  private cargarDocumentos(): void {
    this.loadingDocumentos = true;
    this.profileUserService.listarMisDocumentos().subscribe({
      next: (response) => {
        this.documentos = response.data;
        this.documentsDataSource.data = response.data;
        this.loadingDocumentos = false;
      },
      error: (err) => {
        this.loadingDocumentos = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar tus documentos.'));
      }
    });
  }

  agregarDocumento(): void {
    const dialogRef = this.dialog.open(DialogAgregarDocumentoComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarDocumentos();
      }
    });
  }

  iconoDocumento(documento: IMyDocument): string {
    return documento.contentType === 'application/pdf' ? 'picture_as_pdf' : 'image';
  }

  verDocumento(documento: IMyDocument): void {
    if (this.documentosDescargando.has(documento.id)) return;
    this.documentosDescargando.add(documento.id);
    this.profileUserService.descargarDocumento(documento.id).subscribe({
      next: (blob) => {
        this.documentosDescargando.delete(documento.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documento.fileName;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (err) => {
        this.documentosDescargando.delete(documento.id);
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo descargar el documento.'));
      }
    });
  }

  eliminarDocumento(documento: IMyDocument): void {
    if (!confirm(`¿Eliminar el documento "${documento.documentName}"?`)) {
      return;
    }

    this.profileUserService.eliminarDocumento(documento.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Documento eliminado correctamente.');
        this.cargarDocumentos();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el documento.'));
      }
    });
  }

}
