import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutRoperiaComponent } from './layout-roperia.component';

describe('LayoutRoperiaComponent', () => {
  let component: LayoutRoperiaComponent;
  let fixture: ComponentFixture<LayoutRoperiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutRoperiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutRoperiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
