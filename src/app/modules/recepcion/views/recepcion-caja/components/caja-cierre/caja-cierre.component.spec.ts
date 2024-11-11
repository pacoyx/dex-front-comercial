import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaCierreComponent } from './caja-cierre.component';

describe('CajaCierreComponent', () => {
  let component: CajaCierreComponent;
  let fixture: ComponentFixture<CajaCierreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaCierreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CajaCierreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
