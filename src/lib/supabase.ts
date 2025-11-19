import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qkxauxnpwbshsjbbonrt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGF1eG5wd2JzaHNqYmJvbnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NzU1NjIsImV4cCI6MjA3OTA1MTU2Mn0.-_D-BtttlVwQMuwaKERqQTj3PCZNu9_HOq-c091g_fs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
