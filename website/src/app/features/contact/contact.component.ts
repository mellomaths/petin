import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="contact">
      <app-header></app-header>
      <main class="contact__main">
        <div class="contact__container">
          <h1>Contact Us</h1>
          <p>Get in touch with the Petin team</p>
        </div>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styleUrl: './contact.component.css',
})
export class ContactComponent {}

