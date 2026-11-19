import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { DialogFormRegProdServiceComponent } from './dialog-form-reg-prod-service.component';
import { MaestrosService } from '../../../../../services/maestros.service';
import { EmisionService } from '../../../../../services/emision.service';
import { NotificationServiceService } from '../../../../../services/notification-service.service';
import { IResponseProdServices } from '../../../../../interfaces/IProdServices';

describe('DialogFormRegProdServiceComponent', () => {
  let component: DialogFormRegProdServiceComponent;
  let fixture: ComponentFixture<DialogFormRegProdServiceComponent>;
  let maestros: jasmine.SpyObj<MaestrosService>;
  let emision: jasmine.SpyObj<EmisionService>;
  let notif: jasmine.SpyObj<NotificationServiceService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<DialogFormRegProdServiceComponent>>;

  const okResp = { statusCode: '200', message: 'ok', data: 'ok', success: true, errors: [] };
  const failResp = { statusCode: '200', message: 'Nombre duplicado', data: '', success: false, errors: [] };

  const servicioExistente: IResponseProdServices = {
    id: 42, name: 'Lavado', description: 'Lavado al peso', price: 10, status: 'A',
    catServiceId: 3, isPeso: 'S', isLavado: 'S',
  };

  async function crear(data: { esNuevo: boolean; objServicio: IResponseProdServices | null; idServicio: number }) {
    maestros = jasmine.createSpyObj<MaestrosService>('MaestrosService', ['registrarProdService', 'actualizarProdService']);
    emision = jasmine.createSpyObj<EmisionService>('EmisionService', ['listarCategoriasSevicios']);
    emision.listarCategoriasSevicios.and.returnValue(of([]));
    notif = jasmine.createSpyObj<NotificationServiceService>('NotificationServiceService', ['showSuccess', 'showError']);
    dialogRef = jasmine.createSpyObj<MatDialogRef<DialogFormRegProdServiceComponent>>('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [DialogFormRegProdServiceComponent],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MaestrosService, useValue: maestros },
        { provide: EmisionService, useValue: emision },
        { provide: NotificationServiceService, useValue: notif },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DialogFormRegProdServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function llenarValido(): void {
    component.servicioForm.patchValue({ name: 'Planchado', price: 5, catServiceId: 1 });
  }

  describe('alta', () => {
    beforeEach(async () => crear({ esNuevo: true, objServicio: null, idServicio: 0 }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('a) valores por defecto: isPeso N, isLavado N, status A', () => {
      const v = component.servicioForm.getRawValue();
      expect(v.isPeso).toBe('N');
      expect(v.isLavado).toBe('N');
      expect(v.status).toBe('A');
    });

    it('b) la descripción replica el nombre; deja de replicar al editarla a mano y vuelve al vaciarla', () => {
      const { name, description } = component.servicioForm.controls;
      name.setValue('Lav');
      expect(description.value).toBe('Lav');
      name.setValue('Lavado');
      expect(description.value).toBe('Lavado');

      description.setValue('Descripción manual');
      name.setValue('Lavado express');
      expect(description.value).toBe('Descripción manual');

      description.setValue('');
      name.setValue('Lavado premium');
      expect(description.value).toBe('Lavado premium');
    });

    it('c) el payload de crear usa el nombre si la descripción está vacía (nunca null ni vacía)', () => {
      maestros.registrarProdService.and.returnValue(of(okResp));
      llenarValido();
      component.servicioForm.controls.description.setValue('   ');
      component.onSubmit();

      expect(maestros.registrarProdService).toHaveBeenCalledTimes(1);
      const payload = maestros.registrarProdService.calls.mostRecent().args[0];
      expect(payload.description).toBe('Planchado');
      expect(payload.description).not.toBeNull();
      expect(payload.isPeso).toBe('N');
      expect(payload.isLavado).toBe('N');
      expect(payload.status).toBe('A');
    });

    it('d) con formulario inválido no llama al servicio y marca los campos como touched', () => {
      component.onSubmit();
      expect(maestros.registrarProdService).not.toHaveBeenCalled();
      expect(maestros.actualizarProdService).not.toHaveBeenCalled();
      const c = component.servicioForm.controls;
      expect(c.name.touched).toBeTrue();
      expect(c.price.touched).toBeTrue();
      expect(c.catServiceId.touched).toBeTrue();
    });

    it('e) si resp.success es false, el modal no se cierra y muestra error', () => {
      maestros.registrarProdService.and.returnValue(of(failResp));
      llenarValido();
      component.onSubmit();
      expect(dialogRef.close).not.toHaveBeenCalled();
      expect(notif.showError).toHaveBeenCalledWith('Nombre duplicado');
      expect(component.loadingSave).toBeFalse();
    });

    it('si resp.success es true, cierra el modal con la respuesta', () => {
      maestros.registrarProdService.and.returnValue(of(okResp));
      llenarValido();
      component.onSubmit();
      expect(dialogRef.close).toHaveBeenCalledWith(okResp);
    });
  });

  describe('edición', () => {
    beforeEach(async () => crear({ esNuevo: false, objServicio: servicioExistente, idServicio: 42 }));

    it('carga los datos del servicio y no replica si la descripción difiere del nombre', () => {
      const { name, description, isPeso } = component.servicioForm.controls;
      expect(name.value).toBe('Lavado');
      expect(isPeso.value).toBe('S');
      name.setValue('Lavado 2');
      expect(description.value).toBe('Lavado al peso');
    });

    it('f) el PUT incluye el id', () => {
      maestros.actualizarProdService.and.returnValue(of(okResp));
      component.onSubmit();
      expect(maestros.registrarProdService).not.toHaveBeenCalled();
      expect(maestros.actualizarProdService).toHaveBeenCalledTimes(1);
      const [body, id] = maestros.actualizarProdService.calls.mostRecent().args;
      expect(body.id).toBe(42);
      expect(id).toBe(42);
      expect(body.name).toBe('Lavado');
      expect(body.description).toBe('Lavado al peso');
    });
  });
});
