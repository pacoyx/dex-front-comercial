import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDateAdapter } from '../../../../core/configGlobal/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../../../core/configGlobal/custom-date-formats';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { GuiasRemisionService } from '../../services/guias-remision.service';
import { IGuiaRemision } from '../../interfaces/IGuiaRemision';
import { IInvoiceListItem } from '../../interfaces/IInvoices';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogBuscarFacturaComponent } from './dialog-buscar-factura/dialog-buscar-factura.component';
import { DialogGuiaRemisionComponent } from '../facturas/dialog-guia-remision/dialog-guia-remision.component';

@Component({
  selector: 'app-guias-remision',
  standalone: true,
  imports: [
    CommonModule, MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatTableModule, MatDatepickerModule, MatDialogModule, MatTooltipModule, ReactiveFormsModule, FormsModule,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './guias-remision.component.html',
  styleUrl: './guias-remision.component.css',
})
export class GuiasRemisionComponent implements OnInit {
  private guiasRemisionService = inject(GuiasRemisionService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  invoiceNumeroControl = new FormControl('');

  readonly rangeFrm = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  displayedColumns: string[] = ['factura', 'guia', 'cliente', 'fechaTraslado', 'chofer', 'placa', 'acciones'];
  dataSource = new MatTableDataSource<IGuiaRemision>([]);

  ngOnInit(): void {
    this.buscar();
  }

  buscar(): void {
    const start = this.rangeFrm.get('start')?.value;
    const end = this.rangeFrm.get('end')?.value;

    this.guiasRemisionService.listarGuiasRemision({
      invoiceNumero: this.invoiceNumeroControl.value || undefined,
      desde: start ? start.toISOString() : undefined,
      hasta: end ? end.toISOString() : undefined,
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar las guías de remisión.'));
      },
    });
  }

  limpiar(): void {
    this.invoiceNumeroControl.setValue('');
    this.rangeFrm.reset();
    this.buscar();
  }

  ver(guia: IGuiaRemision): void {
    this.dialog.open(DialogGuiaRemisionComponent, {
      data: {
        invoiceId: guia.invoiceId,
        invoiceSerie: guia.invoiceSerie,
        invoiceNumero: guia.invoiceNumero,
        guia,
      },
    });
  }

  crearGuiaRemision(): void {
    this.dialog.open(DialogBuscarFacturaComponent).afterClosed().subscribe((factura?: IInvoiceListItem) => {
      if (!factura) return;

      this.guiasRemisionService.obtenerGuiaRemisionPorFactura(factura.id).subscribe({
        next: (response) => this.abrirDialogGuiaRemision(factura, response.data),
        error: (err) => {
          if (err.status === 404) {
            this.abrirDialogGuiaRemision(factura);
            return;
          }
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo verificar la guía de remisión.'));
        },
      });
    });
  }

  private abrirDialogGuiaRemision(factura: IInvoiceListItem, guia?: IGuiaRemision): void {
    this.dialog.open(DialogGuiaRemisionComponent, {
      data: { invoiceId: factura.id, invoiceSerie: factura.serie, invoiceNumero: factura.numero, guia },
    }).afterClosed().subscribe(() => this.buscar());
  }
}
