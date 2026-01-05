import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export type Language = 'en' | 'pt' | 'es';

interface Translations {
  [key: string]: string | Translations;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly STORAGE_KEY = 'petin_language';
  private readonly DEFAULT_LANGUAGE: Language = 'en';
  private readonly SUPPORTED_LANGUAGES: Language[] = ['en', 'pt', 'es'];

  // Current language signal
  private readonly _currentLanguage = signal<Language>(this.getInitialLanguage());
  readonly currentLanguage = this._currentLanguage.asReadonly();

  // Translations signal
  private readonly _translations = signal<Translations>({});
  readonly translations = this._translations.asReadonly();
  
  // Computed signal that combines language and translations for reactivity
  readonly translationKey = computed(() => {
    // This computed depends on both language and translations
    // When either changes, this computed will update
    const lang = this._currentLanguage();
    const trans = this._translations();
    return { lang, trans };
  });

  // Language label for display
  readonly languageLabel = computed(() => {
    const lang = this.currentLanguage();
    return lang.toUpperCase();
  });

  // Language info with flag and name
  readonly languageInfo = computed(() => {
    const lang = this.currentLanguage();
    return this.getLanguageInfo(lang);
  });

  /**
   * Get language information (flag and name)
   */
  getLanguageInfo(lang: Language): { flag: string; name: string; code: Language } {
    const languages: Record<Language, { flag: string; name: string }> = {
      en: { flag: '🇺🇸', name: 'English' },
      pt: { flag: '🇧🇷', name: 'Português' },
      es: { flag: '🇪🇸', name: 'Español' },
    };
    return { ...languages[lang], code: lang };
  }

  /**
   * Get all languages with their info
   */
  getAllLanguagesInfo(): Array<{ flag: string; name: string; code: Language }> {
    return this.SUPPORTED_LANGUAGES.map((lang) => this.getLanguageInfo(lang));
  }

  constructor(private http: HttpClient) {
    // Load translations when language changes
    effect(() => {
      const lang = this._currentLanguage();
      this.loadTranslations(lang);
    });
  }

  /**
   * Get initial language from browser preferences or storage
   */
  private getInitialLanguage(): Language {
    // Check localStorage first
    const stored = localStorage.getItem(this.STORAGE_KEY) as Language;
    if (stored && this.SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }

    // Detect browser language
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (this.SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
      return browserLang as Language;
    }

    // Fallback to default
    return this.DEFAULT_LANGUAGE;
  }

  /**
   * Load translations for the given language
   */
  private loadTranslations(lang: Language): void {
    // Clear translations first to trigger change detection
    this._translations.set({});
    
    this.http
      .get<Translations>(`assets/i18n/${lang}.json`)
      .pipe(
        catchError(() => {
          // Fallback to English if translation file fails to load
          if (lang !== 'en') {
            return this.http.get<Translations>('assets/i18n/en.json');
          }
          return of({});
        }),
      )
      .subscribe((translations) => {
        this._translations.set(translations);
      });
  }

  /**
   * Change the current language
   */
  setLanguage(lang: Language): void {
    if (this.SUPPORTED_LANGUAGES.includes(lang)) {
      this._currentLanguage.set(lang);
      localStorage.setItem(this.STORAGE_KEY, lang);
    }
  }

  /**
   * Get translation by key (supports nested keys like 'app.title')
   */
  translate(key: string): string {
    const translations = this.translations();
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages(): Language[] {
    return [...this.SUPPORTED_LANGUAGES];
  }

  /**
   * Cycle to next language
   */
  cycleLanguage(): void {
    const current = this.currentLanguage();
    const currentIndex = this.SUPPORTED_LANGUAGES.indexOf(current);
    const nextIndex = (currentIndex + 1) % this.SUPPORTED_LANGUAGES.length;
    this.setLanguage(this.SUPPORTED_LANGUAGES[nextIndex]);
  }
}

