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
  usuario_actual : User | null = null;
  constructor() {
    //Saber si el usuario esta logeado o no
    this.sb.supabase.auth.onAuthStateChange((event, session) => {
      console.log(event, session);

      if (session === null) //Se cierra sesión o no hay sesion
      {
        this.usuario_actual = null;
        //redirigir al login
        this.router.navigateByUrl("/login");
      }else{ //si hay sesion
        this.usuario_actual = session.user;
        const currentUrl = this.router.url;

        if (currentUrl === '/login' || currentUrl === '/') {
          //redigir al home
          this.router.navigateByUrl("/home");
        }
      }
    });
   }

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
