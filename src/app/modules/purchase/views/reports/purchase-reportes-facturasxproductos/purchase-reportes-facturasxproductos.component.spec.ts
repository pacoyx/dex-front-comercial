import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReportesFacturasxproductosComponent } from './purchase-reportes-facturasxproductos.component';

describe('PurchaseReportesFacturasxproductosComponent', () => {
  let component: PurchaseReportesFacturasxproductosComponent;
  let fixture: ComponentFixture<PurchaseReportesFacturasxproductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseReportesFacturasxproductosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseReportesFacturasxproductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
