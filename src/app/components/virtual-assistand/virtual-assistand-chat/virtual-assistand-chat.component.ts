import { ChangeDetectorRef, Component, ElementRef, Inject, input, OnChanges, OnDestroy, OnInit, output, PLATFORM_ID, signal, SimpleChanges, ViewChild } from '@angular/core';
import { ChatInputComponent } from './chat-input-component/chat-input.component';
import { MatIconModule } from '@angular/material/icon';
import { MessageChat } from '@core/models/class/message-chat';
import { Chats, TypeChat } from '@core/models/types/chats';
import { TypeChats } from '@core/models/enums/type-chats';
import { ErrorMessages } from '@core/models/enums/error-messages';
import { AppTexts } from '@core/models/enums/app-text';
import { Area } from '@core/models/interface/area';
import { Observable, Subscription, timer } from 'rxjs';
import { SetAreaInformationService } from '@services/set-area-information.service';
import { CommonModule, isPlatformBrowser, NgClass } from '@angular/common';
import { VirtualAssistandService } from '@services/virtual-assistand.service';
import { ParamsChatService } from '@core/models/class/params-chat-service';
import { environment } from '@environments/environment';
import { TypeAIChatBots } from '@core/models/enums/type-ai-chatbots';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Converter } from 'showdown';
import { ThemeService } from '@services/theme-service';
import { SpeechService } from '@services/speech.service';

const googleGenAI = new GoogleGenerativeAI(environment.GEMINI_API_KEY);
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 800,
  responseMimeType: "text/plain",
};

const model = googleGenAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  ...generationConfig
});

