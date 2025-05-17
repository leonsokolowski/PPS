import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonContent]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);

  idioma: string = 'es';
  tema: string = 'colores';
  grillaActual: any[] = [];
  audioPlayer: HTMLAudioElement = new Audio();

  temas: any = {
    colores: [
      { imagen: 'assets/home/rojo.png', traducciones: { es: 'Rojo', en: 'Red', pt: 'Vermelho' } },
      { imagen: 'assets/home/azul.png', traducciones: { es: 'Azul', en: 'Blue', pt: 'Azul' } },
      { imagen: 'assets/home/verde.png', traducciones: { es: 'Verde', en: 'Green', pt: 'Verde' } },
      { imagen: 'assets/home/amarillo.png', traducciones: { es: 'Amarillo', en: 'Yellow', pt: 'Amarelo' } },
      { imagen: 'assets/home/naranja.png', traducciones: { es: 'Naranja', en: 'Orange', pt: 'Laranja' } },
      { imagen: 'assets/home/violeta.png', traducciones: { es: 'Violeta', en: 'Purple', pt: 'Roxo' } }
    ],
    numeros: [
      { imagen: 'assets/home/uno.png', traducciones: { es: 'Uno', en: 'One', pt: 'Um' } },
      { imagen: 'assets/home/dos.png', traducciones: { es: 'Dos', en: 'Two', pt: 'Dois' } },
      { imagen: 'assets/home/tres.png', traducciones: { es: 'Tres', en: 'Three', pt: 'Três' } },
      { imagen: 'assets/home/cuatro.png', traducciones: { es: 'Cuatro', en: 'Four', pt: 'Quatro' } },
      { imagen: 'assets/home/cinco.png', traducciones: { es: 'Cinco', en: 'Five', pt: 'Cinco' } },
      { imagen: 'assets/home/seis.png', traducciones: { es: 'Seis', en: 'Six', pt: 'Seis' } }
    ],
    animales: [
      { imagen: 'assets/home/perro.png', traducciones: { es: 'Perro', en: 'Dog', pt: 'Cachorro' } },
      { imagen: 'assets/home/gato.png', traducciones: { es: 'Gato', en: 'Cat', pt: 'Gato' } },
      { imagen: 'assets/home/vaca.png', traducciones: { es: 'Vaca', en: 'Cow', pt: 'Vaca' } },
      { imagen: 'assets/home/leon.png', traducciones: { es: 'Pato', en: 'Duck', pt: 'Pato' } },
      { imagen: 'assets/home/elefante.png', traducciones: { es: 'Caballo', en: 'Horse', pt: 'Cavalo' } },
      { imagen: 'assets/home/mono.png', traducciones: { es: 'Oveja', en: 'Sheep', pt: 'Ovelha' } }
    ]
  };

  constructor() {}

  ngOnInit() {
    this.actualizarGrilla();
  }

  logout() {
    this.auth.cerrarSesion();
  }

  cambiarIdioma(idioma: string) {
    this.idioma = idioma;
  }

  cambiarTema(tema: string) {
    this.tema = tema;
    this.actualizarGrilla();
  }

  actualizarGrilla() {
    this.grillaActual = this.temas[this.tema];
  }

  reproducirSonido(item: any) {
    const palabra = item.traducciones[this.idioma].toLowerCase();
    const rutaAudio = `assets/sounds/${this.idioma}/${this.tema}/${palabra}.mp3`;
    
    // Detener cualquier reproducción anterior
    this.audioPlayer.pause();
    this.audioPlayer.currentTime = 0;
    
    // Configurar la nueva fuente de audio
    this.audioPlayer.src = rutaAudio;
    
    // Reproducir el sonido
    this.audioPlayer.play().catch(error => {
      console.error('Error al reproducir el audio:', error);
    });
  }
}