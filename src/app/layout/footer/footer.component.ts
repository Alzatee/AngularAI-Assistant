import { Component } from '@angular/core';
import { AppTexts } from '@core/models/enums/app-text';

@Component({
  selector: 'AVA-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  appTexts = AppTexts;
  currentYear = new Date().getFullYear();
}
