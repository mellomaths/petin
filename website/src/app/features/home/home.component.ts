import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturesComponent } from './components/features/features.component';
import { DownloadComponent } from './components/download/download.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    HeaderComponent,
    FooterComponent,
    HeroComponent,
    FeaturesComponent,
    DownloadComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}

