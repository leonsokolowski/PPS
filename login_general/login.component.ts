import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  authError: string = '';
  isSubmitting: boolean = false;

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

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
    // Aseguramos que los campos estén vacíos al iniciar el componente
    this.resetForm();
  }

  async login() {
    if (this.loginForm.invalid) {
      // Marca todos los controles como tocados para mostrar los errores
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.authError = '';
    
    try {
      const { data, error } = await this.authService.iniciarSesion(
        this.loginForm.value.email,
        this.loginForm.value.password
      );

      if (error) {
        // Personalización de mensajes de error en español
        if (error.message === 'Invalid login credentials') {
          this.authError = 'Usuario no registrado o credenciales incorrectas';
        } else if (error.message.includes('rate limited')) {
          this.authError = 'Demasiados intentos fallidos. Intente más tarde';
        } else {
          this.authError = 'Error al iniciar sesión: ' + error.message;
        }
        console.error('Error de inicio de sesión:', error);
      }
    } catch (error: any) {
      this.authError = 'Ha ocurrido un error al iniciar sesión';
      console.error('Error de inicio de sesión:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  // Método para acceso rápido con credenciales predefinidas
  quickAccess(option: number) {
    switch(option) {
      case 1:
        this.loginForm.setValue({
          email: 'usuario1@ejemplo.com',
          password: 'Password1'
        });
        break;
      case 2:
        this.loginForm.setValue({
          email: 'usuario2@ejemplo.com',
          password: 'Password2'
        });
        break;
      case 3:
        this.loginForm.setValue({
          email: 'usuario3@ejemplo.com',
          password: 'Password3'
        });
        break;
    }
  }

  resetForm() {
    this.loginForm.reset();
    this.authError = '';
  }

  // Getters para facilitar la validación en la plantilla
  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
}