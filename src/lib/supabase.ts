import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export type Conversation = {
  id: string | number;
  number: string | null;
  user_message: string | null;
  ai_response: string | null;
  intent: string | null;
  status: string | null;
  created_at: string;
};
