import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { MaestrosService } from '../../../../../services/maestros.service';
import { EmisionService } from '../../../../../services/emision.service';
import { NotificationServiceService } from '../../../../../services/notification-service.service';
import {
  EstadoProdService, FlagSN, ICrearProdServicesRequest, IResponseProdServices
} from '../../../../../interfaces/IProdServices';
import { IListaCategorias } from '../../../../../interfaces/IListaCategorias';
import { IResponseGeneric } from '../../../../../interfaces/IResponseGeneric';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 250;
/** Al menos un caracter que no sea espacio. */
const NO_SOLO_ESPACIOS = /\S/;
/** Número no negativo con máximo 2 decimales. */
const PRECIO_DOS_DECIMALES = /^\d+(\.\d{1,2})?$/;

@Component({
  selector: 'app-dialog-form-reg-prod-service',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatDialogActions, MatDialogTitle, MatDialogContent,
    LoadingComponent, MatIconModule, MatButtonModule,
  ],
  templateUrl: './dialog-form-reg-prod-service.component.html',
  styleUrl: './dialog-form-reg-prod-service.component.css'
})
export class DialogFormRegProdServiceComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean, objServicio: IResponseProdServices | null, idServicio: number }>(MAT_DIALOG_DATA);
  private maestrosService = inject(MaestrosService);
  private emisionService = inject(EmisionService);
  private notificationService = inject(NotificationServiceService);
  private dialogRef = inject<MatDialogRef<DialogFormRegProdServiceComponent>>(MatDialogRef);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  readonly nameMaxLength = NAME_MAX_LENGTH;
  readonly descriptionMaxLength = DESCRIPTION_MAX_LENGTH;

  readonly servicioForm = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(NO_SOLO_ESPACIOS), Validators.maxLength(NAME_MAX_LENGTH)]),
    description: this.fb.nonNullable.control('', [Validators.maxLength(DESCRIPTION_MAX_LENGTH)]),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0), Validators.pattern(PRECIO_DOS_DECIMALES)]),
    status: this.fb.nonNullable.control<EstadoProdService>('A', Validators.required),
    catServiceId: this.fb.control<number | null>(null, Validators.required),
    isPeso: this.fb.nonNullable.control<FlagSN>('N', Validators.required),
    isLavado: this.fb.nonNullable.control<FlagSN>('N', Validators.required),
  });

  loadingSave = false;
  readonly titulo = this.data.esNuevo ? 'Registrar Servicio' : 'Actualizar Servicio';
  readonly tituloIcono = this.data.esNuevo ? 'add_circle' : 'edit';

  categorias: IListaCategorias[] = [];

  /**
   * Indica si el usuario editó la descripción a mano (distinta del nombre).
   * Mientras sea false, lo que se escribe en Nombre se replica en Descripción.
   */
  private descripcionManual = false;

  ngOnInit(): void {
    this.cargarCategorias();

    if (!this.data.esNuevo && this.data.objServicio) {
      const s = this.data.objServicio;
      this.servicioForm.patchValue({
        name: s.name ?? '',
        description: s.description ?? '',
        price: s.price ?? null,
        status: s.status === 'I' ? 'I' : 'A',
        catServiceId: s.catServiceId ?? null,
        isPeso: this.normalizarFlag(s.isPeso),
        isLavado: this.normalizarFlag(s.isLavado),
      });
    }

    const { name, description } = this.servicioForm.controls;
    this.descripcionManual = !this.debeSincronizar(name.value, description.value);
    this.configurarSincronizacionDescripcion();
  }

  private normalizarFlag(valor: string | null | undefined): FlagSN {
    return valor?.trim().toUpperCase() === 'S' ? 'S' : 'N';
  }

  /** La descripción se sincroniza con el nombre si está vacía o es igual al nombre. */
  private debeSincronizar(nombre: string, descripcion: string): boolean {
    const desc = (descripcion ?? '').trim();
    return desc === '' || desc === (nombre ?? '').trim();
  }

  private configurarSincronizacionDescripcion(): void {
    const { name, description } = this.servicioForm.controls;

    name.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((nombre) => {
        if (!this.descripcionManual) {
          // emitEvent: false para no disparar la detección de edición manual.
          description.setValue(nombre ?? '', { emitEvent: false });
        }
      });

    description.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((desc) => {
        this.descripcionManual = !this.debeSincronizar(name.value, desc);
      });
  }

  cargarCategorias(): void {
    this.emisionService.listarCategoriasSevicios()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resp) => {
          this.categorias = resp ?? [];
        },
        error: (err) => {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el listado de categorías.'));
        }
      });
  }

  private construirPayload(): ICrearProdServicesRequest {
    const v = this.servicioForm.getRawValue();
    const name = (v.name ?? '').trim();
    const description = (v.description ?? '').trim();

    return {
      name,
      // El backend no acepta description nula: si está vacía, se usa el nombre.
      description: (description || name).substring(0, DESCRIPTION_MAX_LENGTH),
      price: Number(v.price ?? 0),
      status: v.status === 'I' ? 'I' : 'A',
      catServiceId: Number(v.catServiceId),
      isPeso: this.normalizarFlag(v.isPeso),
      isLavado: this.normalizarFlag(v.isLavado),
    };
  }

  onSubmit(): void {
    if (this.loadingSave) {
      return;
    }

    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const payload = this.construirPayload();
    this.loadingSave = true;
    // Mientras graba no se permite cerrar con Esc ni clic fuera.
    this.dialogRef.disableClose = true;

    const request$ = this.data.esNuevo
      ? this.maestrosService.registrarProdService(payload)
      : this.maestrosService.actualizarProdService(
          { ...payload, id: this.data.idServicio },
          this.data.idServicio
        );

    // Sin takeUntilDestroyed: la petición no debe abortarse.
    request$
      .subscribe({
        next: (resp: IResponseGeneric<string>) => {
          this.loadingSave = false;
          this.dialogRef.disableClose = false;
          if (resp?.success) {
            this.notificationService.showSuccess(
              this.data.esNuevo ? 'Servicio registrado correctamente.' : 'Servicio actualizado correctamente.'
            );
            this.dialogRef.close(resp);
          } else {
            this.notificationService.showError(resp?.message?.trim() || 'No se pudo grabar el servicio.');
          }
        },
        error: (err) => {
          this.loadingSave = false;
          this.dialogRef.disableClose = false;
          this.notificationService.showError(this.mensajeErrorGrabar(err));
        }
      });
  }

  /** Prioriza err.error.message; en un 400 usa los errores de validación; si no, mensaje genérico. */
  private mensajeErrorGrabar(err: unknown): string {
    const backendMessage = (err as { error?: { message?: unknown } })?.error?.message;
    if (typeof backendMessage === 'string' && backendMessage.trim() !== '') {
      return backendMessage.trim();
    }
    const validaciones = extractValidationErrors(err);
    if (validaciones.length > 0) {
      return validaciones.join(' ');
    }
    return 'No se pudo grabar el servicio.';
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
