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
import { IBank } from '../../interfaces/IBanks';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../shared/http-error.util';
import { DialogFormBancoComponent } from './components/dialog-form-banco/dialog-form-banco.component';

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [
    MatFormFieldModule, MatInputModule, MatIconModule, MatCardModule, MatButtonModule,
    MatTableModule, MatTooltipModule, FormsModule,
  ],
  templateUrl: './bancos.component.html',
  styleUrl: './bancos.component.css'
})
export class BancosComponent implements OnInit {

  private bankCatalogsService = inject(BankCatalogsService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  filtro = '';
  allData: IBank[] = [];
  displayedColumns: string[] = ['actions', 'name', 'shortName', 'status'];
  dataSource = new MatTableDataSource<IBank>([]);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.bankCatalogsService.listarBancos().subscribe({
      next: (response) => {
        this.allData = response.data;
        this.aplicarFiltro();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los bancos.'));
      }
    });
  }

  aplicarFiltro(): void {
    const texto = this.filtro.trim().toLowerCase();
    this.dataSource.data = texto === ''
      ? this.allData
      : this.allData.filter(item => item.name.toLowerCase().includes(texto) || (item.shortName || '').toLowerCase().includes(texto));
  }

  nuevoBanco(): void {
    const dialogRef = this.dialog.open(DialogFormBancoComponent, {
      data: { esNuevo: true, obj: null }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  editarBanco(banco: IBank): void {
    const dialogRef = this.dialog.open(DialogFormBancoComponent, {
      data: { esNuevo: false, obj: banco }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargar();
      }
    });
  }

  toggleEstado(banco: IBank): void {
    const nuevoEstado = !banco.isActive;
    if (!nuevoEstado && !confirm(`Se desactivará el banco "${banco.name}". ¿Deseas continuar?`)) {
      return;
    }
    this.bankCatalogsService.actualizarBanco(banco.id, { name: banco.name, shortName: banco.shortName, isActive: nuevoEstado }).subscribe({
      next: () => {
        this.notificationService.showSuccess(nuevoEstado ? 'Banco activado correctamente.' : 'Banco desactivado correctamente.');
        this.cargar();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar el estado del banco.'));
      }
    });
  }

}
