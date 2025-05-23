import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

// Interface para tipado más flexible
interface PasswordData {
  contraseña: string;
  [key: string]: any; // Permitir propiedades adicionales
}

@Injectable({
  providedIn: 'root'
})
export class DesactivarService {
  sb = inject(SupabaseService);
  auth = inject(AuthService);
  
  constructor() { }

  async obtenerContraseña(): Promise<any> {
    console.log('🔍 DESACTIVAR SERVICE: Obteniendo contraseña...');
    console.log('🔍 Usuario actual:', this.auth.usuario_actual?.email);
    
    try {
      // Primero intentemos obtener toda la fila para ver qué columnas existen
      const { data: allData, error: allError } = await this.sb.supabase
        .from("usuarios_alarma")
        .select("*")
        .eq("usuario", this.auth.usuario_actual?.email)
        .single();

      console.log('🔍 Respuesta completa de Supabase:');
      console.log('  - data completa:', allData);
      console.log('  - error:', allError);
      console.log('  - tipo de data:', typeof allData);

      if (allError) {
        console.error("❌ Error al obtener datos completos:", allError.message);
        console.error("❌ Código de error:", allError.code);
        console.error("❌ Detalles del error:", allError.details);
        return null;
      }

      if (!allData) {
        console.error("❌ No se encontraron datos para el usuario:", this.auth.usuario_actual);
        return null;
      }

      console.log('✅ Datos obtenidos exitosamente');
      console.log('✅ Columnas disponibles:', Object.keys(allData));
      console.log('✅ Estructura completa:', JSON.stringify(allData));
      
      // Intentar diferentes nombres de columna posibles
      const possiblePasswordFields = ['contraseña', 'contrasena', 'password', 'clave', 'pass'];
      
      for (const field of possiblePasswordFields) {
        if (allData[field] !== undefined) {
          console.log(`✅ Contraseña encontrada en campo: "${field}"`);
          console.log(`✅ Valor: "${allData[field]}"`);
          return { contraseña: allData[field] };
        }
      }
      
      console.error('❌ No se encontró ningún campo de contraseña válido');
      console.error('❌ Campos disponibles:', Object.keys(allData));
      return null;
      
    } catch (error) {
      console.error('💥 Error inesperado al obtener contraseña:', error);
      return null;
    }
  }
}