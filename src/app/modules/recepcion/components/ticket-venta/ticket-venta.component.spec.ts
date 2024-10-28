import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketVentaComponent } from './ticket-venta.component';

describe('TicketVentaComponent', () => {
  let component: TicketVentaComponent;
  let fixture: ComponentFixture<TicketVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
