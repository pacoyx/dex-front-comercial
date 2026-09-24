import { Pipe, PipeTransform } from '@angular/core';
import { AttendanceIncidentType } from '../interfaces/IShared';

export const ATTENDANCE_INCIDENT_TYPE_META: Record<number, { label: string; color: string }> = {
  [AttendanceIncidentType.Absence]: { label: 'Falta', color: '#c62828' },
  [AttendanceIncidentType.LateArrival]: { label: 'Tardanza', color: '#ef6c00' },
  [AttendanceIncidentType.Permission]: { label: 'Permiso', color: '#1565c0' },
  [AttendanceIncidentType.MedicalLeave]: { label: 'Descanso Médico', color: '#6a1b9a' },
  [AttendanceIncidentType.Vacation]: { label: 'Vacaciones', color: '#2e7d32' },
};

export function getAttendanceIncidentTypeMeta(value: number): { label: string; color: string } {
  return ATTENDANCE_INCIDENT_TYPE_META[value] ?? { label: 'Desconocido', color: '#757575' };
}

export const ATTENDANCE_INCIDENT_TYPE_OPTIONS = [
  { value: AttendanceIncidentType.Absence, label: 'Falta' },
  { value: AttendanceIncidentType.LateArrival, label: 'Tardanza' },
  { value: AttendanceIncidentType.Permission, label: 'Permiso' },
  { value: AttendanceIncidentType.MedicalLeave, label: 'Descanso Médico' },
  { value: AttendanceIncidentType.Vacation, label: 'Vacaciones' },
];

@Pipe({
  name: 'incidentTypeLabel',
  standalone: true,
})
export class IncidentTypeLabelPipe implements PipeTransform {
  transform(value: number): string {
    return getAttendanceIncidentTypeMeta(value).label;
  }
}

@Pipe({
  name: 'incidentTypeColor',
  standalone: true,
})
export class IncidentTypeColorPipe implements PipeTransform {
  transform(value: number): string {
    return getAttendanceIncidentTypeMeta(value).color;
  }
}
