import { Component, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PurchaseSettingServiceService } from '../../../../services/purchase-setting-service.service';
import { ISupplierCreateRequest } from '../../../../interfaces/IMaestros';
import { extractErrorMessage, extractValidationErrors } from '../../../../shared/http-error.util';

interface ColumnaProveedor {
  header: string;
  field: keyof ISupplierCreateRequest;
  requerido: boolean;
}

const COLUMNAS_PROVEEDOR: ColumnaProveedor[] = [
  { header: 'Razon Social', field: 'name', requerido: true },
  { header: 'RUC', field: 'ruc', requerido: true },
  { header: 'Direccion', field: 'address', requerido: false },
  { header: 'Telefono', field: 'phone', requerido: false },
  { header: 'Correo', field: 'email', requerido: false },
  { header: 'Estado (A o I)', field: 'status', requerido: false },
  { header: 'Nombre Contacto', field: 'contactName', requerido: false },
  { header: 'Telefono Contacto', field: 'contactPhone', requerido: false },
];

const FILA_EJEMPLO = [
  'Textiles Industriales SAC', '20123456789', 'Av. Industrial 123, Lima',
  '987654321', 'contacto@proveedor.com', 'A', 'Juan Perez', '999888777'
];

type EstadoFila = 'pendiente' | 'procesando' | 'exito' | 'error';
type OrigenError = 'cliente' | 'servidor' | null;

interface FilaImportacion {
  numero: number;
  datos: ISupplierCreateRequest;
  estado: EstadoFila;
  mensaje: string;
  origenError: OrigenError;
}

@Component({
  selector: 'app-supplier-import',
  standalone: true,
  imports: [
    MatIconModule, MatButtonModule, MatCardModule, MatTableModule, MatTooltipModule
  ],
  templateUrl: './supplier-import.component.html',
  styleUrl: './supplier-import.component.css'
})
export class SupplierImportComponent {

  private purchaseSettingService = inject(PurchaseSettingServiceService);

  readonly displayedColumns = ['numero', 'name', 'ruc', 'address', 'phone', 'email', 'status', 'estado', 'mensaje'];

  filas: FilaImportacion[] = [];
  nombreArchivo = '';
  errorMessage = '';
  procesando = false;
  huboIntentoPrevio = false;

  descargarPlantilla(): void {
    const encabezados = COLUMNAS_PROVEEDOR.map(c => c.header + (c.requerido ? ' *' : ''));
    const hoja = XLSX.utils.aoa_to_sheet([encabezados, FILA_EJEMPLO]);
    hoja['!cols'] = encabezados.map(() => ({ wch: 24 }));

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Proveedores');
    XLSX.writeFile(libro, 'plantilla-proveedores.xlsx');
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.errorMessage = '';
    this.nombreArchivo = file.name;
    this.filas = [];
    this.huboIntentoPrevio = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const filasCrudas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: '' }) as unknown[][];

        this.filas = this.mapearFilas(filasCrudas);
        if (this.filas.length === 0) {
          this.errorMessage = 'El archivo no tiene filas de datos (solo encabezado) o esta vacio.';
        }
      } catch {
        this.errorMessage = 'No se pudo leer el archivo. Verifica que sea un Excel valido (.xlsx).';
      }
    };
    reader.readAsArrayBuffer(file);

    input.value = '';
  }

  procesarTodo(): void {
    if (this.procesando) {
      return;
    }
    const pendientes = this.filasPendientesDeEnviar();
    if (pendientes.length === 0) {
      return;
    }

    this.procesando = true;
    this.huboIntentoPrevio = true;
    this.procesarSecuencial(pendientes, 0);
  }

  hayPendientes(): boolean {
    return this.filasPendientesDeEnviar().length > 0;
  }

  contarPorEstado(estado: EstadoFila): number {
    return this.filas.filter(f => f.estado === estado).length;
  }

  private filasPendientesDeEnviar(): FilaImportacion[] {
    return this.filas.filter(f => f.estado === 'pendiente' || (f.estado === 'error' && f.origenError === 'servidor'));
  }

  private procesarSecuencial(filas: FilaImportacion[], index: number): void {
    if (index >= filas.length) {
      this.procesando = false;
      return;
    }

    const fila = filas[index];
    fila.estado = 'procesando';

    const payload: ISupplierCreateRequest = {
      ...fila.datos,
      status: (fila.datos.status || 'A').toUpperCase(),
    };

    this.purchaseSettingService.crearProveedor(payload).subscribe({
      next: () => {
        fila.estado = 'exito';
        fila.mensaje = '';
        fila.origenError = null;
        this.procesarSecuencial(filas, index + 1);
      },
      error: (err) => {
        fila.estado = 'error';
        fila.origenError = 'servidor';
        const validacion = extractValidationErrors(err);
        fila.mensaje = validacion.length > 0
          ? validacion.join('; ')
          : extractErrorMessage(err, 'No se pudo registrar el proveedor.');
        this.procesarSecuencial(filas, index + 1);
      }
    });
  }

  private mapearFilas(filasCrudas: unknown[][]): FilaImportacion[] {
    const dataRows = filasCrudas.slice(1);
    const resultado: FilaImportacion[] = [];
    let numero = 0;

    for (const fila of dataRows) {
      const vacia = !fila || fila.every(celda => celda === '' || celda === undefined || celda === null);
      if (vacia) {
        continue;
      }

      numero++;
      const datos: ISupplierCreateRequest = {
        name: this.celda(fila, 0),
        ruc: this.celda(fila, 1),
        address: this.celda(fila, 2),
        phone: this.celda(fila, 3),
        email: this.celda(fila, 4),
        status: this.celda(fila, 5),
        contactName: this.celda(fila, 6),
        contactPhone: this.celda(fila, 7),
      };

      const errorValidacion = this.validarFila(datos);
      resultado.push({
        numero,
        datos,
        estado: errorValidacion ? 'error' : 'pendiente',
        mensaje: errorValidacion ?? '',
        origenError: errorValidacion ? 'cliente' : null,
      });
    }

    return resultado;
  }

  private celda(fila: unknown[], index: number): string {
    const valor = fila[index];
    return valor === undefined || valor === null ? '' : String(valor).trim();
  }

  private validarFila(datos: ISupplierCreateRequest): string | null {
    const faltantes: string[] = [];
    if (!datos.name) faltantes.push('Razón Social');
    if (!datos.ruc) faltantes.push('RUC');

    if (faltantes.length > 0) {
      return `Falta: ${faltantes.join(', ')}`;
    }

    if (datos.status && !['A', 'I'].includes(datos.status.toUpperCase())) {
      return `Estado invalido "${datos.status}" (debe ser A o I)`;
    }

    return null;
  }
}
