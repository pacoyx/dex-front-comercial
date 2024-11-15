import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DateAdapter, MAT_DATE_FORMATS, provideNativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { EmisionService } from '../../services/emision.service';
import { LoginService } from '../../../../core/services/login.service';
import { IListaGastosPorUserResponse } from '../../interfaces/IGastos';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomDateAdapter } from '../../config/custom-date-adapter';
import { CUSTOM_DATE_FORMATS } from '../../config/custom-date-formats';
import { MatDialog } from '@angular/material/dialog';
import { DialogFormGastoComponent } from './components/dialog-form-gasto/dialog-form-gasto.component';
import { DialogQuestionComponent } from '../../components/dialog-question/dialog-question.component';
import { Subscription } from 'rxjs';
import { NotificationServiceService } from '../../services/notification-service.service';
import { AlertDangerComponent } from '../../../../core/components/Alerts/alert-danger/alert-danger.component';

@Component({
  selector: 'app-recepcion-gastos',
  standalone: true,
  imports: [
    FormsModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    MatDatepickerModule, MatButtonModule, MatTableModule, DatePipe, 
    DecimalPipe, AlertDangerComponent],
  providers: [

    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  templateUrl: './recepcion-gastos.component.html',
  styleUrl: './recepcion-gastos.component.css'
})
export class RecepcionGastosComponent implements OnInit, OnDestroy {

  emisionService = inject(EmisionService);
  loginService = inject(LoginService);
  readonly dialog = inject(MatDialog);
  notificacionService = inject(NotificationServiceService);

  listGastos: IListaGastosPorUserResponse[] = [];

  displayedColumns: string[] = ['categoryGasto', 'personalAutoriza', 'fechaGasto', 'importe', 'detallesEgreso', 'operaciones'];
  dataSource = new MatTableDataSource<IListaGastosPorUserResponse>([]);

  loadingGastos = false;
  fechaHoy = new Date();
  bolExisteCaja = true;
  msgValidacion = '';

  subscriptionListaGastos!: Subscription;
  subscriptionConsulta!: Subscription;


  ngOnInit(): void {
    this.validarExisteCajaPorUsuario();
    this.cargarGastos()
  }

  ngOnDestroy(): void {
    if (this.subscriptionListaGastos) this.subscriptionListaGastos.unsubscribe();
    if (this.subscriptionConsulta) this.subscriptionConsulta.unsubscribe();

  }

  getTotalImporte() {
    return this.listGastos.map(t => t.importe).reduce((acc, value) => acc + value, 0);
  }

  validarExisteCajaPorUsuario(): void {

    this.subscriptionConsulta = this.emisionService.ListarCajaPorIdUser(this.loginService.getLoginData()?.userId!).subscribe({
      next: (data) => {
        if (data.success) {
          if (!data.data) {
            this.bolExisteCaja = false;
          }
        } else {
          this.bolExisteCaja = false;
        }
      },
      error: (err) => {
        this.notificacionService.showError(err);
        this.bolExisteCaja = false;
        this.msgValidacion = err;
      },
      complete: () => {
        console.log('complete obtenerCajaPorUsuario()');
      }
    });
  }

  cargarGastos() {
    let idIser = this.loginService.getLoginData()?.userId;
    if (idIser == null) {
      return;
    }

    this.loadingGastos = true;
    this.subscriptionListaGastos = this.emisionService.ListarGastosPorIdUser(idIser).subscribe({
      next: (res) => {
        console.log(res);
        this.loadingGastos = false;
        if (res.success) {
          this.listGastos = res.data;
          this.dataSource = new MatTableDataSource<IListaGastosPorUserResponse>(res.data);
        }

      },
      error: (err) => {
        this.notificacionService.showError(err);
        this.loadingGastos = false;
      },
      complete: () => {
        console.log('complete ListarGastosPorIdUser()');
      }
    });



  }

  openDialog() {
    const dialogRef = this.dialog.open(DialogFormGastoComponent, {
      width: '300px',
      data: { title: 'Registrar Gasto', edicion: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Handle the result if needed
      if (result) {
        this.cargarGastos();
      }
    });
  }

  deleteGasto(id: IListaGastosPorUserResponse) {

    this.dialog.open(DialogQuestionComponent, {
      width: '300px',
      data: { title: 'Eliminar Gasto', message: '¿Está seguro de eliminar el gasto?', msgButton: 'Eliminar' }
    }).afterClosed().subscribe(result => {
      // Handle the result if needed
      if (result == 'OK') {

        this.emisionService.EliminarGasto(id.id).subscribe({
          next: (res) => {
            console.log(res);
            if (res.success) {
              this.cargarGastos();
            }
          },
          error: (err) => {
            console.log(err);
          },
          complete: () => {
            console.log('complete EliminarGasto()');
          }
        });

      }
    });

  }

  editGasto(id: IListaGastosPorUserResponse) {

    let itemGasto = {
      categoria: id.categoryGasto,
      personalAutoriza: id.personalAutoriza,
      importe: id.importe,
      detallesEgreso: id.detallesEgreso,
      id: id.id
    };


    const dialogRef = this.dialog.open(DialogFormGastoComponent, {
      width: '300px',
      data: { title: 'Editar Gasto', edicion: true, itemGasto }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Handle the result if needed
      if (result) {
        this.cargarGastos();
      }
    });
  }
}
