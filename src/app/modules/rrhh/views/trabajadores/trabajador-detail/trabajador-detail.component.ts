import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { NotificationsSystemService } from '../../../../../core/services/notifications-system.service';
import { EmployeesService } from '../../../services/employees.service';
import { CatalogosService } from '../../../services/catalogos.service';
import { AttendanceService } from '../../../services/attendance.service';
import { LoansService } from '../../../services/loans.service';
import { IArea, IPosition } from '../../../interfaces/ICatalogos';
import { IEmployeeDetail } from '../../../interfaces/IEmployees';
import { IEmployeeDocument } from '../../../interfaces/IEmployeeDocuments';
import { IAttendanceIncident, IAttendanceRecord, IExtraHour } from '../../../interfaces/IAttendance';
import { ILoan } from '../../../interfaces/ILoans';
import { EMPLOYEE_CONTRACT_TYPE_OPTIONS, EmployeeContractTypeLabelPipe } from '../../../shared/employee-contract-type';
import { IncidentTypeColorPipe, IncidentTypeLabelPipe } from '../../../shared/attendance-incident-type';
import { LoanTypeLabelPipe } from '../../../shared/loan-type';
import { extractErrorMessage } from '../../../shared/http-error.util';
import { DialogTerminarTrabajadorComponent } from './components/dialog-terminar-trabajador/dialog-terminar-trabajador.component';
import { DialogDocumentoComponent } from './components/dialog-documento/dialog-documento.component';
import { DialogIncidenciaComponent } from './components/dialog-incidencia/dialog-incidencia.component';
import { DialogHoraExtraComponent } from './components/dialog-hora-extra/dialog-hora-extra.component';
import { DialogPrestamoComponent } from './components/dialog-prestamo/dialog-prestamo.component';

