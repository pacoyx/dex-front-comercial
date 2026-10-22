export enum RecipientType {
  To = 0,
  Bcc = 1,
}

export enum ScheduledEmailRecipientMode {
  Fixed = 0,
  Dynamic = 1,
}

export enum ScheduledEmailExecutionStatus {
  Success = 0,
  Failed = 1,
}

export interface IDayOfWeekOption {
  value: number;
  label: string;
  short: string;
}

// Numeracion ISO-like que usa el backend para daysOfWeek (NO es el DayOfWeek de .NET).
export const DAYS_OF_WEEK_OPTIONS: IDayOfWeekOption[] = [
  { value: 1, label: 'Lunes', short: 'L' },
  { value: 2, label: 'Martes', short: 'M' },
  { value: 3, label: 'Miércoles', short: 'X' },
  { value: 4, label: 'Jueves', short: 'J' },
  { value: 5, label: 'Viernes', short: 'V' },
  { value: 6, label: 'Sábado', short: 'S' },
  { value: 7, label: 'Domingo', short: 'D' },
];

export interface IScheduledEmailNotificationSummary {
  id: number;
  code: string;
  name: string;
  recipientMode: ScheduledEmailRecipientMode;
  hour: number;
  minute: number;
  daysOfWeek: number[];
  cronExpression: string;
  isEnabled: boolean;
  recipientsCount: number;
  lastExecutionAt: string | null;
  nextExecutionAt: string | null;
  executionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IScheduledEmailRecipient {
  id: number;
  email: string;
  recipientType: RecipientType;
  createdAt: string;
}

export interface IScheduledEmailNotification extends IScheduledEmailNotificationSummary {
  subjectTemplate: string;
  bodyTemplate: string;
  driverName: string | null;
  driverDocument: string | null;
  signatureName: string | null;
  signaturePosition: string | null;
  signaturePhone: string | null;
  createdBy: string;
  updatedBy: string;
  recipients: IScheduledEmailRecipient[];
}

export interface ICreateScheduledEmailNotificationRequest {
  code: string;
  name: string;
  recipientMode: ScheduledEmailRecipientMode;
  hour: number;
  minute: number;
  daysOfWeek: number[];
  subjectTemplate: string;
  bodyTemplate: string;
  driverName?: string | null;
  driverDocument?: string | null;
  signatureName?: string | null;
  signaturePosition?: string | null;
  signaturePhone?: string | null;
}

// recipientMode y code no son editables luego de creados.
export type IUpdateScheduledEmailNotificationRequest = Omit<ICreateScheduledEmailNotificationRequest, 'code' | 'recipientMode'>;

export interface IAddScheduledEmailRecipientRequest {
  email: string;
  recipientType: RecipientType;
}

export interface IScheduledEmailExecution {
  id: number;
  executedAt: string;
  status: ScheduledEmailExecutionStatus;
  errorMessage: string | null;
  recipients: string;
  createdAt: string;
}

export interface IScheduledEmailPreview {
  subject: string;
  body: string;
}

export const RECIPIENT_MODE_OPTIONS: { value: ScheduledEmailRecipientMode; label: string; hint: string }[] = [
  { value: ScheduledEmailRecipientMode.Fixed, label: 'Fijo', hint: 'Lista fija de destinatarios TO/BCC (ej. aviso de chofer)' },
  { value: ScheduledEmailRecipientMode.Dynamic, label: 'Dinámico', hint: 'Los destinatarios se resuelven solos por cliente (ej. recordatorio de facturas vencidas)' },
];
