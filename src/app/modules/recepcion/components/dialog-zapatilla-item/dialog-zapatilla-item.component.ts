import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { InspeccionService } from '../../services/inspeccion.service';
import { SneakerBrandResponse, UpsertSneakerDetailRequest } from '../../interfaces/IInspeccion';
import { extractErrorMessage, extractValidationErrors } from '../../shared/http-error.util';

interface ColorBasico {
  nombre: string;
  valor: string;
}

@Component({
  selector: 'app-dialog-zapatilla-item',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatDialogTitle, MatDialogContent, MatDialogActions,
    MatDialogClose, MatButtonModule, MatIcon, MatFormFieldModule,
    MatInputModule, MatTooltipModule
  ],
  templateUrl: './dialog-zapatilla-item.component.html',
  styleUrl: './dialog-zapatilla-item.component.css'
})
export class DialogZapatillaItemComponent implements OnInit {

  readonly colores: ColorBasico[] = [
    { nombre: 'Blanco', valor: '#FFFFFF' },
    { nombre: 'Negro', valor: '#000000' },
    { nombre: 'Azul', valor: '#0000FF' },
    { nombre: 'Celeste', valor: '#87CEEB' },
    { nombre: 'Amarillo', valor: '#FFFF00' },
    { nombre: 'Rosado', valor: '#FFC0CB' },
    { nombre: 'Morado', valor: '#800080' },
    { nombre: 'Beig', valor: '#F5F5DC' },
    { nombre: 'Marron', valor: '#A52A2A' },
    { nombre: 'Acero', valor: '#B0C4DE' },
    { nombre: 'Rojo', valor: '#FF0000' },
    { nombre: 'Verde', valor: 'green' }
  ];

  readonly dialogRef = inject(MatDialogRef<DialogZapatillaItemComponent>);
  readonly data = inject<{ workGuideDetailId: number | null, productName: string, initialValue?: UpsertSneakerDetailRequest }>(MAT_DIALOG_DATA);
  private inspeccionService = inject(InspeccionService);

  cargando = false;
  guardando = false;
  validationErrors: string[] = [];
  errorMessage = '';
  successMessage = '';

  /** true cuando aún no existe el WorkGuideDetail (guía en construcción, sin grabar todavía) */
  esBorrador = false;

  marcas: SneakerBrandResponse[] = [];

  form: UpsertSneakerDetailRequest = {
    brandId: null,
    primaryColor: '',
    secondaryColor: '',
    hasLaces: false,
    hasInsoles: false,
    observations: ''
  };

  ngOnInit(): void {
    this.esBorrador = this.data.workGuideDetailId == null;
    this.cargando = true;
    this.inspeccionService.listarMarcasZapatilla().subscribe({
      next: (resp) => {
        this.marcas = resp.data;

        if (this.esBorrador) {
          this.cargando = false;
          if (this.data.initialValue) {
            this.form = { ...this.data.initialValue };
          }
          return;
        }

        this.cargarInfoZapatilla();
      },
      error: (err) => {
        this.cargando = false;
        this.errorMessage = extractErrorMessage(err, 'No se pudo cargar el catálogo de marcas.');
      }
    });
  }

  private cargarInfoZapatilla(): void {
    this.inspeccionService.obtenerInfoZapatilla(this.data.workGuideDetailId!).subscribe({
      next: (resp) => {
        this.cargando = false;
        const sneaker = resp.data;
        this.form = {
          brandId: sneaker.brandId,
          primaryColor: sneaker.primaryColor ?? '',
          secondaryColor: sneaker.secondaryColor ?? '',
          hasLaces: sneaker.hasLaces,
          hasInsoles: sneaker.hasInsoles,
          observations: sneaker.observations ?? ''
        };
      },
      error: (err) => {
        this.cargando = false;
        if (err?.status !== 404) {
          this.errorMessage = extractErrorMessage(err, 'No se pudo cargar la información de zapatilla.');
        }
      }
    });
  }

  guardar(): void {
    this.validationErrors = [];
    this.errorMessage = '';
    this.successMessage = '';

    if (this.esBorrador) {
      const marca = this.marcas.find((m) => m.id === this.form.brandId);
      this.dialogRef.close({ draft: { ...this.form }, brandName: marca?.name ?? null });
      return;
    }

    this.guardando = true;
    this.inspeccionService.guardarInfoZapatilla(this.data.workGuideDetailId!, this.form).subscribe({
      next: () => {
        this.guardando = false;
        this.successMessage = 'Información de zapatilla guardada.';
      },
      error: (err) => {
        this.guardando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.errorMessage = extractErrorMessage(err, 'Ocurrió un error al guardar la información de zapatilla.');
        }
      }
    });
  }

  seleccionarMarca(brandId: number): void {
    this.form.brandId = this.form.brandId === brandId ? null : brandId;
  }

  seleccionarColorPrimario(nombre: string): void {
    this.form.primaryColor = this.form.primaryColor === nombre ? '' : nombre;
  }

  seleccionarColorSecundario(nombre: string): void {
    this.form.secondaryColor = this.form.secondaryColor === nombre ? '' : nombre;
  }

  toggleCordones(): void {
    this.form.hasLaces = !this.form.hasLaces;
  }

  toggleplantillas(): void {
    this.form.hasInsoles = !this.form.hasInsoles;
  }
}
