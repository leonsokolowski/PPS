import { Component, inject, NgModule, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/angular/standalone';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
// import { IonIcon } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,IonContent, RouterModule, RouterLink]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  constructor() { }

  logout()
  {
    this.auth.cerrarSesion();
  }
  ngOnInit() {
  }

}