import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[keepDropdownOpen]',
  standalone: true
})
export class KeepDropdownOpenDirective {
  constructor() { }

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    event.stopPropagation();
  }
}