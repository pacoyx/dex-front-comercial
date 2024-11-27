import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepcionGrillaBusquedaServiciosComponent } from './recepcion-grilla-busqueda-servicios.component';

describe('RecepcionGrillaBusquedaServiciosComponent', () => {
  let component: RecepcionGrillaBusquedaServiciosComponent;
  let fixture: ComponentFixture<RecepcionGrillaBusquedaServiciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecepcionGrillaBusquedaServiciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecepcionGrillaBusquedaServiciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
