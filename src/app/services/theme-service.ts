import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnDestroy {
  private theme: 'light' | 'dark' | 'system' = 'system';
  private themeApplied$ = new BehaviorSubject<boolean>(false);
  private currentTheme$ = new BehaviorSubject<'light' | 'dark' | 'system'>('system');

  public isChatInputUnique = new BehaviorSubject<boolean>(true);
  
  private mediaQueryListener?: () => void;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadTheme();
    this.initSystemThemeDetection();
    this.isChatInputUnique = new BehaviorSubject<boolean>(this.isDesktopDevice());
  }

  private isDesktopDevice(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !(/Mobi|Android/i.test(navigator.userAgent));
    }
    return false;
  }

  private loadTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      this.theme = savedTheme ?? this.detectSystemTheme();
      this.currentTheme$.next(this.theme);
      this.applyTheme();
    }
  }

  private applyTheme() {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.remove('light-theme', 'dark-theme');
      
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else if (this.theme === 'light') {
        document.documentElement.classList.add('light-theme');
      } else if (this.theme === 'system') {
        this.applySystemTheme();
      }
      
      this.themeApplied$.next(true);
    }
  }

  private detectSystemTheme(): 'light' | 'dark' {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private applySystemTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark-theme', prefersDark);
      document.documentElement.classList.toggle('light-theme', !prefersDark);
    }
  }

  private initSystemThemeDetection() {
    if (isPlatformBrowser(this.platformId)) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = () => {
        if (this.theme === 'system') {
          this.applySystemTheme();
        }
      };
      mediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  getThemeAppliedObservable() {
    return this.themeApplied$.asObservable();
  }

  getCurrentThemeObservable() {
    return this.currentTheme$.asObservable();
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    if (isPlatformBrowser(this.platformId)) {
      this.theme = theme;
      localStorage.setItem('theme', theme);
      this.currentTheme$.next(theme);
      this.applyTheme();
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId) && this.mediaQueryListener) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.removeEventListener('change', this.mediaQueryListener);
    }
  }
}