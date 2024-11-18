import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MntUsuariosComponent } from './mnt-usuarios.component';

describe('MntUsuariosComponent', () => {
  let component: MntUsuariosComponent;
  let fixture: ComponentFixture<MntUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MntUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MntUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
