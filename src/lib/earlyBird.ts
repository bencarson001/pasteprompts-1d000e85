import { db as supabase } from "@/lib/db";

export interface EarlyBirdStats {
  claimedCount: number;
  totalLimit: number;
  recipients: Array<{
    id: string;
    handle: string | null;
    display_name: string | null;
    avatar_url: string | null;
    subscription_period_end: string | null;
    created_at: string;
  }>;
}

export async function fetchEarlyBirdStats(): Promise<EarlyBirdStats> {
  try {
    const { data: recipients, error, count } = await supabase
      .from("profiles")
      .select("id, handle, display_name, avatar_url, subscription_period_end, created_at", { count: "exact" })
      .eq("early_bird_recipient", true);

    if (error) {
      console.warn("fetchEarlyBirdStats error:", error);
    }

    return {
      claimedCount: count || (recipients?.length || 0),
      totalLimit: 10,
      recipients: recipients || [],
    };
  } catch (err) {
    console.error("fetchEarlyBirdStats exception:", err);
    return { claimedCount: 0, totalLimit: 10, recipients: [] };
  }
}

export async function checkAndApplyEarlyBirdPromo(
  userId: string,
  userEmail?: string,
  displayName?: string
) {
  try {
    // Check if user already got early bird
    const { data: profile } = await supabase
      .from("profiles")
      .select("early_bird_recipient, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.early_bird_recipient) {
      return { applied: false, reason: "Already received early bird promo" };
    }

    // Check how many users have received early bird promo so far
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("early_bird_recipient", true);

    const currentClaimed = count || 0;
    if (currentClaimed >= 10) {
      return { applied: false, reason: "Early bird limit of 10 reached" };
    }

    // Attempt RPC grant_early_bird_promo
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      "grant_early_bird_promo",
      { target_user_id: userId }
    );

    if (!rpcError && rpcResult) {
      return { applied: true, data: rpcResult };
    }

    // Fallback: execute client-side transaction logic
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    const startDateFormatted = startDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const endDateFormatted = endDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    // 1. Update Profile
    await supabase
      .from("profiles")
      .update({
        membership_tier: "platinum",
        subscription_status: "active",
        subscription_period_end: endDate.toISOString(),
        is_creator: true,
        early_bird_recipient: true,
        early_bird_granted_at: new Date().toISOString(),
      } as Record<string, unknown>)
      .eq("id", userId);

    // 2. Insert into Subscriptions
    await supabase.from("subscriptions").upsert({
      user_id: userId,
      plan: "platinum",
      status: "active",
      current_period_end: endDate.toISOString(),
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>);

    // 3. Send Admin Private Message
    const msgBody = `🎉 CONGRATULATIONS & WELCOME TO PASTE PROMPTS! 🎉\n\nYou are one of our first 10 exclusive members! To celebrate your join date, you have been awarded 3 MONTHS OF FREE PLATINUM MEMBERSHIP and full CREATOR STATUS.\n\n📅 SUBSCRIPTION PERIOD:\n• Start Date: ${startDateFormatted}\n• Expiration Date: ${endDateFormatted}\n\n🌟 YOUR PLATINUM & CREATOR BENEFITS:\n1. 🔓 Unlimited Access to All Premium AI Prompts\n2. ⚡ Unrestricted Execution Sandbox & Advanced AI Generators\n3. 💰 Full Creator Privileges – Create, Publish, and Sell Your Own Prompts\n4. 🚀 Zero Ads & Priority Marketplace Exposure\n\nWe are thrilled to have you in our founding community! Please share Paste Prompts with your network using the social share buttons below.`;

    await supabase.from("private_messages").insert({
      receiver_id: userId,
      sender_id: null,
      body: msgBody,
      is_admin_system: true,
      metadata: {
        promo_type: "early_bird_platinum",
        start_date: startDateFormatted,
        end_date: endDateFormatted,
        social_share: true,
      },
    } as Record<string, unknown>);

    // 4. Queue Email from admin@pasteprompts.co.uk
    if (userEmail) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h1 style="color: #6366f1; text-align: center;">Welcome to Paste Prompts!</h1>
          <p style="font-size: 16px; color: #334155;">Hi <strong>${displayName || "Member"}</strong>,</p>
          <p style="font-size: 16px; color: #334155;">Congratulations! You are one of our founding members. We have automatically upgraded your account to a <strong>3-Month Free Platinum Membership</strong> and enabled <strong>Creator Privileges</strong>!</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">📅 Membership Details</h3>
            <p style="margin: 4px 0; color: #475569;"><strong>Start Date:</strong> ${startDateFormatted}</p>
            <p style="margin: 4px 0; color: #475569;"><strong>Expiration Date:</strong> ${endDateFormatted}</p>
          </div>
          <h3 style="color: #1e293b;">🌟 Platinum & Creator Benefits:</h3>
          <ul style="color: #475569; line-height: 1.6;">
            <li>🔓 <strong>Unlimited Access</strong> to all premium AI prompts & workflows</li>
            <li>⚡ <strong>Prompt Sandbox</strong> execution & generator tools</li>
            <li>💰 <strong>Creator Privileges</strong> – monetize and list your own prompt templates</li>
            <li>🛡️ <strong>Zero Ads</strong> & priority search indexing</li>
          </ul>
          <p style="font-size: 15px; color: #334155; margin-top: 25px;">Spread the word and invite fellow creators to join our growing prompt marketplace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://pasteprompts.co.uk" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Explore Paste Prompts</a>
          </div>
          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">Sent with ❤️ from admin@pasteprompts.co.uk</p>
        </div>
      `;

      await supabase.from("email_send_log").insert({
        recipient_email: userEmail,
        template_name: "early_bird_promo",
        status: "pending",
        metadata: {
          from_email: "admin@pasteprompts.co.uk",
          subject: "🎉 You unlocked 3 Months Free Platinum Membership on Paste Prompts!",
          body_html: emailHtml,
        },
      });
    }

    return { applied: true };
  } catch (err) {
    console.error("checkAndApplyEarlyBirdPromo exception:", err);
    return { applied: false, error: err };
  }
}

export async function grantEarlyBirdByUsernameOrEmail(
  input: string,
): Promise<{ applied: boolean; reason?: string; userName?: string; data?: unknown; error?: unknown }> {
  try {
    const queryTerm = input.trim().replace(/^@/, "");
    if (!queryTerm) {
      return { applied: false, reason: "Please enter a valid username, handle, or email." };
    }

    // Find profile matching handle, display_name, or exact ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, handle, display_name")
      .or(`handle.ilike.${queryTerm},display_name.ilike.${queryTerm},id.eq.${queryTerm}`)
      .maybeSingle();

    let targetUserId = profile?.id;
    let targetDisplayName = profile?.display_name || profile?.handle;
    const targetEmail = queryTerm.includes("@") ? queryTerm : undefined;

    if (!targetUserId) {
      // Partial match search
      const { data: matches } = await supabase
        .from("profiles")
        .select("id, handle, display_name")
        .or(`handle.ilike.%${queryTerm}%,display_name.ilike.%${queryTerm}%`)
        .limit(1);

      if (matches && matches.length > 0) {
        targetUserId = matches[0].id;
        targetDisplayName = matches[0].display_name || matches[0].handle;
      }
    }

    if (!targetUserId) {
      return {
        applied: false,
        reason: `No user account found matching "${input}". Please verify the username or ensure they signed up.`,
      };
    }

    const result = await checkAndApplyEarlyBirdPromo(
      targetUserId,
      targetEmail,
      targetDisplayName || undefined
    );

    return {
      ...result,
      userName: targetDisplayName || `@${queryTerm}`,
    };
  } catch (err) {
    const error = err as Error;
    console.error("grantEarlyBirdByUsernameOrEmail error:", error);
    return { applied: false, reason: error?.message || "Failed to grant promo slot." };
  }
}

