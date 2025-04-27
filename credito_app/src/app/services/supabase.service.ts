import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kqahuxhqqjcrxpelpbqe.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxYWh1eGhxcWpjcnhwZWxwYnFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMzc5MjgsImV4cCI6MjA1OTkxMzkyOH0.gRMoL-B1Zs8fUW7MWb82UVvEBO2gpOve5or7DKc6V4g';

@Injectable
({
    providedIn: 'root',
})

export class SupabaseService
{
    supabase : SupabaseClient<any, "public", any>;
    constructor() 
    {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }
}