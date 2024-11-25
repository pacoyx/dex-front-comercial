import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDetalleComponent } from './table-detalle.component';

describe('TableDetalleComponent', () => {
  let component: TableDetalleComponent;
  let fixture: ComponentFixture<TableDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
