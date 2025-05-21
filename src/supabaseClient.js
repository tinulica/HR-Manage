// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fxvuvhnprzrtdbizziab.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4dnV2aG5wcnpydGRiaXp6aWFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMTc1NjgsImV4cCI6MjA2Mjg5MzU2OH0.MU0YJhY6qQD2GFoiAqB8LHg1PHGg_NXNZRXP3FwBxXA'

export const supabase = createClient(supabaseUrl, supabaseKey)
