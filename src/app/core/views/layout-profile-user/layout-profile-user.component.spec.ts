import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutProfileUserComponent } from './layout-profile-user.component';

describe('LayoutProfileUserComponent', () => {
  let component: LayoutProfileUserComponent;
  let fixture: ComponentFixture<LayoutProfileUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutProfileUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutProfileUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
