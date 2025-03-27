import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardcajaComponent } from './dashboardcaja.component';

describe('DashboardcajaComponent', () => {
  let component: DashboardcajaComponent;
  let fixture: ComponentFixture<DashboardcajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardcajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardcajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
