import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DesactivarService {
  sb = inject(SupabaseService);
  auth = inject(AuthService);
  constructor() { }

  async obtenerContraseña(): Promise<string | null> {
  const { data, error } = await this.sb.supabase
    .from("usuarios_alarma")
    .select("contraseña")
    .eq("usuario", this.auth.usuario_actual)
    .single(); // Esperamos una sola fila

  if (error) {
    console.error("Error al obtener la contraseña:", error.message);
    return null;
  }

  return data ?? null;
}

}
