import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPurchaseComponent } from './dashboard-purchase.component';

describe('DashboardPurchaseComponent', () => {
  let component: DashboardPurchaseComponent;
  let fixture: ComponentFixture<DashboardPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
