import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteResumenCajaComponent } from './reporte-resumen-caja.component';

describe('ReporteResumenCajaComponent', () => {
  let component: ReporteResumenCajaComponent;
  let fixture: ComponentFixture<ReporteResumenCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteResumenCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteResumenCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
