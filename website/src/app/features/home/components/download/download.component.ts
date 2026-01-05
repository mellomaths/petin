import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { TranslatePipe } from '../../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-download',
  imports: [CommonModule, NgOptimizedImage, TranslatePipe],
  templateUrl: './download.component.html',
  styleUrl: './download.component.css',
})
export class DownloadComponent {}

