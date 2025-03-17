import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableDetalleTicketComponent } from './table-detalle-ticket.component';

describe('TableDetalleTicketComponent', () => {
  let component: TableDetalleTicketComponent;
  let fixture: ComponentFixture<TableDetalleTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableDetalleTicketComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableDetalleTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
