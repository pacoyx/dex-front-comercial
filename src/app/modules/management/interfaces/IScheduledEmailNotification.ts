export enum RecipientType {
  To = 0,
  Bcc = 1,
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
  driverName: string;
  driverDocument: string;
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
  hour: number;
  minute: number;
  daysOfWeek: number[];
  subjectTemplate: string;
  bodyTemplate: string;
  driverName: string;
  driverDocument: string;
  signatureName?: string | null;
  signaturePosition?: string | null;
  signaturePhone?: string | null;
}

export type IUpdateScheduledEmailNotificationRequest = Omit<ICreateScheduledEmailNotificationRequest, 'code'>;

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
