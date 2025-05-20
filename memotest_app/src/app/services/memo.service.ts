import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface Carta {
  id: number;
  imagen: string;
  descubierta: boolean;
  emparejada: boolean;
}

export interface Partida {
  id?: string;
  email: string;
  nivel: 'facil' | 'medio' | 'dificil';
  tiempo_segundos: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemoService {
  sb = inject(SupabaseService);
  
  // Imágenes por nivel
  imagenesAnimales = [
    'assets/animales/perro.png',
    'assets/animales/gato.png',
    'assets/animales/pez.png'
  ];
  
  imagenesHerramientas = [
    'assets/herramientas/martillo.png',
    'assets/herramientas/destornillador.png',
    'assets/herramientas/llave.png',
    'assets/herramientas/sierra.png',
    'assets/herramientas/alicate.png'
  ];
  
  imagenesFrutas = [
    'assets/frutas/manzana.png',
    'assets/frutas/banana.png',
    'assets/frutas/naranja.png',
    'assets/frutas/pera.png',
    'assets/frutas/uva.png',
    'assets/frutas/frutilla.png',
    'assets/frutas/sandia.png',
    'assets/frutas/anana.png'
  ];

  constructor() { }

  // Genera las cartas según el nivel seleccionado
  generarCartas(nivel: 'facil' | 'medio' | 'dificil'): Carta[] {
    let imagenes: string[] = [];
    
    switch(nivel) {
      case 'facil':
        imagenes = this.imagenesAnimales;
        break;
      case 'medio':
        imagenes = this.imagenesHerramientas;
        break;
      case 'dificil':
        imagenes = this.imagenesFrutas;
        break;
    }
    
    // Duplicamos las imágenes para crear los pares
    const paresDeImagenes = [...imagenes, ...imagenes];
    
    // Mezclamos aleatoriamente
    paresDeImagenes.sort(() => Math.random() - 0.5);
    
    // Creamos el array de cartas
    return paresDeImagenes.map((imagen, index) => ({
      id: index,
      imagen,
      descubierta: false,
      emparejada: false
    }));
  }

  // Guarda una partida en la base de datos
  async guardarPartida(partida: Partida) {
    return await this.sb.supabase
      .from('resultados_memotest')
      .insert(partida);
  }

  // Obtiene los mejores 5 tiempos para un nivel específico
  async obtenerMejoresTiempos(nivel: 'facil' | 'medio' | 'dificil') {
    return await this.sb.supabase
      .from('resultados_memotest')
      .select('*')
      .eq('nivel', nivel)
      .order('tiempo_segundos', { ascending: true })
      .limit(5);
  }
}