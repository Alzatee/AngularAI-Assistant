import { AfterViewInit, Component, OnInit } from '@angular/core';
import { VirtualAssistandMenuComponent } from '@components/virtual-assistand/virtual-assistand-menu/virtual-assistand-menu.component';
import { VirtualAssistandChatComponent } from '@components/virtual-assistand/virtual-assistand-chat/virtual-assistand-chat.component';
import { FooterComponent } from '@layout/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '@services/theme-service';
import { SetAreaInformationService } from '@services/set-area-information.service';
import { VirtualAssistandService } from '@services/virtual-assistand.service';
import { ActivatedRoute } from '@angular/router';
import { Area } from '@core/models/interface/area';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TypeAIChatBots } from '@core/models/enums/type-ai-chatbots';
import { MessageChat } from '@core/models/class/message-chat';
import { ChatInputComponent } from './virtual-assistand-chat/chat-input-component/chat-input.component';
import { AreasResponse } from '@core/models/interface/areas-response';

@Component({
  selector: 'AVA-virtual-assistand',
  standalone: true,
  imports: [VirtualAssistandChatComponent, VirtualAssistandMenuComponent, FooterComponent, FormsModule, CommonModule, MatIcon, ChatInputComponent],
  templateUrl: './virtual-assistand.component.html',
  styleUrl: './virtual-assistand.component.scss'
})
export class VirtualAssistandComponent implements OnInit, AfterViewInit {
  isChatInputUnique$: Observable<boolean>;
  themeApplied = false;
  currentTheme: 'light' | 'dark' | 'system' = 'system';
  public resetChat: string = '';
  public typeChatbot = TypeAIChatBots;
  public messageEmitter: any;
  public clearInputChat: boolean = false;
  public waitingAnswer: boolean = false;

  areasDetails: Area[] = [];

  urlParamArea: string | null = null;
  urlDecodedAreaValue: string | null = null;
  
  constructor (
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private virtualAssistandService: VirtualAssistandService,
    private setAreaInformationService: SetAreaInformationService
  ) { 
    this.isChatInputUnique$ = this.themeService.isChatInputUnique.asObservable();
  }

  resetChatEmitter(event: string): void {
    this.resetChat = event;
  }

  ngOnInit() {
    this.themeService.getThemeAppliedObservable().subscribe(isApplied => {
      this.themeApplied = isApplied;
    });

    this.themeService.getCurrentThemeObservable().subscribe(theme => {
      this.currentTheme = theme;
    });
  }
  
  ngAfterViewInit(): void {
    this.loadQueryParam();
  }

  sendMessageEmitter(messageChat: MessageChat) {
    this.messageEmitter = { ...messageChat };
  }

  clearInputChatEmit(clearInputChatEmit: boolean) {
    this.clearInputChat = clearInputChatEmit;
  }

  waitingAnswerEmit(waitingAnswerEmit: boolean) {
    this.waitingAnswer = waitingAnswerEmit;
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.themeService.setTheme(theme);
  }

  private loadQueryParam(): void {
    this.getQueryParam('area').subscribe(paramValue => {
      this.urlParamArea = paramValue;
      if (this.urlParamArea) {
        this.urlDecodedAreaValue = this.decodeBase64(this.urlParamArea);
        this.getAreasDetails();
      }
    });
  }

  private getQueryParam(paramName: string): Observable<string | null> {
    return this.route.queryParams.pipe(
      map(params => params[paramName] || null)
    );
  }

  private decodeBase64(base64String: string): string {
    try {
      const decodedString = atob(base64String);
      return decodedString;
    } catch (e) {
      console.error('Error al decodificar Base64:', e);
      return '';
    }
  }

  private getAreasDetails(): void {
    this.virtualAssistandService.getAreasDetails().subscribe({
      next: (response: AreasResponse) => {
        this.areasDetails = response.areas;
        this.applyAreaThemeAndInfo();
      },
      error: (error) => {
        console.error('Error obteniendo areas:', error);
      }
    });
  }

  private applyAreaThemeAndInfo(): void {  
    const decodedAreasDetails = this.areasDetails.map(area => ({
      ...area,
      code: this.decodeBase64(area.code)
    }));
  
    const filteredAreaDetail = decodedAreasDetails.filter(area => area.code === this.urlDecodedAreaValue);

    this.setAreaInformationService.setAreaInformation(filteredAreaDetail[0]);
  }

  configureChatInputType(event: boolean) {
    this.themeService.isChatInputUnique.next(event);
  }

}
