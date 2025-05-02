import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,IonContent, RouterModule]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  idioma: string = 'es';
  tema: string = 'colores';

  constructor() { }

  logout()
  {
    this.auth.cerrarSesion();
  }

  ngOnInit() {
  }

  cambiarIdioma(idioma: string) {
    this.idioma = idioma;
    console.log(`Idioma cambiado a: ${idioma}`);
  }

  cambiarTema(tema: string) {
    this.tema = tema;
    console.log(`Tema cambiado a: ${tema}`);
  }

}