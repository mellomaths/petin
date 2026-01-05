import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-features',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {
  features = [
    {
      icon: '🐾',
      titleKey: 'features.discovery.title',
      descriptionKey: 'features.discovery.description',
    },
    {
      icon: '💬',
      titleKey: 'features.communication.title',
      descriptionKey: 'features.communication.description',
    },
    {
      icon: '📍',
      titleKey: 'features.location.title',
      descriptionKey: 'features.location.description',
    },
    {
      icon: '❤️',
      titleKey: 'features.adoption.title',
      descriptionKey: 'features.adoption.description',
    },
  ];
}

