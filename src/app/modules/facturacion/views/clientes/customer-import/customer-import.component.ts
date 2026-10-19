import { Component, inject } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientesService } from '../../../services/clientes.service';
import { CustomerType, ICustomerCreateRequest, IBillingProfileRequest } from '../../../interfaces/ICustomer';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';

const ENCABEZADOS = [
  'Nombre', 'Apellido', 'Documento', 'Direccion', 'Telefono', 'Correo', 'Codigo Interno', 'Estado (A o I)',
  'RUC Facturacion', 'Razon Social', 'Nombre Comercial', 'Direccion Fiscal', 'Correo Facturacion',
  'Dias de Credito', 'Limite de Credito', 'Credito Habilitado (SI/NO)'
];

const COLUMNAS_REQUERIDAS = [0, 8, 9, 11]; // Nombre, RUC Facturacion, Razon Social, Direccion Fiscal

const FILA_EJEMPLO = [
  'Textiles del Sur', 'SAC', '10234567890', 'Av. Comercio 456, Arequipa', '987111222', 'ventas@textilsur.com', 'CLI-0100', 'A',
  '20123456789', 'Textiles del Sur SAC', 'Textilsur', 'Av. Comercio 456, Arequipa', 'facturacion@textilsur.com',
  '30', '5000', 'SI'
];

type EstadoFila = 'pendiente' | 'procesando' | 'exito' | 'error';
type OrigenError = 'cliente' | 'servidor' | null;

interface FilaImportacion {
  numero: number;
  datosCliente: ICustomerCreateRequest;
  datosPerfil: IBillingProfileRequest;
  estado: EstadoFila;
  mensaje: string;
  origenError: OrigenError;
  clienteId: number | null;
}

@Component({
  selector: 'app-customer-import',
  standalone: true,
  imports: [
    MatIconModule, MatButtonModule, MatCardModule, MatTableModule, MatTooltipModule
  ],
  templateUrl: './customer-import.component.html',
  styleUrl: './customer-import.component.css'
})
export class CustomerImportComponent {

  private clientesService = inject(ClientesService);

  readonly displayedColumns = ['numero', 'name', 'businessName', 'taxId', 'email', 'estado', 'mensaje'];

  filas: FilaImportacion[] = [];
  nombreArchivo = '';
  errorMessage = '';
  procesando = false;
  huboIntentoPrevio = false;

  descargarPlantilla(): void {
    const hoja = XLSX.utils.aoa_to_sheet([
      ENCABEZADOS.map((h, i) => h + (COLUMNAS_REQUERIDAS.includes(i) ? ' *' : '')),
      FILA_EJEMPLO
    ]);
    hoja['!cols'] = ENCABEZADOS.map(() => ({ wch: 22 }));

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Clientes Empresa');
    XLSX.writeFile(libro, 'plantilla-clientes-empresa.xlsx');
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
    this.procesarFila(filas[index], () => this.procesarSecuencial(filas, index + 1));
  }

  private procesarFila(fila: FilaImportacion, onDone: () => void): void {
    fila.estado = 'procesando';

    if (fila.clienteId == null) {
      const payload: ICustomerCreateRequest = {
        ...fila.datosCliente,
        status: (fila.datosCliente.status || 'A').toUpperCase(),
        customerType: CustomerType.Company,
      };

      this.clientesService.registrarClienteObtenerId(payload).subscribe({
        next: (resp) => {
          fila.clienteId = resp.id;
          this.crearPerfil(fila, onDone);
        },
        error: (err) => {
          fila.estado = 'error';
          fila.origenError = 'servidor';
          fila.mensaje = extractErrorMessage(err, 'No se pudo registrar el cliente.');
          onDone();
        }
      });
      return;
    }

    this.crearPerfil(fila, onDone);
  }

  private crearPerfil(fila: FilaImportacion, onDone: () => void): void {
    this.clientesService.crearPerfilFacturacion(fila.clienteId!, fila.datosPerfil).subscribe({
      next: () => {
        fila.estado = 'exito';
        fila.mensaje = '';
        fila.origenError = null;
        onDone();
      },
      error: (err) => {
        fila.estado = 'error';
        fila.origenError = 'servidor';
        const validacion = extractValidationErrors(err);
        const detalle = validacion.length > 0
          ? validacion.join('; ')
          : extractErrorMessage(err, 'No se pudo registrar el perfil de facturacion.');
        fila.mensaje = `Cliente creado (ID ${fila.clienteId}); fallo el perfil de facturacion: ${detalle}`;
        onDone();
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

      const datosCliente: ICustomerCreateRequest = {
        firstName: this.celda(fila, 0),
        lastName: this.celda(fila, 1),
        docPersonal: this.celda(fila, 2),
        address: this.celda(fila, 3),
        phone: this.celda(fila, 4),
        email: this.celda(fila, 5),
        internalCode: this.celda(fila, 6),
        status: this.celda(fila, 7),
      };

      const datosPerfil: IBillingProfileRequest = {
        taxId: this.celda(fila, 8),
        businessName: this.celda(fila, 9),
        commercialName: this.celda(fila, 10),
        fiscalAddress: this.celda(fila, 11),
        billingEmail: this.celda(fila, 12),
        paymentTermDays: this.celdaNumero(fila, 13),
        creditLimit: this.celdaNumero(fila, 14),
        isCreditEnabled: this.celdaBooleano(fila, 15),
      };

      const errorValidacion = this.validarFila(datosCliente, datosPerfil);
      resultado.push({
        numero,
        datosCliente,
        datosPerfil,
        estado: errorValidacion ? 'error' : 'pendiente',
        mensaje: errorValidacion ?? '',
        origenError: errorValidacion ? 'cliente' : null,
        clienteId: null,
      });
    }

    return resultado;
  }

  private celda(fila: unknown[], index: number): string {
    const valor = fila[index];
    return valor === undefined || valor === null ? '' : String(valor).trim();
  }

  private celdaNumero(fila: unknown[], index: number): number {
    const texto = this.celda(fila, index);
    const num = parseFloat(texto.replace(',', '.'));
    return Number.isFinite(num) ? num : 0;
  }

  private celdaBooleano(fila: unknown[], index: number): boolean {
    const texto = this.celda(fila, index).toUpperCase();
    return texto === 'SI' || texto === 'S' || texto === 'TRUE' || texto === '1';
  }

  private validarFila(datosCliente: ICustomerCreateRequest, datosPerfil: IBillingProfileRequest): string | null {
    const faltantes: string[] = [];
    if (!datosCliente.firstName) faltantes.push('Nombre');
    if (!datosPerfil.taxId) faltantes.push('RUC Facturacion');
    if (!datosPerfil.businessName) faltantes.push('Razon Social');
    if (!datosPerfil.fiscalAddress) faltantes.push('Direccion Fiscal');

    if (faltantes.length > 0) {
      return `Falta: ${faltantes.join(', ')}`;
    }

    if (!/^\d{11}$/.test(datosPerfil.taxId)) {
      return `RUC invalido "${datosPerfil.taxId}" (debe tener 11 digitos numericos)`;
    }

    if (datosCliente.status && !['A', 'I'].includes(datosCliente.status.toUpperCase())) {
      return `Estado invalido "${datosCliente.status}" (debe ser A o I)`;
    }

    return null;
  }
}
