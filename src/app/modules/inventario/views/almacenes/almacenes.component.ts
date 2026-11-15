import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsSystemService } from '../../../../core/services/notifications-system.service';
import { LoadingComponent } from '../../../../core/components/loading/loading.component';
import { InventarioService } from '../../services/inventario.service';
import { IBranchOption, IWarehouse } from '../../interfaces/IInventario';
import { mensajeError } from '../../shared/http-error.util';
import { DialogAlmacenComponent } from './dialog-almacen.component';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatTableModule, MatTooltipModule, LoadingComponent],
  template: `
    <div class="inv-page">
      <div class="page-header">
        <div class="page-header__title">
          <mat-icon>warehouse</mat-icon>
          <div class="page-header__heading">
            <h1>Almacenes</h1>
            <span class="page-header__subtitle">Cada sucursal tiene un almacén por defecto; puedes crear más</span>
          </div>
        </div>
        <div class="page-header__actions">
          <button mat-flat-button color="primary" (click)="abrir(null)">
            <mat-icon>add</mat-icon> Nuevo almacén
          </button>
        </div>
      </div>

      @if (errorMessage) { <div class="alert-error">{{ errorMessage }}</div> }
      @if (loading) { <app-loading></app-loading> }

      <mat-card class="panel" appearance="outlined">
        <mat-card-content class="tabla-scroll">
          <table mat-table [dataSource]="almacenes" class="detail-table">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>Código</th>
              <td mat-cell *matCellDef="let a">{{ a.code }}</td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let a">
                {{ a.name }}
                @if (a.isDefault) { <span class="chip chip--ok">Por defecto</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="branch">
              <th mat-header-cell *matHeaderCellDef>Sucursal</th>
              <td mat-cell *matCellDef="let a">{{ a.branchName }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let a">
                <span class="chip" [class.chip--ok]="a.isActive" [class.chip--neutral]="!a.isActive">{{ a.isActive ? 'Activo' : 'Inactivo' }}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let a" class="col-numeric">
                <button mat-icon-button (click)="abrir(a)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
          </table>
          @if (!loading && almacenes.length === 0) {
          <div class="sin-datos">No hay almacenes registrados.</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: '../../shared/inventario-page.css'
})
export class AlmacenesComponent implements OnInit {

  private inventarioService = inject(InventarioService);
  private notifications = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  almacenes: IWarehouse[] = [];
  sucursales: IBranchOption[] = [];
  columnas = ['code', 'name', 'branch', 'status', 'actions'];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.inventarioService.listarSucursales().subscribe({ next: (resp) => this.sucursales = resp.data });
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.inventarioService.listarAlmacenes().subscribe({
      next: (resp) => {
        this.loading = false;
        this.almacenes = resp.data;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = mensajeError(err, 'No se pudieron cargar los almacenes.');
      }
    });
  }

  abrir(almacen: IWarehouse | null): void {
    const ref = this.dialog.open(DialogAlmacenComponent, { data: { almacen, sucursales: this.sucursales }, maxWidth: '95vw' });
    ref.afterClosed().subscribe((grabado: boolean) => {
      if (grabado) {
        this.notifications.showSuccess('Almacén grabado correctamente.');
        this.cargar();
      }
    });
  }
}
