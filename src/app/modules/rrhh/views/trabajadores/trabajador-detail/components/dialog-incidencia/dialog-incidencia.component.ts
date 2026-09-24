import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable } from 'rxjs';
import { CustomDateAdapter } from '../../../../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../../../../core/configGlobal/custom-date-formats';
import { LoadingComponent } from '../../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../../core/services/notifications-system.service';
import { AttendanceService } from '../../../../../services/attendance.service';
import { AttendanceIncidentType } from '../../../../../interfaces/IShared';
import { IAttendanceIncident } from '../../../../../interfaces/IAttendance';
import { ATTENDANCE_INCIDENT_TYPE_OPTIONS } from '../../../../../shared/attendance-incident-type';
import { extractErrorMessage, extractValidationErrors } from '../../../../../shared/http-error.util';
import { IResponseGeneric } from '../../../../../interfaces/IShared';

function toDateOnly(value: Date | null): string {
  if (!value) return '';
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

@Component({
  selector: 'app-dialog-incidencia',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDialogActions, MatDialogTitle,
    MatDialogContent, LoadingComponent, MatIconModule, MatButtonModule, MatSelectModule, MatDatepickerModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './dialog-incidencia.component.html',
  styleUrl: './dialog-incidencia.component.css'
})
export class DialogIncidenciaComponent {

  readonly data = inject<{ employeeId: number }>(MAT_DIALOG_DATA);
  private attendanceService = inject(AttendanceService);
  private notificationService = inject(NotificationsSystemService);

  loadingSave = false;
  validationErrors: string[] = [];
  tipoOptions = ATTENDANCE_INCIDENT_TYPE_OPTIONS.filter(o =>
    o.value === AttendanceIncidentType.Absence ||
    o.value === AttendanceIncidentType.LateArrival ||
    o.value === AttendanceIncidentType.Permission
  );

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DialogIncidenciaComponent>,
  ) {
    this.form = this.fb.group({
      type: [AttendanceIncidentType.Absence, Validators.required],
      date: [new Date(), Validators.required],
      hours: [8, [Validators.required, Validators.min(0.5)]],
      observation: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.validationErrors = [];
    this.loadingSave = true;
    const value = this.form.value;
    const req = {
      date: toDateOnly(value.date),
      hours: value.hours,
      observation: value.observation || null,
    };

    let request$: Observable<IResponseGeneric<IAttendanceIncident>>;
    switch (value.type) {
      case AttendanceIncidentType.LateArrival:
        request$ = this.attendanceService.registrarTardanza(this.data.employeeId, req);
        break;
      case AttendanceIncidentType.Permission:
        request$ = this.attendanceService.registrarPermiso(this.data.employeeId, req);
        break;
      default:
        request$ = this.attendanceService.registrarFalta(this.data.employeeId, req);
        break;
    }

    request$.subscribe({
      next: () => {
        this.loadingSave = false;
        this.notificationService.showSuccess('Incidencia registrada correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loadingSave = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo registrar la incidencia.'));
        }
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

}
