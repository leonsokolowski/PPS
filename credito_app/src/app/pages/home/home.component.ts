import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IonText } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,IonContent,IonButton,IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  creditos: number = 0;
  mensaje: string = '';
  billetes = Array(10);
  constructor() { }

  logout()
  {
    this.auth.cerrarSesion();
  }
  ngOnInit() {
  }

  
  escanearQR() {
    // Usar Capacitor BarcodeScanner o Ionic Native QRScanner
    // Simular QR leído: const codigo = 'ABC123';
    // Consultar si el código existe en la base y si ya fue cargado por el usuario.
    // Según perfil y repeticiones, permitir o no acumular créditos.
    // Actualizar `mensaje` y `creditos`
  }

  limpiarCreditos() {
    // Llamar a backend para borrar los créditos del usuario.
    // Reiniciar creditos y mostrar mensaje.
  }

}


