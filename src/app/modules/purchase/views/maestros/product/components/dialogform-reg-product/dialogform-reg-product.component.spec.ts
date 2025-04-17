import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogformRegProductComponent } from './dialogform-reg-product.component';

describe('DialogformRegProductComponent', () => {
  let component: DialogformRegProductComponent;
  let fixture: ComponentFixture<DialogformRegProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogformRegProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogformRegProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
