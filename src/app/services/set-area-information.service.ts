import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Area } from '@core/models/interface/area';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SetAreaInformationService {
  private favIcon: HTMLLinkElement | null;
  private areaInformationSubject = new BehaviorSubject<Area | null>(null); // Valor inicial nulo

  areaInformation = this.areaInformationSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.favIcon = document.querySelector('#favIcon');
    } else {
      this.favIcon = null;
    }
  }

  setAreaInformation(area: Area): void {
    this.areaInformationSubject.next(area);
    this.setAreaTheme(area);
  }

  setAreaTheme(area: Area): void {
    if (isPlatformBrowser(this.platformId)) {
      if (area) {
        if (this.favIcon) {
          this.favIcon.href = area.faviconUrl;
        }
        
        const titleElements = document.querySelectorAll('.title') as NodeListOf<HTMLElement>;
        const virtualAssistantRobotSvgElements = document.querySelectorAll('.virtual-assistant-robot-svg') as NodeListOf<HTMLElement>;
        const virtualAssistantRobotSvgBellyFillElements = document.querySelectorAll('.virtual-assistant-robot-svg-belly-fill') as NodeListOf<HTMLElement>;
        const virtualAssistantRobotSvgBellyFillShadowElements = document.querySelectorAll('.virtual-assistant-robot-svg-belly-fill-shadow') as NodeListOf<HTMLElement>;
 
        titleElements.forEach(element => {
          element.style.color = area.primaryColor;
        });
        virtualAssistantRobotSvgElements.forEach(element => {
          element.style.setProperty("-webkit-filter", `drop-shadow(1px 1px 0 ${area.primaryColor}) drop-shadow(-1px -1px 0 ${area.primaryColor})`);
          element.style.setProperty("filter", `drop-shadow(1px 1px 0 ${area.primaryColor}) drop-shadow(-1px -1px 0 ${area.primaryColor})`);
        });
        virtualAssistantRobotSvgBellyFillElements.forEach(element => {
          element.style.setProperty("fill", `${area.primaryColor}bb`);
        });
        virtualAssistantRobotSvgBellyFillShadowElements.forEach(element => {
          element.style.setProperty("fill", `${area.primaryColor}`);
        });
      }
    }
  }
}