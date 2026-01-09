import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://drtzpsoalftjqyogysot.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydHpwc29hbGZ0anF5b2d5c290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTMyOTUsImV4cCI6MjA4MzUyOTI5NX0.tZRzZba5o8zTVMes1vnOsRI59xXA_ZfWvsae8DwLZfQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
