import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableResumenGastosComponent } from './table-resumen-gastos.component';

describe('TableResumenGastosComponent', () => {
  let component: TableResumenGastosComponent;
  let fixture: ComponentFixture<TableResumenGastosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableResumenGastosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableResumenGastosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