@Component({
  selector: 'app-trabajador-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule, MatTableModule, MatTooltipModule,
    CurrencyPipe, DatePipe, EmployeeContractTypeLabelPipe, IncidentTypeLabelPipe, IncidentTypeColorPipe, LoanTypeLabelPipe,
  ],
  templateUrl: './trabajador-detail.component.html',
  styleUrl: './trabajador-detail.component.css'
})
export class TrabajadorDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private employeesService = inject(EmployeesService);
  private catalogosService = inject(CatalogosService);
  private attendanceService = inject(AttendanceService);
  private loansService = inject(LoansService);
  private notificationService = inject(NotificationsSystemService);
  private dialog = inject(MatDialog);

  employeeId = 0;
  trabajador: IEmployeeDetail | null = null;
  areas: IArea[] = [];
  cargos: IPosition[] = [];
  contractTypeOptions = EMPLOYEE_CONTRACT_TYPE_OPTIONS;
  guardandoDatos = false;

  formDatos: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    address: [''],
    areaId: [null, Validators.required],
    positionId: [null, Validators.required],
    contractType: [null, Validators.required],
    baseSalary: [0, [Validators.required, Validators.min(0)]],
  });

  documentos: IEmployeeDocument[] = [];
  documentosColumns = ['tipo', 'archivo', 'notas', 'fecha', 'acciones'];
  documentosDataSource = new MatTableDataSource<IEmployeeDocument>([]);

  asistencia: IAttendanceRecord[] = [];
  asistenciaColumns = ['fecha', 'entrada', 'salida'];
  asistenciaDataSource = new MatTableDataSource<IAttendanceRecord>([]);

  incidencias: IAttendanceIncident[] = [];
  incidenciasColumns = ['fecha', 'tipo', 'horas', 'observacion'];
  incidenciasDataSource = new MatTableDataSource<IAttendanceIncident>([]);

  horasExtra: IExtraHour[] = [];
  horasExtraColumns = ['fecha', 'horas', 'observacion', 'estado', 'acciones'];
  horasExtraDataSource = new MatTableDataSource<IExtraHour>([]);

  prestamos: ILoan[] = [];
  prestamosColumns = ['tipo', 'fecha', 'monto', 'saldo', 'estado', 'observacion'];
  prestamosDataSource = new MatTableDataSource<ILoan>([]);

  ngOnInit(): void {
    this.catalogosService.listarAreas(true).subscribe({ next: (r) => this.areas = r.data });
    this.catalogosService.listarCargos(true).subscribe({ next: (r) => this.cargos = r.data });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.employeeId = Number(params['id']);
        this.cargarTrabajador();
        this.cargarDocumentos();
        this.cargarAsistencia();
        this.cargarIncidencias();
        this.cargarHorasExtra();
        this.cargarPrestamos();
      }
    });
  }

  cargarTrabajador(): void {
    this.employeesService.obtenerTrabajador(this.employeeId).subscribe({
      next: (resp) => {
        this.trabajador = resp.data;
        this.formDatos.patchValue({
          firstName: resp.data.firstName,
          lastName: resp.data.lastName,
          phoneNumber: resp.data.phoneNumber,
          address: resp.data.address,
          areaId: resp.data.areaId,
          positionId: resp.data.positionId,
          contractType: resp.data.contractType,
          baseSalary: resp.data.baseSalary,
        });
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo obtener el trabajador.'));
      }
    });
  }

  guardarDatos(): void {
    if (this.formDatos.invalid) return;
    this.guardandoDatos = true;
    this.employeesService.actualizarTrabajador(this.employeeId, this.formDatos.value).subscribe({
      next: () => {
        this.guardandoDatos = false;
        this.notificationService.showSuccess('Datos actualizados correctamente.');
        this.cargarTrabajador();
      },
      error: (err) => {
        this.guardandoDatos = false;
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo actualizar el trabajador.'));
      }
    });
  }

  darDeBaja(): void {
    if (!this.trabajador) return;
    const dialogRef = this.dialog.open(DialogTerminarTrabajadorComponent, {
      data: { employeeId: this.employeeId, employeeName: `${this.trabajador.firstName} ${this.trabajador.lastName}` }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargarTrabajador();
    });
  }

  // Documentos

  documentosDescargando = new Set<number>();

  cargarDocumentos(): void {
    this.employeesService.listarDocumentos(this.employeeId).subscribe({
      next: (resp) => {
        this.documentos = resp.data;
        this.documentosDataSource.data = resp.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los documentos.'));
      }
    });
  }

  agregarDocumento(): void {
    const dialogRef = this.dialog.open(DialogDocumentoComponent, { data: { employeeId: this.employeeId } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargarDocumentos();
    });
  }

  iconoDocumento(doc: IEmployeeDocument): string {
    return doc.contentType === 'application/pdf' ? 'picture_as_pdf' : 'image';
  }

  descargarDocumento(doc: IEmployeeDocument): void {
    if (this.documentosDescargando.has(doc.id)) return;
    this.documentosDescargando.add(doc.id);
    this.employeesService.descargarDocumento(this.employeeId, doc.id).subscribe({
      next: (blob) => {
        this.documentosDescargando.delete(doc.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.fileName;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: (err) => {
        this.documentosDescargando.delete(doc.id);
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo descargar el documento.'));
      }
    });
  }

  eliminarDocumento(doc: IEmployeeDocument): void {
    if (!confirm(`¿Eliminar el documento "${doc.fileName}"?`)) return;
    this.employeesService.eliminarDocumento(this.employeeId, doc.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Documento eliminado correctamente.');
        this.cargarDocumentos();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo eliminar el documento.'));
      }
    });
  }

  // Asistencia

  cargarAsistencia(): void {
    this.attendanceService.listarAsistencia({ employeeId: this.employeeId }).subscribe({
      next: (resp) => {
        this.asistencia = resp.data;
        this.asistenciaDataSource.data = resp.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo cargar la asistencia.'));
      }
    });
  }

  // Incidencias

  cargarIncidencias(): void {
    this.attendanceService.listarIncidencias({ employeeId: this.employeeId }).subscribe({
      next: (resp) => {
        this.incidencias = resp.data;
        this.incidenciasDataSource.data = resp.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las incidencias.'));
      }
    });
  }

  agregarIncidencia(): void {
    const dialogRef = this.dialog.open(DialogIncidenciaComponent, { data: { employeeId: this.employeeId } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargarIncidencias();
    });
  }

  // Horas Extra

  cargarHorasExtra(): void {
    this.attendanceService.listarHorasExtra({ employeeId: this.employeeId }).subscribe({
      next: (resp) => {
        this.horasExtra = resp.data;
        this.horasExtraDataSource.data = resp.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar las horas extra.'));
      }
    });
  }

  agregarHoraExtra(): void {
    const dialogRef = this.dialog.open(DialogHoraExtraComponent, { data: { employeeId: this.employeeId } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargarHorasExtra();
    });
  }

  aprobarHoraExtra(item: IExtraHour): void {
    this.attendanceService.aprobarHoraExtra(item.id).subscribe({
      next: () => {
        this.notificationService.showSuccess('Hora extra aprobada correctamente.');
        this.cargarHorasExtra();
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudo aprobar la hora extra.'));
      }
    });
  }

  // Préstamos

  cargarPrestamos(): void {
    this.loansService.listarPrestamos({ employeeId: this.employeeId }).subscribe({
      next: (resp) => {
        this.prestamos = resp.data;
        this.prestamosDataSource.data = resp.data;
      },
      error: (err) => {
        this.notificationService.showError(extractErrorMessage(err, 'No se pudieron cargar los préstamos.'));
      }
    });
  }

  agregarPrestamo(): void {
    const dialogRef = this.dialog.open(DialogPrestamoComponent, { data: { employeeId: this.employeeId } });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.cargarPrestamos();
    });
  }

  volver(): void {
    this.router.navigate(['/rrhh/trabajadores']);
  }

}
