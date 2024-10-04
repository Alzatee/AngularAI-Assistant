import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VisibilityService {
  private hasShown = false;

  constructor() {}

  shouldShow(): boolean {
    if (!this.hasShown) {
      this.hasShown = true;
      return true;
    }
    return false;
  }
}