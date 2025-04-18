import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonInput, IonButton, IonCard,IonCardContent, IonCardHeader, IonCardTitle} from '@ionic/angular/standalone';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule,IonContent, IonItem , IonLabel, IonInput,IonButton,IonCard, IonCardContent, IonCardHeader, IonCardTitle, RouterModule]
})
export class RegisterPage implements OnInit {
  auth = inject(AuthService);
  formRegister = new FormGroup({
    'email': new FormControl("", [Validators.required, Validators.email]),
    'password': new FormControl("", [Validators.required, Validators.minLength(8)]),
    'confirm_password': new FormControl("", [Validators.required, Validators.minLength(8)]),
  })
  
  errorMessage: string = ""
  constructor(private router: Router) {}

  async register()
  {
    this.errorMessage = ""; 

    var correo = String(this.formRegister.get("email")?.value); 
    var contraseña = String(this.formRegister.get("password")?.value);
    var confirmar_contraseña = String(this.formRegister.get("confirm_password")?.value);
    if(contraseña != confirmar_contraseña)
    {
      console.log(contraseña);
      console.log(confirmar_contraseña);
      this.errorMessage = "Contraseña y confirmación diferentes."
    }
    else
    {
      const {data, error}= await this.auth.registrar(correo, contraseña);
      if (error)
      {
        this.errorMessage = error.message.toUpperCase() || "Error al iniciar sesión.";
      }
      else
      {
        this.router.navigate(['/home']);
      }
    }
  }

  ngOnInit() {
  }

}
