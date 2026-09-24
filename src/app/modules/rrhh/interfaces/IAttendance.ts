export interface IAttendanceRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
}

export interface IAttendanceUpsertRequest {
  employeeId: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
}

export interface IAttendanceListFilters {
  employeeId?: number;
  startDate?: string;
  endDate?: string;
}

export interface IAttendanceIncident {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  type: number;
  hours: number;
  observation: string | null;
}

export interface IAttendanceIncidentCreateRequest {
  date: string;
  hours: number;
  observation: string | null;
}

export interface IAttendanceIncidentListFilters {
  employeeId?: number;
  type?: number;
  startDate?: string;
  endDate?: string;
}

export interface IExtraHour {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  hours: number;
  observation: string | null;
  approved: boolean;
}

export interface IExtraHourCreateRequest {
  date: string;
  hours: number;
  observation: string | null;
}

export interface IExtraHourListFilters {
  employeeId?: number;
  approved?: boolean;
  startDate?: string;
  endDate?: string;
}
