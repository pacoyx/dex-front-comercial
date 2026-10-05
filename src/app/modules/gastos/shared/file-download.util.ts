import { HttpResponse } from '@angular/common/http';

function obtenerNombreArchivo(response: HttpResponse<Blob>, fallbackFileName: string): string {
  const disposition = response.headers.get('content-disposition');
  if (!disposition) {
    return fallbackFileName;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  const plainMatch = /filename="?([^";]+)"?/i.exec(disposition);
  const rawName = utf8Match?.[1] ?? plainMatch?.[1];
  return rawName ? decodeURIComponent(rawName) : fallbackFileName;
}

export function descargarArchivo(response: HttpResponse<Blob>, fallbackFileName: string): void {
  const blob = response.body;
  if (!blob) {
    return;
  }

  const fileName = obtenerNombreArchivo(response, fallbackFileName);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
