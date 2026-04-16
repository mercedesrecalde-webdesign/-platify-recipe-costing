import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseAnonKey === 'TU_ANON_KEY_AQUI') {
    console.warn('Supabase credentials not fully configured. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
