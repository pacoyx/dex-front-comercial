import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagentUsersComponent } from './managent-users.component';

describe('ManagentUsersComponent', () => {
  let component: ManagentUsersComponent;
  let fixture: ComponentFixture<ManagentUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagentUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagentUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
