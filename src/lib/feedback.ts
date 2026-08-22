import { supabase } from "@/integrations/supabase/client";

export interface FeedbackInput {
  name: string;
  email: string;
  category: string;
  subject?: string;
  message: string;
}

export async function submitFeedback(input: FeedbackInput) {
  const { data: auth } = await supabase.auth.getUser();
  const { error } = await supabase.from("feedback").insert({
    user_id: auth.user?.id ?? null,
    name: input.name.trim(),
    email: input.email.trim(),
    category: input.category,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
  });
  if (error) throw error;
}
