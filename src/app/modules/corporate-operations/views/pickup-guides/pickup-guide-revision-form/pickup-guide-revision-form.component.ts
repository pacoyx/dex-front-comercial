import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, debounceTime, map, of, switchMap } from 'rxjs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../../../rrhh/services/employees.service';
import { IEmployeeListItem } from '../../../../rrhh/interfaces/IEmployees';
import { PickupGuidesService } from '../../../services/pickup-guides.service';
import { CustomerActivePriceListService } from '../../../services/customer-active-price-list.service';
import { ICreatePickupGuideRevisionDetailRequest, ICreatePickupGuideRevisionRequest, IPickupGuide } from '../../../interfaces/IPickupGuide';
import { ICustomerPriceListDetail } from '../../../interfaces/ICustomerPriceList';
import { PickupGuideStatus, PickupGuideStatusLabelPipe } from '../../../shared/pickup-guide-status';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO_MB = 15;

type RowOrigin = 'existing' | 'added';

interface FotoEvidencia {
  file: File;
  previewUrl: string;
}

function reasonRequiredValidator(group: AbstractControl): ValidationErrors | null {
  const origin = group.get('origin')?.value as RowOrigin;
  const removed = !!group.get('removed')?.value;
  const original = Number(group.get('originalQuantity')?.value);
  const nueva = Number(group.get('newQuantity')?.value);
  const motivo = (group.get('reason')?.value ?? '').toString().trim();

  const requiereMotivo = origin === 'added' || removed || nueva !== original;
  return requiereMotivo && !motivo ? { reasonRequired: true } : null;
}

@Component({
  selector: 'app-pickup-guide-revision-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatAutocompleteModule, MatTooltipModule, LoadingComponent,
    CurrencyPipe, DatePipe, DecimalPipe, PickupGuideStatusLabelPipe,
  ],
  templateUrl: './pickup-guide-revision-form.component.html',
  styleUrl: './pickup-guide-revision-form.component.css'
})
export class PickupGuideRevisionFormComponent implements OnInit, OnDestroy {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private pickupGuidesService = inject(PickupGuidesService);
  private employeesService = inject(EmployeesService);
  private priceListService = inject(CustomerActivePriceListService);
  private notificationService = inject(NotificationsSystemService);

  readonly PickupGuideStatus = PickupGuideStatus;

  guideId = 0;
  guide: IPickupGuide | null = null;
  loading = true;
  guardando = false;
  progresoTexto = '';
  errorMessage = '';
  validationErrors: string[] = [];

  priceListDetails: ICustomerPriceListDetail[] = [];

  employeeControl = this.fb.control<IEmployeeListItem | string | null>(null, [this.employeeRequiredValidator]);
  filteredEmployees!: Observable<IEmployeeListItem[]>;

  form = this.fb.group({
    observation: this.fb.control<string>('', Validators.maxLength(500)),
    details: this.fb.array<AbstractControl>([]),
  });

  fotos: FotoEvidencia[] = [];
  fotoErrorMessage = '';

  get detailsArray(): FormArray {
    return this.form.get('details') as FormArray;
  }

