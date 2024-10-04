import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '@environments/environment';

@Component({
  selector: 'AVA-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  environment = `${environment.env}`;
}
