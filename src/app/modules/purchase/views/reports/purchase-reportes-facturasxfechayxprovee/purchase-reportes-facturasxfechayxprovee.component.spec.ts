import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReportesFacturasxfechayxproveeComponent } from './purchase-reportes-facturasxfechayxprovee.component';

describe('PurchaseReportesFacturasxfechayxproveeComponent', () => {
  let component: PurchaseReportesFacturasxfechayxproveeComponent;
  let fixture: ComponentFixture<PurchaseReportesFacturasxfechayxproveeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseReportesFacturasxfechayxproveeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseReportesFacturasxfechayxproveeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
