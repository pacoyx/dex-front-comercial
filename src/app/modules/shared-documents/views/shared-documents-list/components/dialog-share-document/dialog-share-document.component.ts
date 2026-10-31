import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ManagentSystemService } from '../../../../../management/services/managent-system.service';
import { IGetUserResponse } from '../../../../../management/interfaces/IUsers';
import { SharedDocumentsService } from '../../../../services/shared-documents.service';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-share-document',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatAutocompleteModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  templateUrl: './dialog-share-document.component.html',
  styleUrl: './dialog-share-document.component.css',
})
export class DialogShareDocumentComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DialogShareDocumentComponent>);

  private managentSystemService = inject(ManagentSystemService);
  private sharedDocumentsService = inject(SharedDocumentsService);
  private notificationService = inject(NotificationsSystemService);

  usuarios: IGetUserResponse[] = [];
  categoriasSugeridas = ['Seguro', 'SCTR', 'Factura', 'Otro'];

  archivoSeleccionado: File | null = null;
  nombreArchivo = '';
  errorArchivo = '';

  guardando = false;
  validationErrors: string[] = [];

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    category: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    notes: new FormControl('', [Validators.maxLength(500)]),
    recipientUserIds: new FormControl<number[]>([], [Validators.required]),
  });

  ngOnInit(): void {
    this.managentSystemService.listarUsuarios().subscribe({
      next: (resp) => (this.usuarios = resp.data ?? []),
      error: () => (this.usuarios = []),
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.errorArchivo = '';

    if (file.type !== 'application/pdf') {
      this.errorArchivo = 'Solo se permiten archivos PDF.';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.errorArchivo = 'El archivo supera el tamaño máximo permitido de 10 MB.';
      return;
    }

    this.archivoSeleccionado = file;
    this.nombreArchivo = file.name;
  }

  get puedeGuardar(): boolean {
    return this.form.valid && !!this.archivoSeleccionado && !this.guardando;
  }

  guardar(): void {
    if (!this.puedeGuardar || !this.archivoSeleccionado) {
      this.form.markAllAsTouched();
      return;
    }

    this.validationErrors = [];
    this.guardando = true;
    const valor = this.form.getRawValue();

    this.sharedDocumentsService.compartir({
      title: valor.title!,
      category: valor.category!,
      notes: valor.notes || undefined,
      file: this.archivoSeleccionado,
      recipientUserIds: valor.recipientUserIds!,
    }).subscribe({
      next: (resp) => {
        this.guardando = false;
        this.notificationService.showSuccess('Documento compartido correctamente.');
        this.dialogRef.close(resp.data);
      },
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo compartir el documento.'));
        }
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
