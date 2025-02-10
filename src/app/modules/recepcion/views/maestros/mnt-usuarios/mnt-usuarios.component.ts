import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mnt-usuarios',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './mnt-usuarios.component.html',
  styleUrl: './mnt-usuarios.component.css'
})
export class MntUsuariosComponent implements OnInit {
  
  ngOnInit(): void {  
  }

}
