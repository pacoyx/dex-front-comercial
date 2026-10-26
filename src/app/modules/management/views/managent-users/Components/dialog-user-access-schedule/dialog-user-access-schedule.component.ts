import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoadingComponent } from '../../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../../core/services/notifications-system.service';
import { RolesService } from '../../../../services/roles.service';
import { DayOfWeekName, IUpdateAccessScheduleWindowRequest } from '../../../../interfaces/IAccessSchedule';

interface IScheduleRangeForm {
  startTime: string;
  endTime: string;
}

interface IDaySchedule {
  key: DayOfWeekName;
  label: string;
  ranges: IScheduleRangeForm[];
}

const DAYS: { key: DayOfWeekName; label: string }[] = [
  { key: 'Monday', label: 'Lunes' },
  { key: 'Tuesday', label: 'Martes' },
  { key: 'Wednesday', label: 'Miércoles' },
  { key: 'Thursday', label: 'Jueves' },
  { key: 'Friday', label: 'Viernes' },
  { key: 'Saturday', label: 'Sábado' },
  { key: 'Sunday', label: 'Domingo' },
];

/** El backend devuelve "HH:mm:ss"; el input type="time" necesita "HH:mm". */
function toInputTime(time: string): string {
  return time.slice(0, 5);
}

/** El body de error de este endpoint es un string plano, no el wrapper ApiResponse. */
function extractErrorMessage(err: any, fallback: string): string {
  if (typeof err?.error === 'string' && err.error) {
    return err.error;
  }
  if (err?.error?.message) {
    return err.error.message;
  }
  return fallback;
}

@Component({
  selector: 'app-dialog-user-access-schedule',
  standalone: true,
  imports: [
    FormsModule, MatDialogActions, MatDialogTitle, MatDialogContent,
    LoadingComponent, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './dialog-user-access-schedule.component.html',
  styleUrl: './dialog-user-access-schedule.component.css'
})
export class DialogUserAccessScheduleComponent implements OnInit {

  readonly data = inject<{ userId: number; userName: string }>(MAT_DIALOG_DATA);
  private rolesService = inject(RolesService);
  private notificationService = inject(NotificationsSystemService);
  private dialogRef = inject(MatDialogRef<DialogUserAccessScheduleComponent>);

  days: IDaySchedule[] = DAYS.map(d => ({ ...d, ranges: [] }));
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.cargarHorario();
  }

  get sinRestriccion(): boolean {
    return this.days.every(d => d.ranges.length === 0);
  }

  private cargarHorario(): void {
    this.loading = true;
    this.rolesService.obtenerHorarioAcceso(this.data.userId).subscribe({
      next: (resp) => {
        const windows = resp.data.windows;
        this.days = DAYS.map(d => ({
          ...d,
          ranges: windows
            .filter(w => w.dayOfWeek === d.key)
            .map(w => ({ startTime: toInputTime(w.startTime), endTime: toInputTime(w.endTime) })),
        }));
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar el horario de acceso.'));
      },
    });
  }

  agregarRango(day: IDaySchedule): void {
    day.ranges.push({ startTime: '08:00', endTime: '18:00' });
  }

  quitarRango(day: IDaySchedule, index: number): void {
    day.ranges.splice(index, 1);
  }

  guardar(): void {
    for (const day of this.days) {
      for (const range of day.ranges) {
        if (!range.startTime || !range.endTime) {
          this.notificationService.showError(`Completa ambas horas del rango en ${day.label}.`);
          return;
        }
        if (range.startTime >= range.endTime) {
          this.notificationService.showError(`La hora de inicio debe ser menor a la hora de fin en ${day.label}.`);
          return;
        }
      }
    }

    const windows: IUpdateAccessScheduleWindowRequest[] = this.days.flatMap(day =>
      day.ranges.map(range => ({ dayOfWeek: day.key, startTime: range.startTime, endTime: range.endTime }))
    );

    this.saving = true;
    this.rolesService.actualizarHorarioAcceso(this.data.userId, { windows }).subscribe({
      next: () => {
        this.saving = false;
        this.notificationService.showSuccess(
          windows.length === 0
            ? 'El usuario quedó sin restricción de horario (acceso libre).'
            : 'Horario de acceso actualizado.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo guardar el horario de acceso.'));
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close();
  }

}
