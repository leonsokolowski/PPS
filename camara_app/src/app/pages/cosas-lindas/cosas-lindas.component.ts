import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  IonButton, 
  IonCard, 
  IonCardContent, 
  IonCardHeader, 
  IonCardTitle,
  IonIcon,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonText,
  IonSpinner,
  IonToast,
  IonBackButton,
  IonButtons
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FotosService, Foto } from '../../services/fotos.service';
import { addIcons } from 'ionicons';
import { camera, barChart, heart, heartOutline, arrowBack } from 'ionicons/icons';

@Component({
  selector: 'app-cosas-lindas',
  templateUrl: './cosas-lindas.component.html',
  styleUrls: ['./cosas-lindas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonText,
    IonSpinner,
    IonToast,
    IonBackButton,
    IonButtons
  ]
})
export class CosasLindasComponent implements OnInit {
  private fotosService = inject(FotosService);
  private router = inject(Router);

  fotos: Foto[] = [];
  cargando = false;
  subiendoFoto = false;
  mostrarToast = false;
  mensajeToast = '';
  fotosVotadas = new Set<number>(); // Para controlar un voto por foto

  constructor() {
    addIcons({ camera, barChart, heart, heartOutline, arrowBack });
  }

  ngOnInit() {
    this.cargarFotos();
  }

  async cargarFotos() {
    this.cargando = true;
    try {
      this.fotos = await this.fotosService.obtenerFotosPorTipo('linda');
    } catch (error) {
      console.error('Error al cargar fotos:', error);
      this.mostrarMensaje('Error al cargar las fotos');
    } finally {
      this.cargando = false;
    }
  }

  async tomarFoto() {
    try {
      this.subiendoFoto = true;
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        // Convertir dataUrl a File
        const response = await fetch(image.dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `linda_${Date.now()}.jpg`, { type: 'image/jpeg' });

        // Subir foto
        const nuevaFoto = await this.fotosService.subirYGuardarFoto(file, 'linda');
        
        // Agregar al inicio del array para mostrar inmediatamente
        this.fotos.unshift(nuevaFoto);
        
        this.mostrarMensaje('¡Foto subida exitosamente!');
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      this.mostrarMensaje('Error al subir la foto');
    } finally {
      this.subiendoFoto = false;
    }
  }

  async votarFoto(foto: Foto) {
    if (this.fotosVotadas.has(foto.id)) {
      this.mostrarMensaje('Ya votaste por esta foto');
      return;
    }

    try {
      const fotoActualizada = await this.fotosService.votarFoto(foto.id);
      
      // Actualizar la foto en el array
      const index = this.fotos.findIndex(f => f.id === foto.id);
      if (index !== -1) {
        this.fotos[index] = fotoActualizada;
      }
      
      // Marcar como votada
      this.fotosVotadas.add(foto.id);
      
      this.mostrarMensaje('¡Voto registrado!');
    } catch (error) {
      console.error('Error al votar:', error);
      this.mostrarMensaje('Error al registrar el voto');
    }
  }

  verGraficos() {
    this.router.navigate(['/grafico-lindas']);
  }

  volver() {
    this.router.navigate(['/home']);
  }

  private mostrarMensaje(mensaje: string) {
    this.mensajeToast = mensaje;
    this.mostrarToast = true;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerIniciales(email: string): string {
    return email.substring(0, 2).toUpperCase();
  }
}