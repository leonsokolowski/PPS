import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent} from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,IonContent,RouterModule]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);

  activo: boolean = false;

  constructor() { }

  ngOnInit() { }

  toggleAlarma() {
    this.activo = !this.activo;
  }

  logout() {
    this.auth.cerrarSesion();
  }
}
