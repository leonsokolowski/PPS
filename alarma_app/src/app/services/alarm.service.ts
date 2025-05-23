import { Injectable, inject } from '@angular/core';
import { Motion } from '@capacitor/motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Flashlight } from '@awesome-cordova-plugins/flashlight/ngx';
import { DesactivarService } from './desactivar.service';

// Interfaces para tipado
interface PasswordData {
  contraseña: string;
}

interface AccelerationData {
  x: number;
  y: number;
  z: number;
}

type OrientationType = 'horizontal' | 'vertical' | 'left' | 'right';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {
  private desactivarService = inject(DesactivarService);
  private flashlight = inject(Flashlight);
  
  public isActive = false;
  private motionListener: any;
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;
  private flashlightTimeout: NodeJS.Timeout | null = null;
  private vibrationInterval: NodeJS.Timeout | null = null;
  
  // Estados de orientación mejorados
  private currentOrientation: OrientationType = 'horizontal';
  private readonly orientationThreshold = 3.5; // Ajustado para mejor precisión
  private stabilityCounter = 0;
  private readonly requiredStability = 5; // Más frames para mayor estabilidad
  private lastTriggerTime = 0;
  private readonly minTriggerInterval = 1500; // Aumentado para evitar triggers excesivos

  constructor() {
    console.log('🔧 AlarmService constructor - Estado inicial:', this.isActive);
  }

  async activateAlarm(): Promise<void> {
    console.log('🔥 === ACTIVANDO ALARMA ===');
    console.log('🔥 Estado antes de activar:', this.isActive);
    
    try {
      this.isActive = true;
      console.log('🔥 isActive establecido a true');
      
      await this.startMotionDetection();
      console.log('🔥 Detección de movimiento iniciada');
      
      console.log('🔥 Estado final después de activar:', this.isActive);
      console.log('🔥 Alarma activada exitosamente');
    } catch (error) {
      console.error('❌ Error activando alarma:', error);
      // Asegurar que isActive esté en true incluso si hay error en motion detection
      this.isActive = true;
    }
  }

  async deactivateAlarm(): Promise<void> {
    console.log('🛑 === DESACTIVANDO ALARMA ===');
    console.log('🛑 Estado antes de desactivar:', this.isActive);
    
    this.isActive = false;
    this.stopMotionDetection();
    await this.stopAllEffects();
    
    console.log('🛑 Estado final después de desactivar:', this.isActive);
    console.log('🛑 Alarma desactivada');
  }

  private async startMotionDetection(): Promise<void> {
    try {
      console.log('📱 Iniciando detección de movimiento...');
      this.motionListener = await Motion.addListener('accel', (event) => {
        if (!this.isActive) return;
        
        const { x, y, z } = event.acceleration;
        this.detectOrientation({ x, y, z });
      });
      console.log('📱 Listener de movimiento agregado exitosamente');
    } catch (error) {
      console.error('❌ Error iniciando detección de movimiento:', error);
      // No lanzar el error para que no afecte la activación de la alarma
    }
  }

  private stopMotionDetection(): void {
    console.log('📱 Deteniendo detección de movimiento...');
    if (this.motionListener) {
      this.motionListener.remove();
      this.motionListener = null;
      console.log('📱 Listener de movimiento removido');
    }
  }

  private detectOrientation({ x, y, z }: AccelerationData): void {
    const newOrientation = this.calculateOrientation(x, y, z);
    
    if (!newOrientation) {
      this.stabilityCounter = 0;
      return;
    }

    if (newOrientation === this.currentOrientation) {
      this.stabilityCounter = 0;
      return;
    }

    this.stabilityCounter++;
    
    if (this.stabilityCounter >= this.requiredStability) {
      const currentTime = Date.now();
      
      if (currentTime - this.lastTriggerTime > this.minTriggerInterval) {
        this.currentOrientation = newOrientation;
        this.triggerAlarmByOrientation(newOrientation);
        this.lastTriggerTime = currentTime;
      }
      
      this.stabilityCounter = 0;
    }
  }

  private calculateOrientation(x: number, y: number, z: number): OrientationType | null {
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    const absZ = Math.abs(z);
    
    // Horizontal (dispositivo plano)
    if (absZ > absX && absZ > absY && absZ > this.orientationThreshold) {
      return 'horizontal';
    }
    
    // Vertical (dispositivo de pie)
    if (absY > absX && absY > absZ && absY > this.orientationThreshold) {
      return 'vertical';
    }
    
    // Izquierda/Derecha (dispositivo inclinado hacia los lados)
    if (absX > absY && absX > absZ && absX > this.orientationThreshold) {
      return x > 0 ? 'right' : 'left';
    }

    return null; // No hay cambio significativo
  }

  private async triggerAlarmByOrientation(orientation: OrientationType): Promise<void> {
    console.log(`🚨 Alarma disparada por orientación: ${orientation}`);
    
    const actions = {
      'left': () => this.playSound('assets/sonidos/izquierda.mp3'),
      'right': () => this.playSound('assets/sonidos/derecha.mp3'),
      'vertical': () => Promise.all([
        this.turnOnFlashlight(),
        this.playSound('assets/sonidos/vertical.mp3')
      ]),
      'horizontal': () => Promise.all([
        this.vibrate(),
        this.playSound('assets/sonidos/horizontal.mp3')
      ])
    };

    try {
      await actions[orientation]();
    } catch (error) {
      console.error(`Error ejecutando acción para orientación ${orientation}:`, error);
    }
  }

  private async playSound(soundPath: string): Promise<void> {
    if (this.isPlaying) {
      console.log('Ya se está reproduciendo un sonido');
      return;
    }
    
    this.isPlaying = true;
    
    try {
      // Detener audio anterior si existe
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      this.currentAudio = new Audio(soundPath);
      this.currentAudio.volume = 1.0;
      
      this.currentAudio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
      };
      
      this.currentAudio.onerror = (error) => {
        console.error(`Error cargando archivo de audio: ${soundPath}`, error);
        this.isPlaying = false;
        this.currentAudio = null;
      };
      
      await this.currentAudio.play();
    } catch (error) {
      console.error(`Error reproduciendo sonido: ${soundPath}`, error);
      this.isPlaying = false;
    }
  }

  private async turnOnFlashlight(): Promise<void> {
    try {
      const isAvailable = await this.flashlight.available();
      if (!isAvailable) {
        console.warn('Linterna no disponible en este dispositivo');
        return;
      }

      await this.flashlight.switchOn();
      console.log('💡 Linterna encendida');

      // Limpiar timeout anterior si existe
      if (this.flashlightTimeout) {
        clearTimeout(this.flashlightTimeout);
      }

      this.flashlightTimeout = setTimeout(async () => {
        await this.turnOffFlashlight();
      }, 5000);

    } catch (error) {
      console.error('Error encendiendo linterna:', error);
    }
  }

  private async turnOffFlashlight(): Promise<void> {
    try {
      await this.flashlight.switchOff();
      console.log('💡 Linterna apagada');
      
      if (this.flashlightTimeout) {
        clearTimeout(this.flashlightTimeout);
        this.flashlightTimeout = null;
      }
    } catch (error) {
      console.error('Error apagando linterna:', error);
    }
  }

  private async vibrate(): Promise<void> {
    try {
      console.log('📳 Iniciando vibración');
      
      // Vibración inicial
      await Haptics.impact({ style: ImpactStyle.Heavy });
      
      let vibrationCount = 0;
      const maxVibrations = 10; // 5 segundos a 500ms cada vibración
      
      // Limpiar intervalo anterior si existe
      if (this.vibrationInterval) {
        clearInterval(this.vibrationInterval);
      }

      this.vibrationInterval = setInterval(async () => {
        if (vibrationCount >= maxVibrations || !this.isActive) {
          if (this.vibrationInterval) {
            clearInterval(this.vibrationInterval);
            this.vibrationInterval = null;
          }
          console.log('📳 Vibración terminada');
          return;
        }
        
        try {
          await Haptics.impact({ style: ImpactStyle.Heavy });
          vibrationCount++;
        } catch (error) {
          console.error('Error en vibración:', error);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error iniciando vibración:', error);
    }
  }

  async validatePassword(inputPassword: string): Promise<boolean> {
    console.log('🔍 === INICIO VALIDACIÓN DE CONTRASEÑA ===');
    console.log('📝 Input password recibido:', `"${inputPassword}"`);
    console.log('📏 Longitud input password:', inputPassword?.length);
    
    if (!inputPassword || inputPassword.trim() === '') {
      console.warn('❌ Contraseña vacía proporcionada');
      return false;
    }

    try {
      console.log('🔄 Llamando a desactivarService.obtenerContraseña()...');
      const storedPasswordData = await this.desactivarService.obtenerContraseña();
      
      console.log('📦 Datos recibidos del servicio:', storedPasswordData);
      console.log('📦 Tipo de datos recibidos:', typeof storedPasswordData);
      console.log('📦 Datos serializados:', JSON.stringify(storedPasswordData));
      
      if (!storedPasswordData) {
        console.error('❌ No se pudo obtener la contraseña almacenada (datos nulos)');
        return false;
      }

      const storedPassword = this.extractPassword(storedPasswordData);
      console.log('🔑 Contraseña extraída:', `"${storedPassword}"`);
      console.log('📏 Longitud contraseña almacenada:', storedPassword?.length);
      
      if (!storedPassword) {
        console.error('❌ Contraseña almacenada no válida después de extracción');
        return false;
      }

      // Comparación detallada
      const inputTrimmed = inputPassword.trim();
      const storedTrimmed = storedPassword.trim();
      
      console.log('🔍 === COMPARACIÓN DETALLADA ===');
      console.log('✂️  Input trimmed:', `"${inputTrimmed}"`);
      console.log('✂️  Stored trimmed:', `"${storedTrimmed}"`);
      console.log('📏 Longitud input trimmed:', inputTrimmed.length);
      console.log('📏 Longitud stored trimmed:', storedTrimmed.length);
      console.log('🔤 Input en hexadecimal:', Array.from(inputTrimmed).map(c => c.charCodeAt(0).toString(16)).join(' '));
      console.log('🔤 Stored en hexadecimal:', Array.from(storedTrimmed).map(c => c.charCodeAt(0).toString(16)).join(' '));
      
      const isValid = storedTrimmed === inputTrimmed;
      console.log(`🎯 Resultado de comparación: ${isValid}`);
      console.log(`🔐 Validación de contraseña: ${isValid ? '✅ EXITOSA' : '❌ FALLIDA'}`);
      console.log('🔍 === FIN VALIDACIÓN DE CONTRASEÑA ===');
      
      return isValid;
      
    } catch (error) {
      console.error('💥 Error validando contraseña:', error);
      console.error('💥 Stack trace:', error instanceof Error ? error.stack : 'No stack available');
      return false;
    }
  }

  private extractPassword(passwordData: unknown): string | null {
    console.log('🔧 === EXTRACCIÓN DE CONTRASEÑA ===');
    console.log('🔧 Tipo de passwordData:', typeof passwordData);
    console.log('🔧 passwordData:', passwordData);
    
    // Manejo robusto de diferentes tipos de datos
    if (typeof passwordData === 'string') {
      console.log('✅ passwordData es string directo');
      return passwordData;
    }
    
    if (typeof passwordData === 'object' && passwordData !== null) {
      console.log('🔍 passwordData es objeto, explorando propiedades...');
      // Usar bracket notation para evitar errores de TypeScript
      const data = passwordData as Record<string, unknown>;
      
      // Mostrar todas las propiedades del objeto
      console.log('🗂️  Propiedades disponibles:', Object.keys(data));
      
      if (typeof data['contraseña'] === 'string') {
        console.log('✅ Encontrada propiedad "contraseña"');
        return data['contraseña'];
      }
      
      if (typeof data['password'] === 'string') {
        console.log('✅ Encontrada propiedad "password"');
        return data['password'];
      }
      
      // Buscar otras posibles propiedades
      for (const [key, value] of Object.entries(data)) {
        console.log(`🔍 Propiedad "${key}":`, typeof value, value);
        if (typeof value === 'string' && value.length > 0) {
          console.log(`⚠️  Posible contraseña en propiedad "${key}": "${value}"`);
        }
      }
    }
    
    console.log('❌ No se pudo extraer contraseña');
    return null;
  }

  async triggerFailureAlarm(): Promise<void> {
    console.log('🚨 ALARMA DE FALLO - Contraseña incorrecta');
    
    // Ejecutar todos los efectos simultáneamente por 5 segundos
    const failurePromises = [
      this.playSound('assets/sonidos/fallo.mp3'),
      this.vibrate(),
      this.turnOnFlashlight()
    ];

    try {
      await Promise.allSettled(failurePromises);
    } catch (error) {
      console.error('Error ejecutando alarma de fallo:', error);
    }
  }

  private async stopAllEffects(): Promise<void> {
    console.log('🛑 Deteniendo todos los efectos');

    // Detener audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.isPlaying = false;
    }

    // Limpiar timeouts e intervalos
    if (this.flashlightTimeout) {
      clearTimeout(this.flashlightTimeout);
      this.flashlightTimeout = null;
    }

    if (this.vibrationInterval) {
      clearInterval(this.vibrationInterval);
      this.vibrationInterval = null;
    }

    // Asegurar que la linterna esté apagada
    try {
      await this.flashlight.switchOff();
    } catch (error) {
      console.error('Error apagando linterna en limpieza:', error);
    }
  }

  // Método público para obtener el estado actual
  getAlarmStatus(): { 
    isActive: boolean; 
    currentOrientation: OrientationType; 
    isPlaying: boolean; 
  } {
    return {
      isActive: this.isActive,
      currentOrientation: this.currentOrientation,
      isPlaying: this.isPlaying
    };
  }

  // Método público para forzar la activación (útil para debugging)
  forceActivation(): void {
    console.log('🔧 FORZANDO ACTIVACIÓN DE ALARMA');
    this.isActive = true;
    console.log('🔧 Estado forzado:', this.isActive);
  }
}