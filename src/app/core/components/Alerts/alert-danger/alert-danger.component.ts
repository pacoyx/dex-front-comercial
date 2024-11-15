import { AfterViewInit, Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert-danger',
  standalone: true,
  imports: [],
  templateUrl: './alert-danger.component.html',
  styleUrl: './alert-danger.component.css'
})
export class AlertDangerComponent implements AfterViewInit{
  @Input() message!: string;
  @Input() timeShow!: number;

  bolShow = true;

constructor() { 
  
}
  ngAfterViewInit(): void {
    this.bolShow = true;
    setTimeout(() => {
      this.bolShow = false;
    }, this.timeShow);
  }



}
