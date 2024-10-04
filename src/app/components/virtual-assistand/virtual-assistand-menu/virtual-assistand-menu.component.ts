import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, output, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'
import { KeepDropdownOpenDirective } from '@core/directives/keep-dropdown-open-directive';
import { AppTexts } from '@core/models/enums/app-text';
import { Area } from '@core/models/interface/area';
import { VirtualAssistantRobotSvgComponent } from '@layout/virtual-assistant-robot-svg/virtual-assistant-robot-svg.component';
import { SetAreaInformationService } from '@services/set-area-information.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'AVA-virtual-assistand-menu',
  standalone: true,
  imports: [MatIconModule, KeepDropdownOpenDirective, VirtualAssistantRobotSvgComponent],
  templateUrl: './virtual-assistand-menu.component.html',
  styleUrl: './virtual-assistand-menu.component.scss'
})
export class VirtualAssistandMenuComponent implements OnInit, OnDestroy {
  appTexts = AppTexts;
  areaInformation: Area | null = null;
  private subscriptions: Subscription[] = [];
  public resetChatEmitter = output<string>();

  constructor (
    @Inject(PLATFORM_ID) private platformId: Object,
    private setAreaInformationService: SetAreaInformationService,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.hideDefaultMenuOnMobileDevices();
    this.subscriptions.push(
      this.setAreaInformationService.areaInformation.subscribe(areaInfo => {
        if (areaInfo) {
          this.areaInformation = areaInfo;
          this.cdref.detectChanges();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  hideDefaultMenuOnMobileDevices(): void {
    if (typeof window !== "undefined") {
      let mediaQuery = window.matchMedia("(max-width: 768px)");
      if (mediaQuery.matches) {
        this.collapseMenu();
      }
    }
  }

  collapseMenu(): void {
    if (isPlatformBrowser(this.platformId)) {  
      let sidebarCollapse = document.getElementById('sidebarCollapse');
      let sidebar = document.getElementById('sidebar');

      if (sidebarCollapse && sidebar) {
        sidebar.classList.toggle('active');
        sidebarCollapse.classList.toggle('active');
      }
    }
  }

  isMenuClosed(): boolean {
    let menuActive = false;
    if (isPlatformBrowser(this.platformId)) {
      let sidebar = document.getElementById('sidebar');
      menuActive = sidebar ? sidebar.classList.contains('active') : false;
    }

    return menuActive;
  }

  resetChat(): void {
    this.resetChatEmitter.emit(`clean chat ${new Date().getTime()}`);
  }
}
