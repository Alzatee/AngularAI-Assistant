import { Component } from '@angular/core';
import { ErrorMessages } from '@core/models/enums/error-messages';

@Component({
  selector: 'AVA-not-found-page',
  standalone: true,
  imports: [],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss'
})
export class NotFoundPageComponent {
  errorMessages = ErrorMessages;
}