@Component({
  selector: 'AVA-virtual-assistand-chat',
  standalone: true,
  imports: [ChatInputComponent, MatIconModule, NgClass, CommonModule],
  templateUrl: './virtual-assistand-chat.component.html',
  styleUrl: './virtual-assistand-chat.component.scss'
})
export class VirtualAssistandChatComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('scrollChat') private scrollChat!: ElementRef<HTMLElement>;
  appTexts = AppTexts;
  errorMessages = ErrorMessages;
  TypeAIChatBots = TypeAIChatBots;

  areaInformation: Area | null = null;
  private subscriptions: Subscription[] = [];

  chats: Chats[] = [];
  typeChats = TypeChats;
  public waitingAnswer: boolean = false;
  public clearInputChat = false;

  public waitingAnswerEmit = output<boolean>();
  public clearInputChatEmit = output<boolean>();
  public resetChat = input<string>();
  public typeAIChatBot = input<string>();
  public messageEmitter = input<MessageChat>();
  typeAIChatBotValue: string = '';

  public modeQueryFile = false;
  storedQueryFile: any = {};

  resultGeminiAI = signal('');
  private historyContextChat:  Chats[] = [];
  private markdownConverter = new Converter();

  isChatInputUnique$: Observable<boolean>;

  constructor(
    private themeService: ThemeService,
    private setAreaInformationService: SetAreaInformationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private virtualAssistandService: VirtualAssistandService,
    private cdref: ChangeDetectorRef,
    private elRef: ElementRef,
    private speechService: SpeechService
  ) {
    this.isChatInputUnique$ = this.themeService.isChatInputUnique.asObservable();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['resetChat'] && !this.waitingAnswer) {
      this.cleanChat();
    }
    if (changes['typeAIChatBot']) {
      this.typeAIChatBotValue = changes['typeAIChatBot'].currentValue;
    }
    if (changes['messageEmitter'] && changes['messageEmitter'].currentValue) {
      this.sendMessageEmitter(changes['messageEmitter'].currentValue);
    }
  }

  ngOnInit(): void {
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
  
  convertMarkdownToHtml(markdownText: string): string {
    return this.markdownConverter.makeHtml(markdownText);
  }

  autoScrollChatDown(): void {
    if (this.chats.length > 0 && this.scrollChat && this.scrollChat.nativeElement) {
      try {
        this.scrollChat.nativeElement.scrollTop = this.scrollChat.nativeElement.scrollHeight;
      } catch (error) {
        console.error('Error in autoScrollChatDown:', error);
      }
    }
  }

  private setChat(type: TypeChat, messageChat: MessageChat, timeResponseAPI?: string) {
    const newMessageChat = { ...messageChat };

    this.chats.push({
      type,
      messageChat: newMessageChat,
      timeResponseAPI
    });

    this.showHeaderTitle(true);
    setTimeout(() => {
      this.autoScrollChatDown();
    }, 100);
  }

  public sendMessageEmitter(messageChat: MessageChat) {
    const newMessageChat = { ...messageChat };
  
    if (!newMessageChat.validationMessage) {
      if (newMessageChat.text.length > 0) {
        this.setChat(TypeChats.User, newMessageChat);
  
        this.clearInputChat = !this.clearInputChat;
        this.clearInputChatEmit.emit(this.clearInputChat);
        this.waitingAnswer = true;
        this.waitingAnswerEmit.emit(this.waitingAnswer);
  
        if (this.modeQueryFile && !messageChat.file) {
          newMessageChat.documentName = this.storedQueryFile.documentName;
          newMessageChat.file = this.storedQueryFile.file;
          newMessageChat.fileUrl = this.storedQueryFile.fileUrl;
        }
  
        this.responseVirtualAssistand(newMessageChat);
  
      } else {
        newMessageChat.text = ErrorMessages.ChatMessageRequiredError;
        newMessageChat.validationMessage = ErrorMessages.ChatMessageRequiredError;
        this.setChat(TypeChats.VirtualAssistant, { ...newMessageChat });
      }
  
    } else {
      newMessageChat.text = newMessageChat.validationMessage;
      this.setChat(TypeChats.VirtualAssistant, { ...newMessageChat });
    }
  }

  public responseVirtualAssistand(messageChat: MessageChat) {
    if (this.areaInformation) {
      const file = messageChat.file;

      if (this.areaInformation.dataBase) {
        if (file) {
          this.modeQueryFile = true;
          this.storedQueryFile = this.storedQueryFile || {};
          this.storedQueryFile.documentName = messageChat.documentName;
          this.storedQueryFile.file = messageChat.file;
          this.storedQueryFile.fileUrl = messageChat.fileUrl;
          this.queryChatPdfMode(messageChat);
        } else {
          this.modeQueryFile = false;

          switch (this.typeAIChatBotValue) {
            case TypeAIChatBots.Gemini:
              this.googleGeminiAiQuery(messageChat); // Angular
              // this.rustGoogleGeminiAiQuery(messageChat); // Rust
              break;
            case TypeAIChatBots.Gpt:
              this.azureGpt4oAiQuery(messageChat);
              break;
            case TypeAIChatBots.Claude:
              this.awsClaudeAiQuery(messageChat);
              break;
            default:
              this.googleGeminiAiQuery(messageChat);
              break;
          }
        }
      } else {
        if (file) {
          this.modeQueryFile = true;
          this.storedQueryFile = this.storedQueryFile || {};
          this.storedQueryFile.documentName = messageChat.documentName;
          this.storedQueryFile.file = messageChat.file;
          this.storedQueryFile.fileUrl = messageChat.fileUrl;
          this.queryChatPdfMode(messageChat);
        } else {
          this.waitingAnswer = false;
          this.waitingAnswerEmit.emit(this.waitingAnswer);
          messageChat.text = ErrorMessages.AreaFileRequiredMessage;
          messageChat.validationMessage = ErrorMessages.AreaFileRequiredMessage;
          this.setChat(TypeChats.VirtualAssistant, { ...messageChat });
        }
      }

    } else {
      this.messageHttpErrorResponse(messageChat);
    }
  }

  private queryChatPdfMode (messageChat: MessageChat): void {
    const file = messageChat.file;
    if (file) {
      const params = this.setParamsChatService(messageChat)
  
      this.virtualAssistandService.uploadPdf(file, params).subscribe({
        next: (response) => {
          messageChat.text = response.answer;
          this.setChat(TypeChats.VirtualAssistant, { ...messageChat });
          this.waitingAnswer = false;
          this.waitingAnswerEmit.emit(this.waitingAnswer);
        },
        error: (error) => {
          console.error('queryChatPdfMode', error);
          this.messageHttpErrorResponse(messageChat);
          this.waitingAnswer = false;
          this.waitingAnswerEmit.emit(this.waitingAnswer);
        }
      }); 
    }
  }

  async googleGeminiAiQuery(messageChat: MessageChat) {
    // Agrega el nuevo mensaje del usuario al historial
    this.historyContextChat.push({ type: TypeChats.User, messageChat: { ...messageChat } });
    // Combina el historial en un solo prompt para mantener el contexto
    const historyPrompt = this.historyContextChat.map(entry => entry.messageChat.text).join('\n') + `\n${messageChat.text}`;
  
    const startTime = new Date().getTime();
    try {
      const resultGeminiAI = await model.generateContent(historyPrompt);

      const response = resultGeminiAI.response.text();
      this.resultGeminiAI.set(response);
      messageChat.text = this.resultGeminiAI();
      this.setChat(TypeChats.VirtualAssistant, { ...messageChat }, this.getTimeResponseAPI(startTime));
      this.waitingAnswer = false;
      this.waitingAnswerEmit.emit(this.waitingAnswer);
  
      // Agrega la respuesta del asistente al historial
      const messageResponse = new MessageChat();
      messageResponse.text = response;
      this.historyContextChat.push({ type: TypeChats.VirtualAssistant, messageChat: { ...messageResponse } });
      
    } catch (error) {
      console.error('googleGeminiAiQuery', error);
      this.messageHttpErrorResponse(messageChat, this.getTimeResponseAPI(startTime));
      this.waitingAnswer = false;
      this.waitingAnswerEmit.emit(this.waitingAnswer);
    }
  }

  rustGoogleGeminiAiQuery(messageChat: any): void {
    // Agrega el nuevo mensaje del usuario al historial
    this.historyContextChat.push({ type: TypeChats.User, messageChat: { ...messageChat } });
    // Combina el historial en un solo prompt para mantener el contexto
    const historyPrompt = this.historyContextChat.map(entry => entry.messageChat.text).join('\n') + `\n${messageChat.text}`;

    const startTime = new Date().getTime();
    this.virtualAssistandService.getRustGoogleGeminiAiQuery(historyPrompt).subscribe({
      next: (resultado) => {
        const respuesta = resultado.text;
        messageChat.text = respuesta;
        this.setChat(TypeChats.VirtualAssistant, { ...messageChat }, this.getTimeResponseAPI(startTime));
        this.waitingAnswer = false;
        this.waitingAnswerEmit.emit(this.waitingAnswer);
    
        // Agrega la respuesta del asistente al historial
        const messageResponse = new MessageChat();
        messageResponse.text = respuesta;
        this.historyContextChat.push({ type: TypeChats.VirtualAssistant, messageChat: { ...messageResponse } });
      },
      error: (error) => {
        console.error('rustGoogleGeminiAiQuery', error);
        this.messageHttpErrorResponse(messageChat, this.getTimeResponseAPI(startTime));
        this.waitingAnswer = false;
        this.waitingAnswerEmit.emit(this.waitingAnswer);
      }
    });
  }

  azureGpt4oAiQuery(messageChat: any) {
    // Agrega el nuevo mensaje del usuario al historial
    this.historyContextChat.push({ type: TypeChats.User, messageChat: { ...messageChat } });
    // Combina el historial en un solo prompt para mantener el contexto
    const historyPrompt = this.historyContextChat.map(entry => entry.messageChat.text).join('\n') + `\n${messageChat.text}`;

    const startTime = new Date().getTime();
    this.virtualAssistandService.getAzureGpt4oResponse(historyPrompt).subscribe({
      next: (response) => {
        const content = response.choices[0]?.message?.content;
  
        if (content) {
          try {
            // Intentar convertir el contenido a JSON si parece un objeto JSON
            const parsedContent = JSON.parse(content);
  
            messageChat.text = parsedContent.Descripcion;
          } catch {
            // Si no es un JSON, simplemente usar el texto como está
            messageChat.text = content;
          }
          this.setChat(TypeChats.VirtualAssistant, { ...messageChat }, this.getTimeResponseAPI(startTime));

          // Agrega la respuesta del asistente al historial
          const messageResponse = new MessageChat();
          messageResponse.text = messageChat.text;
          this.historyContextChat.push({ type: TypeChats.VirtualAssistant, messageChat: { ...messageResponse } });
        } else {
          console.error('azureGpt4oAiQuery: No se encontró contenido en la respuesta');
          this.messageHttpErrorResponse(messageChat, this.getTimeResponseAPI(startTime));
        }
  
        this.waitingAnswer = false;
        this.waitingAnswerEmit.emit(this.waitingAnswer);
      },
      error: (error) => {
        console.error('azureGpt4oAiQuery', error);
        this.messageHttpErrorResponse(messageChat, this.getTimeResponseAPI(startTime));
        this.waitingAnswer = false;
        this.waitingAnswerEmit.emit(this.waitingAnswer);
      }
    });
  }

  awsClaudeAiQuery(messageChat: MessageChat) {
    // Agrega el nuevo mensaje del usuario al historial
    this.historyContextChat.push({ type: TypeChats.User, messageChat: { ...messageChat } });
  
    // Construye el prompt usando el historial de mensajes
    const historyPrompt = this.historyContextChat
      .map(entry => `${entry.type === TypeChats.User ? '\n\nHuman' : '\n\nAssistant'}:${entry.messageChat.text}`)
      .join() + `\n\nHuman:${messageChat.text}\n\nAssistant:`;
  
    const startTime = new Date().getTime();
    this.virtualAssistandService.getAwsClaudeResponse(historyPrompt).subscribe({
      next: (resultado) => {
        const respuesta = resultado.message;
  
        messageChat.text = respuesta;
        this.setChat(TypeChats.VirtualAssistant, { ...messageChat }, this.getTimeResponseAPI(startTime));
        this.waitingAnswer = false;
        this.waitingAnswerEmit.emit(this.waitingAnswer);

        // Agrega la respuesta del asistente al historial
        const messageResponse = new MessageChat();
        messageResponse.text = respuesta;

        this.historyContextChat.push({ type: TypeChats.VirtualAssistant, messageChat: { ...messageResponse } });
      },
      error: (error) => {
        console.error('awsClaudeAiQuery', error);
        this.messageHttpErrorResponse(messageChat, this.getTimeResponseAPI(startTime));
        this.waitingAnswer = false;
        this.waitingAnswerEmit.emit(this.waitingAnswer);
      }
    });
  }

  setParamsChatService(messageChat: MessageChat): ParamsChatService {
    if (this.areaInformation) {
      return {
        prompt_user: messageChat.text,
        query_prompt_template: this.areaInformation.query_prompt_template,
        temperature: this.areaInformation.temperature,
        max_tokens: this.areaInformation.max_tokens,
        max_context: this.areaInformation.max_context,
        chunk_size: this.areaInformation.chunk_size,
        chunk_overlap: this.areaInformation.chunk_overlap,
        valor_area: this.areaInformation.valor_area
      };
    } else {
      return new ParamsChatService();
    }
  }

  public fileIsImage(fileUrl: string | ArrayBuffer | null): boolean {
    return typeof fileUrl === 'string' && fileUrl.startsWith('data:image/');
  }
  
  public fileIsOtherType(fileUrl: string | ArrayBuffer | null): boolean {
    return typeof fileUrl === 'string' && !fileUrl.startsWith('data:image/');
  }

  cleanChat(): void {
    this.chats = [];
    this.historyContextChat = [];
    this.showHeaderTitle(false);
    this.modeQueryFile = false;
    this.storedQueryFile = {};
    timer(100).subscribe(n => {
      if (this.areaInformation) {
        this.setAreaInformationService.setAreaTheme(this.areaInformation); 
      }
    });
  }

  showHeaderTitle(show: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      const titleElement = document.querySelector('.title') as Element;
      show ? titleElement.classList.remove('d-none') : titleElement.classList.add('d-none');
    }
  }

  messageHttpErrorResponse(messageChat : MessageChat, timeResponseAPI?: string): void {
    messageChat.text = this.errorMessages.HttpErrorResponse;
    this.setChat(TypeChats.VirtualAssistant, { ...messageChat }, timeResponseAPI);
  }

  getTimeResponseAPI(startTime: any): string {
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    return `Tiempo: ${duration} ms (${(duration / 1000).toFixed(2)} seconds)`;
  }

  speakText(texto: string) {
    this.speechService.speak(texto);
  }

  stopSpeaking() {
    this.speechService.stop();
  }

}
