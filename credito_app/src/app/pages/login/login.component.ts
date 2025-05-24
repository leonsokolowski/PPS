import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormBuilder, FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule} from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonLabel, IonItem } from '@ionic/angular/standalone';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonItem, IonLabel, CommonModule, FormsModule, ReactiveFormsModule,IonContent,IonInput,IonButton, RouterModule]
})
export class LoginComponent implements OnInit, OnDestroy {

  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  
  admin_email: string = "";
  admin_password: string = "";
  isSubmitting: boolean = false;
  loginForm: FormGroup;
  errorMessage: string = "";
  
  private routerSubscription?: Subscription;
  
  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9]).*$/)
      ]]
    });
  }

  ngOnInit() {
    // Limpiar formulario al inicializar el componente
    this.resetForm();
    
    // Suscribirse a los eventos de navegación para detectar cuando llegamos desde otras rutas
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Si llegamos al login desde cualquier otra ruta, limpiar el formulario
        if (event.url === '/login') {
          setTimeout(() => {
            this.resetForm();
          }, 100); // Pequeño delay para asegurar que el componente esté completamente cargado
        }
      });
  }

  ngOnDestroy() {
    // Limpiar la suscripción para evitar memory leaks
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  async login() {
    // Marcar todos los campos como tocados para mostrar validaciones al hacer click en login
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });

    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    
    try {
      const { data, error } = await this.auth.iniciarSesion(
        this.loginForm.value.email,
        this.loginForm.value.password
      );

      if (error) {
        // Personalización de mensajes de error en español
        if (error.message === 'Invalid login credentials') {
          this.errorMessage = 'Usuario no registrado o credenciales incorrectas';
        } else if (error.message.includes('rate limited')) {
          this.errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
        } else {
          this.errorMessage = 'Error al iniciar sesión';
        }
        console.error('Error de inicio de sesión:', error);
      }
    } catch (error: any) {
      this.errorMessage = 'Ha ocurrido un error al iniciar sesión';
      console.error('Error de inicio de sesión:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
    // Resetear el formulario reactivo
    this.loginForm.reset();
    
    // Limpiar también las variables del template (ngModel)
    this.admin_email = '';
    this.admin_password = '';
    
    // Limpiar mensaje de error
    this.errorMessage = '';
    
    // Limpiar el estado de los controles (untouched, pristine)
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsUntouched();
      control?.markAsPristine();
    });
  }

  accesoRapido(id: number) {
    switch(id) {
      case 1:
        this.loginForm.setValue({
          email: 'admin1@example.com',
          password: 'Administrador1'
        });
        // También actualizar las variables del template
        this.admin_email = 'admin1@example.com';
        this.admin_password = 'Administrador1';
        break;
      case 2:
        this.loginForm.setValue({
          email: 'admin2@example.com',
          password: 'Administrador2'
        });
        this.admin_email = 'admin2@example.com';
        this.admin_password = 'Administrador2';
        break;
      case 3:
        this.loginForm.setValue({
          email: 'admin3@example.com',
          password: 'Administrador3'
        });
        this.admin_email = 'admin3@example.com';
        this.admin_password = 'Administrador3';
        break;
    }

    // Marcar los campos como tocados para que no muestren errores con los datos precargados
    this.loginForm.get('email')?.markAsUntouched();
    this.loginForm.get('password')?.markAsUntouched();
  }

  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
}