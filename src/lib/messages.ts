import { supabase } from "@/integrations/supabase/client";

export interface PrivateMessage {
  id: string;
  sender_id: string | null;
  receiver_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  sender?: {
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
  receiver?: {
    handle: string;
    display_name: string;
    avatar_url: string | null;
  };
}

export async function fetchMyMessages() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const { data, error } = await supabase
      .from("private_messages")
      .select(`
        id,
        sender_id,
        receiver_id,
        body,
        read_at,
        created_at,
        sender:profiles!sender_id(handle, display_name, avatar_url),
        receiver:profiles!receiver_id(handle, display_name, avatar_url)
      `)
      .or(`sender_id.eq.${auth.user.id},receiver_id.eq.${auth.user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchMyMessages error:", error);
      return [];
    }
    return (data || []) as unknown as PrivateMessage[];
  } catch (e) {
    console.warn("fetchMyMessages exception:", e);
    return [];
  }
}

export async function sendMessage(receiverId: string, body: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const { error } = await supabase.from("private_messages").insert({
    sender_id: auth.user.id,
    receiver_id: receiverId,
    body,
  });

  if (error) throw error;
}

export async function markAsRead(messageId: string) {
  const { error } = await supabase
    .from("private_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) throw error;
}

export async function fetchUnreadCount() {
  try {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return 0;

    const { count, error } = await supabase
      .from("private_messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", auth.user.id)
      .is("read_at", null);

    if (error) {
      console.warn("fetchUnreadCount error:", error);
      return 0;
    }
    return count ?? 0;
  } catch (e) {
    console.warn("fetchUnreadCount exception:", e);
    return 0;
  }
}
