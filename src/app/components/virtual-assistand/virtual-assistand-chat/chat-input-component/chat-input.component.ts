import { Component, ElementRef, input, output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxFileDropModule, NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';
import { MatIconModule } from '@angular/material/icon';
import { MessageChat } from '@core/models/class/message-chat';
import { environment } from '@environments/environment.development';
import { ErrorMessages } from '@core/models/enums/error-messages';
import { AppTexts } from '@core/models/enums/app-text';

@Component({
  selector: 'AVA-chat-input-component',
  standalone: true,
  imports: [FormsModule, NgxFileDropModule, MatIconModule],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss'
})
export class ChatInputComponent {
  @ViewChild('inputChatContainer', { static: false }) inputChatContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('txtTextarea', {static: true}) txtTextarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('fileInput', { static: true }) fileInput!: ElementRef<HTMLInputElement>;
  appTexts = AppTexts;

  public sendMessageEmitter = output<MessageChat>();
  public clearInputChat = input<boolean>();
  public waitingAnswer = input<boolean>();

  text: string = '';
  file: File | null = null;
  fileUrl: string | ArrayBuffer | null = null;
  isBlocked: boolean = false;
  messageChat: MessageChat = new MessageChat();

  allowedFileTypes: string[] = environment.allowedFileTypes;
  maxFileSizeMb = environment.maxFileSizeMb;
  maxFileSizeBytes = this.maxFileSizeMb * 1024 * 1024; // Convertir MB a bytes
  maxChatMessageLength = environment.maxChatMessageLength;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clearInputChat']) {
      this.clearInput();
    }
    if (changes['waitingAnswer']) {
      if (changes['waitingAnswer'].currentValue === true ) {
        this.blockContent();
        this.isBlocked = true;
      } else {
        this.unblockContent();
        this.isBlocked = false;
      }
    }
  }

  public sendMessage(text: string) {
    if (!this.isBlocked) {
      this.messageChat.text = text;
      
      this.messageChat.fileUrl = this.fileUrl; //B64
      this.messageChat.file = this.file; //File
      
      this.messageChat.documentName = this.file?.name.toString();
      this.messageChat.fileType = this.file?.type.toString();
      this.messageChat.validationMessage = null;
      this.sendMessageEmitter.emit(this.messageChat); 
    }
  }

  isAllowedFileType(file: File): boolean {
    return this.allowedFileTypes.includes(file.type);
  }

  isFileSizeValid(file: File): boolean {
    return file.size <= this.maxFileSizeBytes;
  }

  blockContent() {
    if (this.inputChatContainer) {
      this.inputChatContainer.nativeElement.classList.add('blocked');
    }
  }

  unblockContent() {
    if (this.inputChatContainer) {
      this.inputChatContainer.nativeElement.classList.remove('blocked');
    }
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (this.isAllowedFileType(file) && this.isFileSizeValid(file)) {
        this.readFile(file);
      } else if (!this.isAllowedFileType(file)) {
        this.messageChat.validationMessage = `${ErrorMessages.FileTypeNotAllowedError}, Los tipos de archivos permitidos son: <strong>(${environment.allowedFileTypes})</strong>`;
        this.sendMessageEmitter.emit(this.messageChat);
        this.removeFile();
      } else if (!this.isFileSizeValid(file)) {
        this.messageChat.validationMessage = `${ErrorMessages.FileMaxSizeExceededError}, el tamaño máximo permitido es de <strong>${environment.maxFileSizeMb}MB</strong>`;
        this.sendMessageEmitter.emit(this.messageChat);
        this.removeFile();
      }
    }
  }

  onFileDrop(entries: NgxFileDropEntry[]) {
    if (entries.length > 0) {
      const entry = entries[0];
      if (entry.fileEntry.isFile) {
        const fileEntry = entry.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (this.isAllowedFileType(file) && this.isFileSizeValid(file)) {
            this.readFile(file);
          } else if (!this.isAllowedFileType(file)) {
            this.messageChat.validationMessage = `${ErrorMessages.FileTypeNotAllowedError}, Los tipos de archivos permitidos son: <strong>(${environment.allowedFileTypes})</strong>`;
            this.sendMessageEmitter.emit(this.messageChat);
            this.removeFile();
          } else if (!this.isFileSizeValid(file)) {
            this.messageChat.validationMessage = `${ErrorMessages.FileMaxSizeExceededError}, el tamaño máximo permitido es de <strong>${environment.maxFileSizeMb}MB</strong>`;
            this.sendMessageEmitter.emit(this.messageChat);
            this.removeFile();
          }
        });
      } else {
        console.warn('El item arrastrado no es un archivo');
      }
    }
  }

  private readFile(file: File) {
    if (!this.isFileSizeValid(file)) {
      this.messageChat.validationMessage = `${ErrorMessages.FileMaxSizeExceededError}, el tamaño máximo permitido es de <strong>${environment.maxFileSizeMb}MB</strong>`;
      this.sendMessageEmitter.emit(this.messageChat);
      this.removeFile();
      return;
    }
  
    this.file = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.fileUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeFile() {
    this.file = null;
    this.fileUrl = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  fileOver(event: any) {
    console.log('File over', event);
  }

  fileLeave(event: any) {
    console.log('File leave', event);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.add('drag-over');
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('drag-over');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const target = event.target as HTMLElement;
    target.classList.remove('drag-over');
  
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (this.isAllowedFileType(file) && this.isFileSizeValid(file)) {
        this.readFile(file);
      } else if (!this.isAllowedFileType(file)) {
        this.messageChat.validationMessage = `${ErrorMessages.FileTypeNotAllowedError}, Los tipos de archivos permitidos son: <strong>(${environment.allowedFileTypes})</strong>`;
        this.sendMessageEmitter.emit(this.messageChat);
        this.removeFile();
      } else if (!this.isFileSizeValid(file)) {
        this.messageChat.validationMessage = `${ErrorMessages.FileMaxSizeExceededError}, el tamaño máximo permitido es de <strong>${environment.maxFileSizeMb}MB</strong>`;
        this.sendMessageEmitter.emit(this.messageChat);
        this.removeFile();
      }
    }
  }

  isImage(file: File | null): boolean {
    return file ? file.type.startsWith('image/') : false;
  }

  clearInput() {
    this.text = '';
    if (this.txtTextarea) {
      this.txtTextarea.nativeElement.value = '';
      this.txtTextarea.nativeElement.blur();
      this.adjustTextareaHeight(this.txtTextarea.nativeElement);
    }

    this.removeFile();
  }

  adjustTextareaHeight(textarea: HTMLTextAreaElement): void {
    textarea.style.height = '45px';
    
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
    
    if (textarea.scrollHeight > 200) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }

}
