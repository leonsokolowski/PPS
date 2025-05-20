import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MemoService, Partida } from '../../services/memo.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, 
    IonContent, IonSegment, IonSegmentButton, IonLabel]
})
export class RankingComponent implements OnInit {
  memoService = inject(MemoService);
  router = inject(Router);
  
  nivelSeleccionado: 'facil' | 'medio' | 'dificil' = 'facil';
  mejoresTiempos: Partida[] = [];
  cargando = false;

  constructor() { }

  ngOnInit() {
    this.cargarRanking('facil');
  }

  cambiarNivel(event: any) {
    const nivel = event.detail.value as 'facil' | 'medio' | 'dificil';
    this.nivelSeleccionado = nivel;
    this.cargarRanking(nivel);
  }

  async cargarRanking(nivel: 'facil' | 'medio' | 'dificil') {
    this.cargando = true;
    try {
      const respuesta = await this.memoService.obtenerMejoresTiempos(nivel);
      if (respuesta.data) {
        this.mejoresTiempos = respuesta.data;
      }
    } catch (error) {
      console.error('Error al cargar el ranking:', error);
    } finally {
      this.cargando = false;
    }
  }

  volverAlMenu() {
    this.router.navigateByUrl('/home');
  }

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segsRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, '0')}:${segsRestantes.toString().padStart(2, '0')}`;
  }

  formatearFecha(fechaIso: string): string {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  obtenerUsuarioDelEmail(email: string): string {
  return email.split('@')[0];
  }
}