import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/angular/standalone';
import { SupabaseService } from '../services/supabase.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel,IonInput,IonButton,IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule]
})
export class LoginPage implements OnInit {

  auth = inject(AuthService);

  formLogin = new FormGroup({
    'email': new FormControl("", [Validators.required, Validators.email]),
    'password': new FormControl("", [Validators.required, Validators.minLength(8)])})
  
  errorMessage: string = ""
  constructor(private supabase: SupabaseService, private router: Router) {}

  async login()
  {
    this.errorMessage = ""; 

    var correo = String(this.formLogin.get("email")?.value); 
    var contraseña = String(this.formLogin.get("password")?.value);
    const {data, error}= await this.auth.iniciarSesion(correo, contraseña);
    if (error)
    {
      this.errorMessage = error.message.toUpperCase() || "Error al iniciar sesión.";
    }
    else
    {
      this.router.navigate(['/home']);
    }
  }

  ngOnInit() {
  }

}
