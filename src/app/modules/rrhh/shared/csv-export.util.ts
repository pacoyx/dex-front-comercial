export function exportToCsv(fileName: string, columns: { key: string; header: string }[], rows: Record<string, unknown>[]): void {
  const escape = (value: unknown): string => {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };

  const headerLine = columns.map(c => escape(c.header)).join(',');
  const dataLines = rows.map(row => columns.map(c => escape(row[c.key])).join(','));
  const csvContent = [headerLine, ...dataLines].join('\r\n');

  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
