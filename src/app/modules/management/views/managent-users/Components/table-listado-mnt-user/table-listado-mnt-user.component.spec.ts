import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableListadoMntUserComponent } from './table-listado-mnt-user.component';

describe('TableListadoMntUserComponent', () => {
  let component: TableListadoMntUserComponent;
  let fixture: ComponentFixture<TableListadoMntUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableListadoMntUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableListadoMntUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
