import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, AlertController } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlarmService } from '../../services/alarm.service';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonContent, RouterModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  alarmService = inject(AlarmService);

  get activo(): boolean {
    return this.alarmService.isActive;
  }

  constructor() { }

  ngOnInit() {
    // Inicializar el servicio de alarma
  }

  ngOnDestroy() {
    // Asegurar que la alarma se desactive al salir del componente
    if (this.alarmService.isActive) {
      this.alarmService.deactivateAlarm();
    }
  }

  async toggleAlarma() {
    if (this.alarmService.isActive) {
      // Mostrar prompt de contraseña para desactivar
      const canDeactivate = await this.alarmService.showPasswordPrompt();
      if (canDeactivate) {
        await this.alarmService.deactivateAlarm();
      }
    } else {
      // Activar alarma
      await this.alarmService.activateAlarm();
    }
  }

  logout() {
    // Desactivar alarma antes de cerrar sesión
    if (this.alarmService.isActive) {
      this.alarmService.deactivateAlarm();
    }
    this.auth.cerrarSesion();
  }
}