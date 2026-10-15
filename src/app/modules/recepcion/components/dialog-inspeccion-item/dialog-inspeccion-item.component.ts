import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { InspeccionService } from '../../services/inspeccion.service';
import { CreateItemInspectionRequest } from '../../interfaces/IInspeccion';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

@Component({
  selector: 'app-dialog-inspeccion-item',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogTitle, MatDialogContent, MatDialogActions,
    MatDialogClose, MatButtonModule, MatIcon, MatCheckboxModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './dialog-inspeccion-item.component.html',
  styleUrl: './dialog-inspeccion-item.component.css'
})
export class DialogInspeccionItemComponent implements OnInit {

  readonly dialogRef = inject(MatDialogRef<DialogInspeccionItemComponent>);
  readonly data = inject<{ workGuideDetailId: number | null, productName: string, initialValue?: CreateItemInspectionRequest }>(MAT_DIALOG_DATA);
  private inspeccionService = inject(InspeccionService);

  cargando = false;
  guardando = false;
  validationErrors: string[] = [];
  errorMessage = '';

  /** true cuando aún no existe el WorkGuideDetail (guía en construcción, sin grabar todavía) */
  esBorrador = false;

  form: CreateItemInspectionRequest = {
    hasStains: false,
    hasTears: false,
    hasFading: false,
    hasMissingParts: false,
    notes: ''
  };

  ngOnInit(): void {
    this.esBorrador = this.data.workGuideDetailId == null;

    if (this.esBorrador) {
      if (this.data.initialValue) {
        this.form = { ...this.data.initialValue };
      }
      return;
    }

    this.cargando = true;
    this.inspeccionService.obtenerInspeccion(this.data.workGuideDetailId!).subscribe({
      next: (resp) => {
        this.cargando = false;
        const inspection = resp.data;
        this.form = {
          hasStains: inspection.hasStains,
          hasTears: inspection.hasTears,
          hasFading: inspection.hasFading,
          hasMissingParts: inspection.hasMissingParts,
          notes: inspection.notes ?? ''
        };
      },
      error: (err) => {
        this.cargando = false;
        if (err?.status !== 404) {
          this.errorMessage = extractErrorMessage(err, 'No se pudo cargar la inspección del ítem.');
        }
      }
    });
  }

  guardar(): void {
    this.validationErrors = [];
    this.errorMessage = '';

    if (this.esBorrador) {
      this.dialogRef.close({ draft: { ...this.form } });
      return;
    }

    this.guardando = true;
    this.inspeccionService.guardarInspeccion(this.data.workGuideDetailId!, this.form).subscribe({
      next: () => {
        this.guardando = false;
        this.dialogRef.close({ saved: true });
      },
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.errorMessage = extractErrorMessage(err, 'Ocurrió un error al guardar la inspección.');
        }
      }
    });
  }
}
