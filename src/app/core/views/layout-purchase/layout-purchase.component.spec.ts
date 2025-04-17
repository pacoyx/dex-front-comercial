import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutPurchaseComponent } from './layout-purchase.component';

describe('LayoutPurchaseComponent', () => {
  let component: LayoutPurchaseComponent;
  let fixture: ComponentFixture<LayoutPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutPurchaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
