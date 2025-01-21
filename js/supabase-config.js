import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabaseUrl = 'https://mahxuheilluaijhvztkm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1haHh1aGVpbGx1YWlqaHZ6dGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0ODgzMjAsImV4cCI6MjA1MzA2NDMyMH0.2LSBkTL-KzAr-gtG63H6QPzvWqbX7GhxKkNdjB1MeEI'

export const supabase = createClient(supabaseUrl, supabaseKey)
