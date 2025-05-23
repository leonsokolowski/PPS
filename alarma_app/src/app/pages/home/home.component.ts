import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, AlertController } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlarmService } from '../../services/alarm.service';
import { PasswordModalComponent } from '../password-modal/password-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonContent, RouterModule, PasswordModalComponent]
})
export class HomeComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  alarmService = inject(AlarmService);

  @ViewChild(PasswordModalComponent) passwordModal!: PasswordModalComponent;

  showPasswordModal = false;
  modalAction: 'deactivate' | 'logout' = 'deactivate'; // Nuevo: para saber qué acción ejecutar

  get activo(): boolean {
    return this.alarmService.isActive;
  }

  constructor() { }

  async ngOnInit() {
    // Asegurar que la alarma se active automáticamente al iniciar sesión
    console.log('🔥 === INICIANDO HOME COMPONENT ===');
    console.log('🔥 Estado inicial de la alarma:', this.alarmService.isActive);
    
    try {
      // Siempre activar la alarma, independientemente del estado actual
      await this.alarmService.activateAlarm();
      console.log('🔥 Alarma activada automáticamente al iniciar sesión');
      console.log('🔥 Estado final de la alarma:', this.alarmService.isActive);
    } catch (error) {
      console.error('❌ Error activando alarma automáticamente:', error);
    }
    
    // Pequeño delay para asegurar que la UI se actualice
    setTimeout(() => {
      console.log('🔥 Estado de la alarma después del delay:', this.alarmService.isActive);
      
      // Si por alguna razón la alarma no está activa, forzar activación
      if (!this.alarmService.isActive) {
        console.log('⚠️ La alarma no está activa, forzando activación...');
        this.alarmService.forceActivation();
        console.log('⚠️ Estado después de forzar:', this.alarmService.isActive);
      }
    }, 500);
  }

  ngOnDestroy() {
    // Asegurar que la alarma se desactive al salir del componente
    if (this.alarmService.isActive) {
      this.alarmService.deactivateAlarm();
    }
  }

  async toggleAlarma() {
    if (this.alarmService.isActive) {
      // Mostrar modal de contraseña para desactivar
      this.modalAction = 'deactivate';
      this.showPasswordModal = true;
    } else {
      // Activar alarma
      await this.alarmService.activateAlarm();
    }
  }

  async onPasswordSubmitted(password: string) {
    const isValid = await this.alarmService.validatePassword(password);
    
    if (isValid) {
      this.showPasswordModal = false;
      
      // Ejecutar la acción correspondiente según el contexto
      if (this.modalAction === 'deactivate') {
        await this.alarmService.deactivateAlarm();
        console.log('✅ Alarma desactivada correctamente');
      } else if (this.modalAction === 'logout') {
        // Desactivar alarma antes de cerrar sesión
        if (this.alarmService.isActive) {
          await this.alarmService.deactivateAlarm();
        }
        this.auth.cerrarSesion();
        console.log('✅ Cerrando sesión correctamente');
      }
      
      this.passwordModal.reset();
    } else {
      this.passwordModal.showErrorMessage();
      await this.alarmService.triggerFailureAlarm();
      console.log('❌ Contraseña incorrecta - Activando alarma de fallo');
    }
  }

  onPasswordCancelled() {
    this.showPasswordModal = false;
    this.passwordModal.reset();
    // Activar alarma de fallo por cancelar
    this.alarmService.triggerFailureAlarm();
    console.log('❌ Acción cancelada - Activando alarma de fallo');
  }

  logout() {
    // Mostrar modal de contraseña para cerrar sesión
    this.modalAction = 'logout';
    this.showPasswordModal = true;
    console.log('🔐 Solicitando contraseña para cerrar sesión');
  }
}