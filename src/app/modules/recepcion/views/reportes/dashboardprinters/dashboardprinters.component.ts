import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { ReportesEmisionService } from '../../../services/reportes-emision.service';
import { MaestrosService } from '../../../services/maestros.service';
import { IPrintingStatusPrinter, IPrintingStatusResponse } from '../../../interfaces/IReports';

interface IPrintersPorSucursal {
  branchName: string;
  printers: IPrintingStatusPrinter[];
}

@Component({
  selector: 'app-dashboardprinters',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, LoadingComponent, DatePipe],
  templateUrl: './dashboardprinters.component.html',
  styleUrl: './dashboardprinters.component.css'
})
export class DashboardprintersComponent implements OnInit {
  reportsService = inject(ReportesEmisionService);
  maestroSerivce = inject(MaestrosService);

  loading = false;
  status: IPrintingStatusResponse | null = null;
  sucursales: IPrintersPorSucursal[] = [];
  nombresImpresoras = new Map<number, string>();

  ngOnInit(): void {
    this.cargarImpresoras();
    this.cargarEstadoImpresion();
  }

  cargarImpresoras(): void {
    this.maestroSerivce.obtenerImpresoras().subscribe({
      next: (response) => {
        this.nombresImpresoras = new Map(response.data.map(p => [p.id, p.windowsPrinterName]));
      },
      error: (error) => {
        console.error('Error al cargar las impresoras', error);
      }
    });
  }

  obtenerNombreImpresora(printer: IPrintingStatusPrinter): string {
    return this.nombresImpresoras.get(printer.printerId) || printer.printerName || `Impresora #${printer.printerId}`;
  }

  cargarEstadoImpresion(): void {
    this.loading = true;
    this.reportsService.obtenerPrintingStatus().subscribe({
      next: (response) => {
        this.status = response;
        this.sucursales = this.agruparPorSucursal(response.printers);
      },
      error: (error) => {
        console.error('Error al cargar el estado de impresión', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private agruparPorSucursal(printers: IPrintingStatusPrinter[]): IPrintersPorSucursal[] {
    const grupos = new Map<string, IPrintingStatusPrinter[]>();
    for (const printer of printers) {
      const lista = grupos.get(printer.branchName) ?? [];
      lista.push(printer);
      grupos.set(printer.branchName, lista);
    }
    return Array.from(grupos, ([branchName, printers]) => ({ branchName, printers }));
  }
}
