import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaMovimientosComponent } from './caja-movimientos.component';

describe('CajaMovimientosComponent', () => {
  let component: CajaMovimientosComponent;
  let fixture: ComponentFixture<CajaMovimientosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaMovimientosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaMovimientosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
