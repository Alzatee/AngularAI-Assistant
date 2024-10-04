import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualAssistandMenuComponent } from './virtual-assistand-menu.component';

describe('VirtualAssistandMenuComponent', () => {
  let component: VirtualAssistandMenuComponent;
  let fixture: ComponentFixture<VirtualAssistandMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualAssistandMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualAssistandMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
