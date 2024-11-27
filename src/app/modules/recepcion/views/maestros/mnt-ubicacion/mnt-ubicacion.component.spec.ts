import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MntUbicacionComponent } from './mnt-ubicacion.component';

describe('MntUbicacionComponent', () => {
  let component: MntUbicacionComponent;
  let fixture: ComponentFixture<MntUbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MntUbicacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MntUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
