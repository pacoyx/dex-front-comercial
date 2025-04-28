import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReportesFacturasxparamsComponent } from './purchase-reportes-facturasxparams.component';

describe('PurchaseReportesFacturasxparamsComponent', () => {
  let component: PurchaseReportesFacturasxparamsComponent;
  let fixture: ComponentFixture<PurchaseReportesFacturasxparamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseReportesFacturasxparamsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseReportesFacturasxparamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
