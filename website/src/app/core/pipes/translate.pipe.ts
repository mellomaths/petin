import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Not pure because we need to react to language and translation changes
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string): string {
    // Access the computed signal that depends on both language and translations
    // This ensures the pipe re-evaluates when either changes
    this.languageService.translationKey();
    
    return this.languageService.translate(key);
  }
}
