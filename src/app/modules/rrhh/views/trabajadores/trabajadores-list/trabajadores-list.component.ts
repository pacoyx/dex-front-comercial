import { AfterViewInit, Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ViewChild } from '@angular/core';
import { EmployeesService } from '../../../services/employees.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { IEmployeeListItem } from '../../../interfaces/IEmployees';
import { IArea } from '../../../interfaces/ICatalogos';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { EmployeeContractTypeLabelPipe } from '../../../shared/employee-contract-type';

@Component({
  selector: 'app-trabajadores-list',
  standalone: true,
  imports: [
    MatButtonModule, MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatTableModule, MatPaginatorModule, MatTooltipModule, FormsModule, RouterModule,
    CurrencyPipe, DatePipe, EmployeeContractTypeLabelPipe,
  ],
  templateUrl: './trabajadores-list.component.html',
  styleUrl: './trabajadores-list.component.css'
})
export class TrabajadoresListComponent implements OnInit, AfterViewInit {

  private employeesService = inject(EmployeesService);
  private catalogosService = inject(CatalogosService);
  private notificationService = inject(NotificationsSystemService);
  private router = inject(Router);

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  search = '';
  onlyActive = true;
  areaId: number | null = null;
  areas: IArea[] = [];

  displayedColumns: string[] = ['code', 'nombre', 'documento', 'area', 'cargo', 'contrato', 'sueldo', 'estado'];
  dataSource = new MatTableDataSource<IEmployeeListItem>([]);
  totalCount = 0;
  pageSize = 20;

  ngOnInit(): void {
    this.catalogosService.listarAreas(true).subscribe({
      next: (resp) => this.areas = resp.data,
      error: () => { /* no bloquea el listado principal */ }
    });
    this.buscar();
  }

  ngAfterViewInit(): void {
    this.paginator.page.subscribe(() => {
      this.cargar(this.paginator.pageIndex + 1, this.paginator.pageSize);
    });
  }

  buscar(): void {
    this.paginator.pageIndex = 0;
    this.cargar(1, this.paginator.pageSize);
  }

  limpiar(): void {
    this.search = '';
    this.onlyActive = true;
    this.areaId = null;
    this.buscar();
  }

  cargar(pageNumber: number, pageSize: number): void {
    this.employeesService.listarTrabajadores({
      pageNumber,
      pageSize,
      onlyActive: this.onlyActive || undefined,
      areaId: this.areaId ?? undefined,
      search: this.search.trim() || undefined,
    }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data.employees;
        this.totalCount = response.data.totalCount;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'Ocurrió un error al listar los trabajadores.'));
      }
    });
  }

  verTrabajador(id: number): void {
    this.router.navigate(['/rrhh/trabajadores', id]);
  }

}