  private employeeRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    return value && typeof value === 'object' && 'id' in value ? null : { required: true };
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!id) {
        return;
      }
      this.guideId = id;
      this.cargarGuia();
    });

    this.filteredEmployees = this.employeeControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return of([]);
        }
        if (typeof value === 'object') {
          return of([value]);
        }
        return this.employeesService.listarTrabajadores({ search: value, pageSize: 10, onlyActive: true }).pipe(
          map(resp => resp.data.employees)
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.fotos.forEach(f => URL.revokeObjectURL(f.previewUrl));
  }

  private cargarGuia(): void {
    this.loading = true;
    this.pickupGuidesService.obtenerPorId(this.guideId).subscribe({
      next: (resp) => {
        this.guide = resp.data;
        this.loading = false;

        if (this.guide.status !== PickupGuideStatus.Draft) {
          this.errorMessage = `Solo se pueden registrar revisiones sobre guías en estado "Borrador". Esta guía está en estado "${this.guide.status}".`;
          return;
        }
        this.construirFilas();
        this.cargarListaPrecios();
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = extractErrorMessage(err, 'No se pudo obtener la guía de recojo.');
      },
    });
  }

  private cargarListaPrecios(): void {
    if (!this.guide) return;
    this.priceListService.obtenerActiva(this.guide.customerId).subscribe({
      next: (resp) => {
        this.priceListDetails = resp.data?.details ?? [];
      },
      error: () => {
        this.priceListDetails = [];
      },
    });
  }

  private construirFilaExistente(detail: { id: number; serviceItemName: string; quantity: number; weight?: number | null }): AbstractControl {
    const original = detail.weight ?? detail.quantity;
    return this.fb.group({
      origin: ['existing' as RowOrigin],
      pickupGuideDetailId: [detail.id],
      serviceItemId: [null as number | null],
      serviceItemName: [detail.serviceItemName],
      originalQuantity: [original],
      newQuantity: [original, [Validators.required, Validators.min(0)]],
      reason: [''],
      removed: [false],
    }, { validators: reasonRequiredValidator });
  }

  private construirFilas(): void {
    this.detailsArray.clear();
    (this.guide?.details ?? []).forEach(detail => {
      this.detailsArray.push(this.construirFilaExistente(detail));
    });
  }

  agregarItemNuevo(): void {
    const fila = this.fb.group({
      origin: ['added' as RowOrigin],
      pickupGuideDetailId: [null as number | null],
      serviceItemId: [null as number | null, Validators.required],
      serviceItemName: [''],
      originalQuantity: [0],
      newQuantity: [1, [Validators.required, Validators.min(0.01)]],
      reason: ['', Validators.required],
      removed: [false],
    }, { validators: reasonRequiredValidator });
    this.detailsArray.push(fila);
  }

  onServicioSeleccionado(index: number, serviceItemId: number): void {
    const group = this.detailsArray.at(index);
    const servicio = this.priceListDetails.find(d => d.serviceItemId === serviceItemId);
    group.patchValue({
      serviceItemId,
      serviceItemName: servicio?.serviceItemName ?? '',
    });
  }

  toggleRemover(index: number): void {
    const group = this.detailsArray.at(index);
    const removido = !group.value.removed;
    group.patchValue({
      removed: removido,
      newQuantity: removido ? 0 : group.value.originalQuantity,
    });
    group.updateValueAndValidity();
  }

  quitarFilaAgregada(index: number): void {
    this.detailsArray.removeAt(index);
  }

  filaInvalida(index: number): boolean {
    const group = this.detailsArray.at(index);
    return group.touched && group.hasError('reasonRequired');
  }

  displayEmployeeFn(employee: IEmployeeListItem | string): string {
    return typeof employee === 'string' ? employee : (employee ? `${employee.firstName} ${employee.lastName} (${employee.code})` : '');
  }

  abrirCamara(input: HTMLInputElement): void {
    input.click();
  }

  onArchivosSeleccionados(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = input.files;
    if (!archivos || archivos.length === 0) {
      return;
    }

    this.fotoErrorMessage = '';
    Array.from(archivos).forEach((file) => {
      if (!TIPOS_PERMITIDOS.includes(file.type)) {
        this.fotoErrorMessage = `"${file.name}" no es una imagen válida (jpg, png o webp).`;
        return;
      }
      if (file.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
        this.fotoErrorMessage = `"${file.name}" supera el tamaño máximo de ${TAMANO_MAXIMO_MB}MB.`;
        return;
      }
      this.fotos.push({ file, previewUrl: URL.createObjectURL(file) });
    });

    input.value = '';
  }

  quitarFoto(foto: FotoEvidencia): void {
    URL.revokeObjectURL(foto.previewUrl);
    this.fotos = this.fotos.filter(f => f !== foto);
  }

  formatearTamano(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  guardar(): void {
    this.errorMessage = '';
    this.validationErrors = [];

    this.employeeControl.markAsTouched();
    this.detailsArray.markAllAsTouched();

    if (this.employeeControl.invalid) {
      this.errorMessage = 'Debes seleccionar el empleado que realiza la revisión.';
      return;
    }
    if (this.form.get('observation')?.invalid) {
      this.errorMessage = 'La observación no puede superar los 500 caracteres.';
      return;
    }
    if (this.detailsArray.invalid) {
      this.errorMessage = 'Hay líneas incompletas (falta el servicio, la cantidad o el motivo). Complétalas antes de guardar.';
      return;
    }

    const lineas: ICreatePickupGuideRevisionDetailRequest[] = [];
    this.detailsArray.controls.forEach(group => {
      const v = group.value;
      const reason = (v.reason ?? '').toString().trim();

      if (v.origin === 'added') {
        lineas.push({ actionType: 'AddedItem', serviceItemId: v.serviceItemId, newQuantity: Number(v.newQuantity), reason });
        return;
      }
      if (v.removed) {
        lineas.push({ actionType: 'RemovedItem', pickupGuideDetailId: v.pickupGuideDetailId, reason });
        return;
      }
      if (Number(v.newQuantity) !== Number(v.originalQuantity)) {
        lineas.push({ actionType: 'QuantityAdjustment', pickupGuideDetailId: v.pickupGuideDetailId, newQuantity: Number(v.newQuantity), reason });
      }
    });

    if (lineas.length === 0) {
      this.errorMessage = 'Debes corregir, agregar o quitar al menos un ítem para registrar la revisión.';
      return;
    }

    const empleado = this.employeeControl.value as IEmployeeListItem;
    const payload: ICreatePickupGuideRevisionRequest = {
      employeeId: empleado.id,
      observation: this.form.value.observation || null,
      details: lineas,
    };

    this.guardando = true;
    this.progresoTexto = 'Guardando revisión...';

    this.pickupGuidesService.crearRevision(this.guideId, payload).subscribe({
      next: (resp) => this.subirFotos(resp.data.id),
      error: (err) => {
        this.guardando = false;
        this.progresoTexto = '';
        const validacion = extractValidationErrors(err);
        if (validacion.length > 0) {
          this.validationErrors = validacion;
        } else {
          this.errorMessage = extractErrorMessage(err, 'No se pudo registrar la revisión.');
        }
      },
    });
  }

  private subirFotos(revisionId: number): void {
    if (this.fotos.length === 0) {
      this.finalizar(0);
      return;
    }
    this.subirFotoSecuencial(revisionId, 0, 0);
  }

  private subirFotoSecuencial(revisionId: number, index: number, fallidas: number): void {
    if (index >= this.fotos.length) {
      this.finalizar(fallidas);
      return;
    }

    this.progresoTexto = `Subiendo foto ${index + 1} de ${this.fotos.length}...`;
    this.pickupGuidesService.agregarFotoRevision(revisionId, this.fotos[index].file).subscribe({
      next: () => this.subirFotoSecuencial(revisionId, index + 1, fallidas),
      error: () => this.subirFotoSecuencial(revisionId, index + 1, fallidas + 1),
    });
  }

  private finalizar(fotosFallidas: number): void {
    this.guardando = false;
    this.progresoTexto = '';

    if (fotosFallidas > 0) {
      this.notificationService.showError(`Revisión registrada, pero ${fotosFallidas} foto(s) no se pudieron subir.`);
    } else {
      this.notificationService.showSuccess('Revisión registrada correctamente.');
    }
    this.router.navigate(['/corporate-operations/pickup-guides', this.guideId]);
  }

  cancelar(): void {
    this.router.navigate(['/corporate-operations/pickup-guides', this.guideId]);
  }

}
