import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = "https://jnkjjcglzfpyqkpvjcsl.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impua2pqY2dsemZweXFrcHZqY3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzYxMDUsImV4cCI6MjA4NzM1MjEwNX0.jegaE6rLWOu47bsjsyJGu2yH-6GGWMjBSxm08gj6_qY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
