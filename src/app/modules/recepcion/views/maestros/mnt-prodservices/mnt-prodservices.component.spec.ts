import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MntProdservicesComponent } from './mnt-prodservices.component';
import { MaestrosService } from '../../../services/maestros.service';
import { NotificationServiceService } from '../../../services/notification-service.service';
import { IResponseProdServices } from '../../../interfaces/IProdServices';

function servicio(id: number, name: string, description = name): IResponseProdServices {
  return { id, name, description, price: 10, status: 'A', catServiceId: 1, isPeso: 'N', isLavado: 'N' };
}

function resp(servicios: IResponseProdServices[], totalCount = servicios.length) {
  return of({ statusCode: '200', message: '', success: true, errors: [], data: { totalCount, servicios } });
}

describe('MntProdservicesComponent', () => {
  let component: MntProdservicesComponent;
  let fixture: ComponentFixture<MntProdservicesComponent>;
  let maestros: jasmine.SpyObj<MaestrosService>;
  let notif: jasmine.SpyObj<NotificationServiceService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const catalogo: IResponseProdServices[] = [
    servicio(1, 'Lavado de casaca'),
    servicio(2, 'Planchado de camisa'),
    servicio(3, 'Teñido', 'Teñido de prendas'),
  ];

  beforeEach(async () => {
    maestros = jasmine.createSpyObj<MaestrosService>('MaestrosService', ['obtenerProdServices', 'eliminarProdService']);
    maestros.obtenerProdServices.and.callFake((_p: number, filas: number) =>
      resp(catalogo.slice(0, filas), catalogo.length));
    notif = jasmine.createSpyObj<NotificationServiceService>('NotificationServiceService', ['showSuccess', 'showError']);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [MntProdservicesComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MaestrosService, useValue: maestros },
        { provide: NotificationServiceService, useValue: notif },
        { provide: MatDialog, useValue: dialog },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MntProdservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function nombresVisibles(): string[] {
    return component.dataSource.data.map((s) => s.name);
  }

  it('should create y carga la página 1 en servidor', () => {
    expect(component).toBeTruthy();
    expect(maestros.obtenerProdServices).toHaveBeenCalledWith(1, 10);
  });

  it('g) al buscar "CASACA" pide (1, 1000) y encuentra "Lavado de casaca"', fakeAsync(() => {
    maestros.obtenerProdServices.calls.reset();
    component.buscadorControl.setValue('CASACA');
    tick(300);

    expect(maestros.obtenerProdServices).toHaveBeenCalledWith(1, 1000);
    expect(component.busquedaActiva).toBeTrue();
    expect(nombresVisibles()).toEqual(['Lavado de casaca']);
    expect(component.totalClientes).toBe(1);
  }));

  it('g) al buscar "lavádo" ignora tildes y mayúsculas', fakeAsync(() => {
    component.buscadorControl.setValue('lavádo');
    tick(300);
    expect(nombresVisibles()).toEqual(['Lavado de casaca']);
  }));

  it('g) un término con tilde no presente en los datos también coincide ("tenido" -> "Teñido")', fakeAsync(() => {
    component.buscadorControl.setValue('TENIDO');
    tick(300);
    expect(nombresVisibles()).toEqual(['Teñido']);
  }));

  it('h) si totalCount es mayor que lo recibido, hace una segunda petición con totalCount', fakeAsync(() => {
    maestros.obtenerProdServices.and.callFake((_p: number, filas: number) =>
      filas === 1000 ? resp(catalogo.slice(0, 2), 1500) : resp(catalogo, 1500));
    maestros.obtenerProdServices.calls.reset();

    component.buscadorControl.setValue('teñido');
    tick(300);

    expect(maestros.obtenerProdServices.calls.allArgs()).toEqual([[1, 1000], [1, 1500]]);
    expect(nombresVisibles()).toEqual(['Teñido']);
  }));

  it('i) al limpiar la búsqueda vuelve a paginación en servidor desde la página 1', fakeAsync(() => {
    component.buscadorControl.setValue('casaca');
    tick(300);
    expect(component.busquedaActiva).toBeTrue();

    component.paginator.pageIndex = 2;
    maestros.obtenerProdServices.calls.reset();

    component.limpiarBusqueda();
    tick(300);

    expect(component.busquedaActiva).toBeFalse();
    expect(component.termino).toBe('');
    expect(component.paginator.pageIndex).toBe(0);
    expect(maestros.obtenerProdServices).toHaveBeenCalledOnceWith(1, component.paginator.pageSize);
    expect(nombresVisibles().length).toBe(3);
  }));
});
