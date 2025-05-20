import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton, IonIcon, IonHeader, IonToolbar, IonTitle, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MemoService, Carta } from '../../services/memo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent]
})
export class HomeComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  memoService = inject(MemoService);
  router = inject(Router);

  mostrarMenuPrincipal = true;
  nivelActual: 'facil' | 'medio' | 'dificil' | null = null;
  cartas: Carta[] = [];
  tiempoTranscurrido = 0;
  timerInterval: any;
  juegoTerminado = false;
  
  // Variables para el manejo de los turnos
  cartaSeleccionada: Carta | null = null;
  bloquearTablero = false;
  
  constructor() { }

  ngOnInit() {}

  ngOnDestroy() {
    this.detenerTimer();
  }

  iniciarJuego(nivel: 'facil' | 'medio' | 'dificil') {
    this.nivelActual = nivel;
    this.mostrarMenuPrincipal = false;
    this.juegoTerminado = false;
    this.tiempoTranscurrido = 0;
    this.cartas = this.memoService.generarCartas(nivel);
    
    // Iniciamos el temporizador
    this.iniciarTimer();
  }

  volverAlMenu() {
    this.detenerTimer();
    this.mostrarMenuPrincipal = true;
    this.nivelActual = null;
    this.cartas = [];
    this.juegoTerminado = false;
  }

  iniciarTimer() {
    this.detenerTimer(); // Por si acaso hay un timer activo
    this.tiempoTranscurrido = 0;
    this.timerInterval = setInterval(() => {
      this.tiempoTranscurrido++;
    }, 1000);
  }

  detenerTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  seleccionarCarta(carta: Carta) {
    // Si el tablero está bloqueado o la carta ya está descubierta o emparejada, no hacemos nada
    if (this.bloquearTablero || carta.descubierta || carta.emparejada) {
      return;
    }

    // Volteamos la carta
    carta.descubierta = true;

    // Si es la primera carta seleccionada
    if (!this.cartaSeleccionada) {
      this.cartaSeleccionada = carta;
      return;
    }

    // Si es la segunda carta, comparamos
    if (this.cartaSeleccionada.imagen === carta.imagen) {
      // Emparejamiento correcto
      this.cartaSeleccionada.emparejada = true;
      carta.emparejada = true;
      this.cartaSeleccionada = null;
      
      // Verificamos si todas las cartas están emparejadas
      if (this.cartas.every(c => c.emparejada)) {
        this.finalizarJuego();
      }
    } else {
      // Emparejamiento incorrecto, bloqueamos el tablero brevemente
      this.bloquearTablero = true;
      
      setTimeout(() => {
        this.cartaSeleccionada!.descubierta = false;
        carta.descubierta = false;
        this.cartaSeleccionada = null;
        this.bloquearTablero = false;
      }, 1000);
    }
  }

  async finalizarJuego() {
    this.detenerTimer();
    this.juegoTerminado = true;
    
    // Guardamos el resultado en la base de datos
    const usuario = await this.auth.obtenerUsuario();
    
    if (usuario.data.user && this.nivelActual) {
      await this.memoService.guardarPartida({
        email: usuario.data.user.email || 'anonimo@ejemplo.com',
        nivel: this.nivelActual,
        tiempo_segundos: this.tiempoTranscurrido,
        fecha: new Date().toISOString()
      });
    }
  }

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segsRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segsRestantes.toString().padStart(2, '0')}`;
  }

  verRanking() {
    this.router.navigateByUrl('/ranking');
  }

  logout() {
    this.auth.cerrarSesion();
  }
}