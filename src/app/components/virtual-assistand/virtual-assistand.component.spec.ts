import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualAssistandComponent } from './virtual-assistand.component';

describe('VirtualAssistandComponent', () => {
  let component: VirtualAssistandComponent;
  let fixture: ComponentFixture<VirtualAssistandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualAssistandComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualAssistandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
