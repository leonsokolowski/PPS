import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,IonContent, IonItem, IonLabel,IonInput,IonButton,IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule]
})
export class LoginComponent implements OnInit {

  auth = inject(AuthService);
  admin_email:string = "";
  admin_password:string = "";

  formLogin = new FormGroup({
    'email': new FormControl("", [Validators.required, Validators.email]),
    'password': new FormControl("", [Validators.required, Validators.minLength(8)])})
  
  errorMessage: string = ""
  constructor(private router: Router) {}

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

  accesoRapido(id:number)
  {
    switch(id)
    {
      case 0:
        this.admin_email = "";
        this.admin_password = "";
        break
      case 1:
        this.admin_email = "admin1@gmail.com";
        this.admin_password = "admin1password";
        break
      case 2:
        this.admin_email = "admin2@gmail.com";
        this.admin_password = "admin2password";
        break
      case 3:
        this.admin_email = "admin3@gmail.com";
        this.admin_password = "admin3password";
        break
    }
  }

  ngOnInit() {
  }

}
