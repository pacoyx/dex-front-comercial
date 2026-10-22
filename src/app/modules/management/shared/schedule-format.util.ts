import { DAYS_OF_WEEK_OPTIONS } from '../interfaces/IScheduledEmailNotification';

export function formatScheduleText(hour: number, minute: number, daysOfWeek: number[]): string {
  const hh = hour.toString().padStart(2, '0');
  const mm = minute.toString().padStart(2, '0');
  const dias = [...daysOfWeek]
    .sort((a, b) => a - b)
    .map(d => DAYS_OF_WEEK_OPTIONS.find(o => o.value === d)?.short ?? '?')
    .join(', ');
  return `${hh}:${mm} · ${dias}`;
}
