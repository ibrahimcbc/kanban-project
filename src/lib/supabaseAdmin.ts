import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env.local içinde tanımlı olmalı"
  );
}

// Sadece server tarafında (API route'ları) kullanılır — RLS'i bypass eder.
// integration_tokens gibi anon key ile erişilemeyen tablolar için gerekli.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
