import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualAssistandChatComponent } from './virtual-assistand-chat.component';

describe('VirtualAssistandChatComponent', () => {
  let component: VirtualAssistandChatComponent;
  let fixture: ComponentFixture<VirtualAssistandChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualAssistandChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualAssistandChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
