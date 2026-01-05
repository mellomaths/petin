import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LanguageService, type Language } from '../../../core/services/language.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  host: {
    '[class.sticky]': 'true',
  },
})
export class HeaderComponent {
  private languageService = inject(LanguageService);

  isMenuOpen = false;
  isLanguageDropdownOpen = false;
  currentLanguage = this.languageService.currentLanguage;
  languageInfo = this.languageService.languageInfo;
  allLanguages = this.languageService.getAllLanguagesInfo();

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  toggleLanguageDropdown() {
    this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
  }

  closeLanguageDropdown() {
    this.isLanguageDropdownOpen = false;
  }

  selectLanguage(lang: Language) {
    this.languageService.setLanguage(lang);
    this.closeLanguageDropdown();
    this.closeMenu(); // Also close mobile menu if open
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.header__language-dropdown')) {
      this.closeLanguageDropdown();
    }
  }
}

