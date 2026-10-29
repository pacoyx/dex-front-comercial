import { Component, OnInit, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationServiceService } from '../../../../../services/notification-service.service';
import { WebOrdersService } from '../../../../../services/web-orders.service';
import { MaestrosService } from '../../../../../services/maestros.service';
import { IResponseProdServices } from '../../../../../interfaces/IProdServices';
import { IZonePriceListAdmin } from '../../../../../interfaces/IZonePriceList';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';

@Component({
  selector: 'app-dialog-form-tarifa-zona',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatCheckboxModule, MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './dialog-form-tarifa-zona.component.html',
  styleUrl: './dialog-form-tarifa-zona.component.css'
})
export class DialogFormTarifaZonaComponent implements OnInit {

  readonly data = inject<{ esNuevo: boolean; zoneId: number; zoneName: string; tarifaId: number | null }>(MAT_DIALOG_DATA);
  private webOrdersService = inject(WebOrdersService);
  private maestrosService = inject(MaestrosService);
  private notificationService = inject(NotificationServiceService);

  form: FormGroup;
  loadingSave = false;
  loadingDatos = false;
  validationErrors: string[] = [];
  titulo = this.data.esNuevo ? `Nueva Tarifa — ${this.data.zoneName}` : `Editar Tarifa — ${this.data.zoneName}`;

  get detallesArray(): FormArray {
    return this.form.get('details') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogFormTarifaZonaComponent>,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      effectiveFrom: [new Date(), Validators.required],
      effectiveTo: [null],
      activate: [true],
      details: this.fb.array<AbstractControl>([]),
    });
  }

  ngOnInit(): void {
    this.loadingDatos = true;

    const servicios$ = this.maestrosService.obtenerProdServices(1, 500);
    const tarifa$ = this.data.esNuevo || !this.data.tarifaId
      ? of(null)
      : this.webOrdersService.obtenerTarifaPorZona(this.data.tarifaId).pipe(map(resp => resp.data));

    forkJoin({
      servicios: servicios$,
      tarifa: tarifa$,
    }).subscribe({
      next: ({ servicios, tarifa }) => {
        this.construirFilas(servicios.data.servicios.filter(s => s.status === 'A'), tarifa);
        if (tarifa) {
          const t = tarifa;
          this.form.patchValue({
            name: t.name,
            effectiveFrom: new Date(t.effectiveFrom),
            effectiveTo: t.effectiveTo ? new Date(t.effectiveTo) : null,
          });
        }
        this.loadingDatos = false;
      },
      error: (err) => {
        this.loadingDatos = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el catálogo de servicios.'));
      }
    });
  }

  private construirFilas(servicios: IResponseProdServices[], tarifa: IZonePriceListAdmin | null): void {
    this.detallesArray.clear();
    servicios.forEach(servicio => {
      const existente = tarifa?.details.find(d => d.serviceItemId === servicio.id);
      this.detallesArray.push(this.fb.group({
        serviceItemId: [servicio.id],
        serviceItemName: [servicio.name],
        unitPrice: [existente?.unitPrice ?? 0, [Validators.min(0)]],
      }));
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;

    const details = (value.details as Array<{ serviceItemId: number; unitPrice: number }>)
      .filter(d => d.unitPrice > 0)
      .map(d => ({ serviceItemId: d.serviceItemId, unitPrice: d.unitPrice }));

    if (details.length === 0) {
      this.loadingSave = false;
      this.validationErrors = ['Debes asignar un precio mayor a 0 a por lo menos un servicio.'];
      return;
    }

    const effectiveFrom: Date = value.effectiveFrom;
    const effectiveTo: Date | null = value.effectiveTo;

    const request$ = this.data.esNuevo
      ? this.webOrdersService.crearTarifaPorZona(this.data.zoneId, {
          name: value.name,
          effectiveFrom: effectiveFrom.toISOString(),
          effectiveTo: effectiveTo ? effectiveTo.toISOString() : null,
          activate: value.activate,
          details,
        })
      : this.webOrdersService.actualizarTarifaPorZona(this.data.tarifaId!, {
          name: value.name,
          effectiveFrom: effectiveFrom.toISOString(),
          effectiveTo: effectiveTo ? effectiveTo.toISOString() : null,
          details,
        });

    request$.subscribe({
      next: (resp) => {
        this.loadingSave = false;
        this.notificationService.showSuccess(this.data.esNuevo ? 'Tarifa creada correctamente.' : 'Tarifa actualizada correctamente.');
        this.dialogRef.close(resp.data);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar la tarifa.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

}
