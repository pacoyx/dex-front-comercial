import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { BankCatalogsService } from '../../services/bank-catalogs.service';
import { IBankAccountType } from '../../interfaces/IBanks';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogFormTipoCuentaComponent } from './components/dialog-form-tipo-cuenta/dialog-form-tipo-cuenta.component';

@Component({
  selector: 'app-tipos-cuenta-bancaria',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatButtonModule,
    MatTableModule, MatTooltipModule, FormsModule,
  ],
  templateUrl: './tipos-cuenta-bancaria.component.html',
  styleUrl: './tipos-cuenta-bancaria.component.css'
})
export class TiposCuentaBancariaComponent implements OnInit {

  private bankCatalogsService = inject(BankCatalogsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  filtro = '';
  allData: IBankAccountType[] = [];
  displayedColumns: string[] = ['actions', 'name', 'status'];
  dataSource = new MatTableDataSource<IBankAccountType>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.bankCatalogsService.listarTiposCuenta().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los tipos de cuenta.'));
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item => item.name.toLowerCase().includes(texto));
  }

  nuevoTipo(): void {
    const dialogRef = this.dialog.open(DialogFormTipoCuentaComponent, {
      data: { esNuevo: true, obj: null }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  editarTipo(tipo: IBankAccountType): void {
    const dialogRef = this.dialog.open(DialogFormTipoCuentaComponent, {
      data: { esNuevo: false, obj: tipo }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  toggleEstado(tipo: IBankAccountType): void {
    const nuevoEstado = !tipo.isActive;
    if (!nuevoEstado && !confirm(`Se desactivará el tipo de cuenta "${tipo.name}". ¿Deseas continuar?`)) {
      return;
    }
    this.bankCatalogsService.actualizarTipoCuenta(tipo.id, { name: tipo.name, isActive: nuevoEstado }).subscribe({
      next: () => {
        this.notificationService.showSuccess(nuevoEstado ? 'Tipo de cuenta activado correctamente.' : 'Tipo de cuenta desactivado correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar el estado del tipo de cuenta.'));
      }
    });
  }

}
