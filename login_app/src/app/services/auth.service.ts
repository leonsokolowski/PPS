import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  sb = inject(SupabaseService)
  router = inject(Router)
  usuarioActual : User | null = null;
  constructor() { }

  async iniciarSesion(email: string, password: string) 
  {
      return await this.sb.supabase.auth.signInWithPassword({ email, password });
  }

  async registrar(email: string, password: string) {
      return await this.sb.supabase.auth.signUp({ email, password });
  }

  async cerrarSesion() 
  {
      return await this.sb.supabase.auth.signOut();
  }

  async obtenerUsuario() {
      return await this.sb.supabase.auth.getUser();
  }
}
