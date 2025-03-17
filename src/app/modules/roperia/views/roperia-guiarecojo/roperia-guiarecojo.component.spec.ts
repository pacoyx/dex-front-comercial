import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoperiaGuiarecojoComponent } from './roperia-guiarecojo.component';

describe('RoperiaGuiarecojoComponent', () => {
  let component: RoperiaGuiarecojoComponent;
  let fixture: ComponentFixture<RoperiaGuiarecojoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoperiaGuiarecojoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoperiaGuiarecojoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
