import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingComponent } from '../../../../../core/components/loading/loading.component';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { InvoicesService } from '../../../services/invoices.service';
import { IBranchSales, IPaymentMethod, IProdServiceSearchResult } from '../../../interfaces/ICatalogos';
import {
  IConfirmImportInvoiceXmlRequest,
  IImportInvoiceXmlLineDraft,
  IImportInvoiceXmlPreview,
} from '../../../interfaces/IImportInvoiceXml';
import { extractErrorMessage, extractValidationErrors } from '../../../shared/http-error.util';
import { DialogSelectProductComponent } from './components/dialog-select-product/dialog-select-product.component';

@Component({
  selector: 'app-importar-factura-xml',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatTableModule, MatTooltipModule, RouterModule, FormsModule,
    LoadingComponent, CurrencyPipe, DatePipe, DecimalPipe,
  ],
  templateUrl: './importar-factura-xml.component.html',
  styleUrl: './importar-factura-xml.component.css'
})
export class ImportarFacturaXmlComponent implements OnInit {

  private catalogosService = inject(CatalogosService);
  private invoicesService = inject(InvoicesService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  // Paso 1: seleccion de archivo
  nombreArchivo = '';
  cargandoPreview = false;
  errorArchivo = '';

  // Paso 2: vista previa y mapeo de productos
  preview: IImportInvoiceXmlPreview | null = null;
  lineas: IImportInvoiceXmlLineDraft[] = [];
  lineColumns: string[] = ['lineNumber', 'description', 'quantity', 'unitPrice', 'total', 'producto'];

  branches: IBranchSales[] = [];
  paymentMethods: IPaymentMethod[] = [];
  branchId: number | null = null;
  paymentMethod: string | null = null;
  exchangeRate = 1.0;
  notes = '';

  confirmando = false;
  validationErrors: string[] = [];

  ngOnInit(): void {
    this.catalogosService.obtenerSucursales().subscribe({
      next: (resp) => this.branches = resp.data,
      error: () => this.notificationService.showError('No se pudieron cargar las sucursales.'),
    });

    this.catalogosService.obtenerMetodosPago().subscribe({
      next: (resp) => this.paymentMethods = resp.data.filter(m => m.isActive),
      error: () => this.notificationService.showError('No se pudieron cargar los métodos de pago.'),
    });
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.errorArchivo = '';
    this.nombreArchivo = file.name;
    this.cargandoPreview = true;

    this.invoicesService.importarFacturaXmlPreview(file).subscribe({
      next: (resp) => {
        this.cargandoPreview = false;
        this.preview = resp.data;
        this.lineas = resp.data.details.map(d => ({ ...d, productId: null, productName: null }));
      },
      error: (err) => {
        this.cargandoPreview = false;
        this.preview = null;
        const validation = extractValidationErrors(err);
        this.errorArchivo = validation.length > 0
          ? validation.join(' ')
          : extractErrorMessage(err, 'No se pudo leer el archivo XML.');
      },
    });
  }

  asignarProducto(linea: IImportInvoiceXmlLineDraft): void {
    this.dialog.open(DialogSelectProductComponent, {
      data: { lineDescription: linea.description },
      width: '460px',
    }).afterClosed().subscribe((producto: IProdServiceSearchResult | undefined) => {
      if (!producto) return;
      linea.productId = producto.id;
      linea.productName = producto.name;
    });
  }

  get todasLasLineasCompletas(): boolean {
    return this.lineas.length > 0 && this.lineas.every(l => !!l.productId && l.productId > 0);
  }

  get puedeConfirmar(): boolean {
    return !!this.preview && !!this.branchId && !!this.paymentMethod
      && this.exchangeRate > 0 && this.todasLasLineasCompletas && !this.confirmando;
  }

  cancelarImportacion(): void {
    this.preview = null;
    this.lineas = [];
    this.nombreArchivo = '';
    this.errorArchivo = '';
    this.branchId = null;
    this.paymentMethod = null;
    this.exchangeRate = 1.0;
    this.notes = '';
    this.validationErrors = [];
  }

  confirmarImportacion(): void {
    if (!this.preview || !this.puedeConfirmar) return;

    this.validationErrors = [];
    this.confirmando = true;

    const req: IConfirmImportInvoiceXmlRequest = {
      customerId: this.preview.customerId,
      branchId: this.branchId!,
      documentTypeId: this.preview.documentTypeId,
      serie: this.preview.serie,
      numero: this.preview.numero,
      currencyId: this.preview.currencyId,
      exchangeRate: this.exchangeRate,
      issueDate: this.preview.issueDate,
      dueDate: this.preview.dueDate,
      paymentMethod: this.paymentMethod!,
      typePayment: this.preview.typePayment,
      daysCredit: this.preview.daysCredit,
      subTotal: this.preview.subTotal,
      igv: this.preview.igv,
      total: this.preview.total,
      hasDetraction: this.preview.hasDetraction,
      detractionPercent: this.preview.detractionPercent,
      detractionAmount: this.preview.detractionAmount,
      notes: this.notes.trim() || null,
      details: this.lineas.map(l => ({
        productId: l.productId!,
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        total: l.total,
      })),
    };

    this.invoicesService.importarFacturaXml(req).subscribe({
      next: (resp) => {
        this.confirmando = false;
        this.notificationService.showSuccessDialog(
          `Factura ${resp.data.serie}-${resp.data.numero} importada correctamente. Total: ${resp.data.total}`,
          '# ' + resp.data.id,
        );
        this.router.navigate(['/facturacion/facturas', resp.data.id]);
      },
      error: (err) => {
        this.confirmando = false;
        const validation = extractValidationErrors(err);
        if (validation.length > 0) {
          this.validationErrors = validation;
        } else {
          this.notificationService.showError(extractErrorMessage(err, 'No se pudo importar la factura.'));
        }
      },
    });
  }

}
