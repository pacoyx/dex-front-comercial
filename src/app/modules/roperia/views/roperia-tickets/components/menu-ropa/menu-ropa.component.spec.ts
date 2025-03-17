import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuRopaComponent } from './menu-ropa.component';

describe('MenuRopaComponent', () => {
  let component: MenuRopaComponent;
  let fixture: ComponentFixture<MenuRopaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuRopaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuRopaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
