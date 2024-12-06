import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDetResumenCajaComponent } from './table-det-resumen-caja.component';

describe('TableDetResumenCajaComponent', () => {
  let component: TableDetResumenCajaComponent;
  let fixture: ComponentFixture<TableDetResumenCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDetResumenCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDetResumenCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
