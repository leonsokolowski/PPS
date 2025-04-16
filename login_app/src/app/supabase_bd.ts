import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://byzbhahjyouroclvnnrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5emJoYWhqeW91cm9jbHZubnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjQyMzYsImV4cCI6MjA1OTc0MDIzNn0.WvufmiiBrPraaW5MX1dc6s3m-iYzRm96mdR0wQ5QUMw';

@Injectable
({
    providedIn: 'root',
})

export class SupabaseService
{
    private supabase: SupabaseClient;

    constructor() 
    {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async iniciarSesion(email: string, password: string) 
    {
        return await this.supabase.auth.signInWithPassword({ email, password });
    }

    async registrar(email: string, password: string) {
        return await this.supabase.auth.signUp({ email, password });
    }

    async cerrarSesion() 
    {
        return await this.supabase.auth.signOut();
    }

    async obtenerUsuario() {
        return await this.supabase.auth.getUser();
    }
}