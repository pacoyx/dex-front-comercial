import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MntClientesComponent } from './mnt-clientes.component';

describe('MntClientesComponent', () => {
  let component: MntClientesComponent;
  let fixture: ComponentFixture<MntClientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MntClientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MntClientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
