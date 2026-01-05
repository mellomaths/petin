import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-about',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="about">
      <app-header></app-header>
      <main class="about__main">
        <div class="about__container">
          <h1>About Petin</h1>
          <p>
            Petin is dedicated to fighting against pet abandonment and helping
            pets find loving homes through adoption.
          </p>
        </div>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styleUrl: './about.component.css',
})
export class AboutComponent {}

