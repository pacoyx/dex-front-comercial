import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableResumenUsuarioComponent } from './table-resumen-usuario.component';

describe('TableResumenUsuarioComponent', () => {
  let component: TableResumenUsuarioComponent;
  let fixture: ComponentFixture<TableResumenUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableResumenUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableResumenUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
