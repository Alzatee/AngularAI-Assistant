import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    if (isPlatformBrowser(this.platformId)) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
      if (!this.voices.length) {
        this.synth.onvoiceschanged = () => {
          this.voices = this.synth?.getVoices() || [];
        };
      }
    }
  }

  speak(text: string, voiceName: string = 'Google Español') {
    if (this.synth && !this.synth.speaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedVoice = this.voices.find(voice => voice.name === voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      this.synth.speak(utterance);
    }
  }

  stop() {
    if (this.synth?.speaking) {
      this.synth.cancel();
    }
  }

  getVoices() {
    return this.voices;
  }
}