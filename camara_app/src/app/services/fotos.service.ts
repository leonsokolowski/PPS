import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

export interface Foto {
  id: number;
  usuario_email: string;
  tipo: 'linda' | 'fea';
  imagen_url: string;
  votos: number;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class FotosService {
  private sb = inject(SupabaseService);
  private auth = inject(AuthService);

  constructor() { }

  /**
   * Sube una imagen al storage de Supabase
   * @param file - Archivo de imagen
   * @param tipo - 'linda' o 'fea'
   * @returns Promise con la URL de la imagen subida
   */
  async subirFoto(file: File, tipo: 'linda' | 'fea'): Promise<string> {
    try {
      // Generar nombre único para el archivo
      const timestamp = Date.now();
      const nombreArchivo = `${tipo}/${timestamp}_${file.name}`;

      // Subir archivo al storage
      const { data, error } = await this.sb.supabase.storage
        .from('fotos-edificio')
        .upload(nombreArchivo, file);

      if (error) {
        throw error;
      }

      // Obtener URL pública
      const { data: publicUrlData } = this.sb.supabase.storage
        .from('fotos-edificio')
        .getPublicUrl(nombreArchivo);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error al subir foto:', error);
      throw error;
    }
  }

  /**
   * Guarda los metadatos de la foto en la base de datos
   * @param imagenUrl - URL de la imagen
   * @param tipo - 'linda' o 'fea'
   * @returns Promise con los datos insertados
   */
  async guardarMetadataFoto(imagenUrl: string, tipo: 'linda' | 'fea'): Promise<Foto> {
    try {
      const usuarioEmail = this.auth.usuario_actual?.email;
      
      if (!usuarioEmail) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await this.sb.supabase
        .from('fotos')
        .insert({
          usuario_email: usuarioEmail,
          tipo: tipo,
          imagen_url: imagenUrl,
          votos: 0
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Foto;
    } catch (error) {
      console.error('Error al guardar metadata:', error);
      throw error;
    }
  }

  /**
   * Proceso completo: sube foto y guarda metadata
   * @param file - Archivo de imagen
   * @param tipo - 'linda' o 'fea'
   * @returns Promise con los datos de la foto guardada
   */
  async subirYGuardarFoto(file: File, tipo: 'linda' | 'fea'): Promise<Foto> {
    try {
      // Subir imagen
      const imagenUrl = await this.subirFoto(file, tipo);
      
      // Guardar metadata
      const foto = await this.guardarMetadataFoto(imagenUrl, tipo);
      
      return foto;
    } catch (error) {
      console.error('Error en proceso completo:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las fotos de un tipo específico ordenadas por fecha descendente
   * @param tipo - 'linda' o 'fea'
   * @returns Promise con array de fotos
   */
  async obtenerFotosPorTipo(tipo: 'linda' | 'fea'): Promise<Foto[]> {
    try {
      const { data, error } = await this.sb.supabase
        .from('fotos')
        .select('*')
        .eq('tipo', tipo)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw error;
      }

      return data as Foto[];
    } catch (error) {
      console.error('Error al obtener fotos:', error);
      throw error;
    }
  }

  /**
   * Vota por una foto (incrementa el contador de votos)
   * @param fotoId - ID de la foto
   * @returns Promise con la foto actualizada
   */
  async votarFoto(fotoId: number): Promise<Foto> {
    try {
      // Primero obtener los votos actuales
      const { data: fotoActual, error: errorGet } = await this.sb.supabase
        .from('fotos')
        .select('votos')
        .eq('id', fotoId)
        .single();

      if (errorGet) {
        throw errorGet;
      }

      // Incrementar votos
      const nuevosVotos = (fotoActual.votos || 0) + 1;

      // Actualizar en la base de datos
      const { data, error } = await this.sb.supabase
        .from('fotos')
        .update({ votos: nuevosVotos })
        .eq('id', fotoId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Foto;
    } catch (error) {
      console.error('Error al votar foto:', error);
      throw error;
    }
  }

  /**
   * Obtiene las fotos más votadas para gráficos
   * @param tipo - 'linda' o 'fea'
   * @param limite - Número máximo de fotos a retornar
   * @returns Promise con array de fotos ordenadas por votos
   */
  async obtenerFotosMasVotadas(tipo: 'linda' | 'fea', limite: number = 5): Promise<Foto[]> {
    try {
      const { data, error } = await this.sb.supabase
        .from('fotos')
        .select('*')
        .eq('tipo', tipo)
        .order('votos', { ascending: false })
        .limit(limite);

      if (error) {
        throw error;
      }

      return data as Foto[];
    } catch (error) {
      console.error('Error al obtener fotos más votadas:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas para gráficos
   * @param tipo - 'linda' o 'fea'
   * @returns Promise con datos para gráficos
   */
  async obtenerEstadisticasParaGraficos(tipo: 'linda' | 'fea'): Promise<{labels: string[], data: number[]}> {
    try {
      const fotos = await this.obtenerFotosMasVotadas(tipo, 10);
      
      const labels = fotos.map((foto, index) => `Foto ${index + 1}`);
      const data = fotos.map(foto => foto.votos);
      
      return { labels, data };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}
  