import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'dex-front-comercial';


  constructor() {
    // console.log('environment.apiUrlBase', environment.apiUrlBase);
  }

}
// https://www.arunyadav.in/codehacks/blogs/post/19/create-an-angular-app-and-deploy-using-in-nginx-and-docker