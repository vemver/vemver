import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bwyqesogduegtoookdhu.supabase.co";

const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eXFlc29nZHVlZ3Rvb29rZGh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNDI1NjEsImV4cCI6MjA5NDYxODU2MX0.yKQXvGO2Y1KKiucdNBKSeP4KI0k-cPvaeUUp_aL4MXg";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);