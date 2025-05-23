import { Injectable, inject } from '@angular/core';
import { Motion } from '@capacitor/motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { DesactivarService } from './desactivar.service';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {
  private desactivarService = inject(DesactivarService);
  private alertController = inject(AlertController);
  private flashlight = inject(Flashlight);
  
  public isActive = false;
  private motionListener: any;
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private flashlightTimeout: any;
  private vibrationTimeout: any;
  
  // Estados de orientación
  private currentOrientation: 'horizontal' | 'vertical' | 'left' | 'right' = 'horizontal';
  private orientationThreshold = 6; // Threshold para detectar cambios significativos

  constructor() {
    // Ya no necesitamos inicializar permisos específicamente
  }

  async activateAlarm() {
    this.isActive = true;
    await this.startMotionDetection();
  }

  async deactivateAlarm() {
    this.isActive = false;
    this.stopMotionDetection();
    this.stopAllEffects();
  }

  private async startMotionDetection() {
    try {
      this.motionListener = await Motion.addListener('accel', (event) => {
        if (!this.isActive) return;
        
        const { x, y, z } = event.acceleration;
        this.detectOrientation(x, y, z);
      });
    } catch (error) {
      console.error('Error starting motion detection:', error);
    }
  }

  private stopMotionDetection() {
    if (this.motionListener) {
      this.motionListener.remove();
      this.motionListener = null;
    }
  }

  private detectOrientation(x: number, y: number, z: number) {
    let newOrientation: 'horizontal' | 'vertical' | 'left' | 'right';
    
    // Detectar orientación basada en aceleración
    if (Math.abs(z) > this.orientationThreshold) {
      // Dispositivo horizontal (sobre mesa)
      newOrientation = 'horizontal';
    } else if (Math.abs(y) > this.orientationThreshold) {
      // Dispositivo vertical
      newOrientation = 'vertical';
    } else if (x > this.orientationThreshold) {
      // Inclinado hacia la derecha
      newOrientation = 'right';
    } else if (x < -this.orientationThreshold) {
      // Inclinado hacia la izquierda
      newOrientation = 'left';
    } else {
      return; // No hay cambio significativo
    }

    // Solo actuar si hay un cambio de orientación
    if (newOrientation !== this.currentOrientation) {
      this.currentOrientation = newOrientation;
      this.triggerAlarmByOrientation(newOrientation);
    }
  }

  private async triggerAlarmByOrientation(orientation: 'horizontal' | 'vertical' | 'left' | 'right') {
    switch (orientation) {
      case 'left':
        await this.playSound('assets/sonidos/izquierda.mp3');
        break;
      case 'right':
        await this.playSound('assets/sonidos/derecha.mp3');
        break;
      case 'vertical':
        await this.turnOnFlashlight();
        await this.playSound('assets/sonidos/vertical.mp3');
        break;
      case 'horizontal':
        await this.vibrate();
        await this.playSound('assets/sonidos/horizontal.mp3');
        break;
    }
  }

  private async playSound(soundPath: string) {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    try {
      this.currentAudio = new Audio(soundPath);
      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
      };
      
      this.currentAudio.onerror = () => {
        console.error('Error loading audio file:', soundPath);
        this.isPlaying = false;
        this.currentAudio = null;
      };
      
      await this.currentAudio.play();
    } catch (error) {
      console.error('Error playing sound:', error);
      this.isPlaying = false;
    }
  }

  private async turnOnFlashlight() {
    try {
      // Verificar si la linterna está disponible
      const isAvailable = await this.flashlight.available();
      if (!isAvailable) {
        console.error('Flashlight not available on this device');
        return;
      }

      // Encender la linterna
      await this.flashlight.switchOn();

      // Programar apagar después de 5 segundos
      this.flashlightTimeout = setTimeout(async () => {
        await this.turnOffFlashlight();
      }, 5000);
    } catch (error) {
      console.error('Error turning on flashlight:', error);
    }
  }

  private async turnOffFlashlight() {
    try {
      await this.flashlight.switchOff();
      if (this.flashlightTimeout) {
        clearTimeout(this.flashlightTimeout);
        this.flashlightTimeout = null;
      }
    } catch (error) {
      console.error('Error turning off flashlight:', error);
    }
  }

  private async vibrate() {
    try {
      // Vibrar por 5 segundos
      await Haptics.impact({ style: ImpactStyle.Heavy });
      
      // Continuar vibrando por 5 segundos
      let vibrationCount = 0;
      const maxVibrations = 10; // 5 segundos con vibraciones cada 500ms
      
      const vibrationInterval = setInterval(async () => {
        if (vibrationCount >= maxVibrations || !this.isActive) {
          clearInterval(vibrationInterval);
          return;
        }
        
        await Haptics.impact({ style: ImpactStyle.Heavy });
        vibrationCount++;
      }, 500);
      
    } catch (error) {
      console.error('Error vibrating:', error);
    }
  }

  async showPasswordPrompt(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: 'Desactivar Alarma',
        message: 'Ingrese la contraseña para desactivar la alarma:',
        inputs: [
          {
            name: 'password',
            type: 'password',
            placeholder: 'Contraseña'
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              this.triggerFailureAlarm();
              resolve(false);
            }
          },
          {
            text: 'OK',
            handler: async (data) => {
              const isValid = await this.validatePassword(data.password);
              if (isValid) {
                resolve(true);
              } else {
                this.triggerFailureAlarm();
                resolve(false);
              }
            }
          }
        ]
      });

      await alert.present();
    });
  }

  private async validatePassword(inputPassword: string): Promise<boolean> {
    try {
      const storedPassword = await this.desactivarService.obtenerContraseña();
      return storedPassword === inputPassword;
    } catch (error) {
      console.error('Error validating password:', error);
      return false;
    }
  }

  private async triggerFailureAlarm() {
    // Reproducir sonido de fallo, vibrar y encender luz por 5 segundos
    this.playSound('assets/sonidos/fallo.mp3');
    this.vibrate();
    this.turnOnFlashlight();
  }

  private async stopAllEffects() {
    // Detener audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
      this.isPlaying = false;
    }

    // Limpiar timeouts
    if (this.flashlightTimeout) {
      clearTimeout(this.flashlightTimeout);
      this.flashlightTimeout = null;
    }

    if (this.vibrationTimeout) {
      clearTimeout(this.vibrationTimeout);
      this.vibrationTimeout = null;
    }

    // Asegurar que la linterna esté apagada
    try {
      await this.flashlight.switchOff();
    } catch (error) {
      console.error('Error turning off flashlight in cleanup:', error);
    }
  }
}