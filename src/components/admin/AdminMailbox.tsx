import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db as supabase } from "@/lib/db";
import { fetchEarlyBirdStats, checkAndApplyEarlyBirdPromo, grantEarlyBirdByUsernameOrEmail } from "@/lib/earlyBird";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Mail,
  Send,
  Sparkles,
  Users,
  CheckCircle,
  Crown,
  Clock,
  RefreshCw,
  Gift,
  Inbox,
  Share2,
  UserPlus,
  Search,
} from "lucide-react";

export default function AdminMailbox() {
  const queryClient = useQueryClient();
  const [recipientUserId, setRecipientUserId] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [promoUsername, setPromoUsername] = useState("");
  const [isGrantingUsername, setIsGrantingUsername] = useState(false);
  const [subject, setSubject] = useState("🎉 Notice from Paste Prompts Admin");

  const [body, setBody] = useState("");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Fetch Early Bird Promo Stats
  const { data: earlyBird, isLoading: ebLoading, refetch: refetchEB } = useQuery({
    queryKey: ["admin-early-bird-stats"],
    queryFn: fetchEarlyBirdStats,
  });

  // Fetch All Users for quick selection
  const { data: usersList } = useQuery({
    queryKey: ["admin-users-mailbox"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, handle, display_name, avatar_url, membership_tier, is_creator, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // Fetch Outbox / Sent Admin Messages
  const { data: sentMessages, refetch: refetchSent } = useQuery({
    queryKey: ["admin-sent-messages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("private_messages")
        .select(`
          id,
          receiver_id,
          body,
          created_at,
          metadata,
          receiver:profiles!receiver_id(handle, display_name, avatar_url)
        `)
        .eq("is_admin_system", true)
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    },
  });

  // Fetch Email Queue Status
  const { data: emailQueue, refetch: refetchEmails } = useQuery({
    queryKey: ["admin-email-queue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_send_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      return data || [];
    },
  });

  // Grant Early Bird manually mutation
  const grantPromoMutation = useMutation({
    mutationFn: async (userId: string) => {
      const targetUser = usersList?.find((u) => u.id === userId);
      return await checkAndApplyEarlyBirdPromo(
        userId,
        targetEmail || undefined,
        targetUser?.display_name || undefined
      );
    },
    onSuccess: (res) => {
      if (res.applied) {
        toast({
          title: "Early Bird Granted!",
          description: "3 Months Platinum Membership + Creator Status granted & welcome message/email queued.",
        });
      } else {
        toast({
          title: "Notice",
          description: res.reason || "Could not grant early bird promo.",
        });
      }
      refetchEB();
      refetchSent();
      refetchEmails();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Claim Promo slot by typing Username / Email
  const handleClaimByUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoUsername.trim()) {
      toast({ title: "Input Required", description: "Please type a username, @handle, or email." });
      return;
    }
    setIsGrantingUsername(true);
    try {
      const res = await grantEarlyBirdByUsernameOrEmail(promoUsername);
      if (res.applied) {
        toast({
          title: "🎉 Promo Slot Claimed!",
          description: `Granted 3 Months Platinum & Creator status to ${res.userName || promoUsername}. Welcome message & email queued.`,
        });
        setPromoUsername("");
        refetchEB();
        refetchSent();
        refetchEmails();
        queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      } else {
        toast({
          title: "Could Not Grant Promo",
          description: res.reason || "Check username or promo availability.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const error = err as Error;
      toast({
        title: "Error",
        description: error.message || "Failed to grant promo slot.",
        variant: "destructive",
      });
    } finally {
      setIsGrantingUsername(false);
    }
  };


  // Send Direct Message / Email Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!body.trim()) throw new Error("Message body cannot be empty.");

      if (isBroadcasting) {
        // Broadcast to all listed users
        if (!usersList || usersList.length === 0) throw new Error("No users found to broadcast.");
        
        let sentCount = 0;
        for (const u of usersList) {
          if (sendInApp) {
            await supabase.from("private_messages").insert({
              receiver_id: u.id,
              body: body,
              is_admin_system: true,
              metadata: { broadcast: true, subject } as Record<string, unknown>,
            });
          }
          sentCount++;
        }
        return { count: sentCount, broadcast: true };
      } else {
        // Direct single message
        if (!recipientUserId && !targetEmail) {
          throw new Error("Please select a recipient user or enter a target email.");
        }

        if (recipientUserId && sendInApp) {
          await supabase.from("private_messages").insert({
            receiver_id: recipientUserId,
            body: body,
            is_admin_system: true,
            metadata: { subject } as Record<string, unknown>,
          });
        }

        if (targetEmail && sendEmail) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #6366f1;">Notice from Paste Prompts Admin</h2>
              <div style="font-size: 15px; color: #334155; line-height: 1.6; whitespace: pre-wrap;">
                ${body.replace(/\n/g, "<br/>")}
              </div>
              <p style="font-size: 13px; color: #94a3b8; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                Sent officially from admin@pasteprompts.co.uk
              </p>
            </div>
          `;

          await supabase.from("email_send_log").insert({
            recipient_email: targetEmail,
            template_name: "admin_notice",
            status: "pending",
            metadata: {
              subject: subject || "Notice from Paste Prompts Admin",
              from_email: "admin@pasteprompts.co.uk",
              body_html: emailHtml,
            },
          });
        }

        return { count: 1, broadcast: false };
      }
    },
    onSuccess: (res) => {
      toast({
        title: res.broadcast ? "Broadcast Sent!" : "Message Sent!",
        description: res.broadcast
          ? `Sent in-app message & queued emails to ${res.count} users.`
          : "Message sent successfully from admin@pasteprompts.co.uk.",
      });
      setBody("");
      refetchSent();
      refetchEmails();
    },
    onError: (err: Error) => {
      toast({
        title: "Error Sending Message",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Top Early Bird Tracker Card */}
      <Card className="border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-lg font-bold">First 10 Members - Free 3-Month Platinum Promo</CardTitle>
            </div>
            <Badge variant="outline" className="border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-bold px-3 py-1 text-xs">
              {earlyBird?.claimedCount ?? 0} / 10 Claimed
            </Badge>
          </div>
          <CardDescription>
            The next users who sign up automatically receive 3 months of free Platinum membership, Creator status, an in-app congratulations message with social share buttons, and an automated email from <span className="font-mono text-xs">admin@pasteprompts.co.uk</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Claimed Spots</span>
                <span>{Math.round(((earlyBird?.claimedCount || 0) / 10) * 100)}%</span>
              </div>
              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((earlyBird?.claimedCount || 0) / 10) * 100)}%` }}
                />
              </div>
            </div>

            {/* Recipients List */}
            {earlyBird?.recipients && earlyBird.recipients.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                {earlyBird.recipients.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background border text-xs"
                  >
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{r.display_name || r.handle || "Member"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        Ends: {r.subscription_period_end ? new Date(r.subscription_period_end).toLocaleDateString() : "3 months"}
                      </p>
                    </div>
                    <Badge className="text-[9px] px-1 py-0 bg-green-500/10 text-green-600 border-green-500/20">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-3 text-xs text-muted-foreground bg-background/50 rounded-lg border border-dashed">
                No promo slots claimed yet. The next user who registers will be slot #1!
              </div>
            )}

            {/* Claim Promo Slot by Typing Username Form */}
            <form onSubmit={handleClaimByUsername} className="pt-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-background/90 rounded-xl border border-indigo-500/30 shadow-sm">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Type username, @handle, or email to grant 3-month free promo..."
                    value={promoUsername}
                    onChange={(e) => setPromoUsername(e.target.value)}
                    className="pl-9 h-9 text-xs bg-muted/20 border-indigo-500/20 focus-visible:ring-indigo-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isGrantingUsername || !promoUsername.trim()}
                  className="h-9 px-4 text-xs font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white shadow flex items-center justify-center gap-1.5 shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {isGrantingUsername ? "Granting..." : "Claim Slot for Username"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Main Mailbox Tabs */}
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="compose" className="flex items-center gap-1.5 text-xs">
            <Send className="w-3.5 h-3.5" /> Compose Admin Msg
          </TabsTrigger>
          <TabsTrigger value="outbox" className="flex items-center gap-1.5 text-xs">
            <Inbox className="w-3.5 h-3.5" /> Sent Messages ({sentMessages?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="email-queue" className="flex items-center gap-1.5 text-xs">
            <Mail className="w-3.5 h-3.5" /> Email Queue ({emailQueue?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Compose */}
        <TabsContent value="compose" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" /> Send System Message / Email
              </CardTitle>
              <CardDescription className="text-xs">
                Send an official in-app message from Admin or queue an email from <span className="font-mono text-xs">admin@pasteprompts.co.uk</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Broadcast Toggle */}
              <div className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border">
                <div>
                  <p className="text-sm font-semibold">Broadcast Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Send to all registered users simultaneously
                  </p>
                </div>
                <Button
                  type="button"
                  variant={isBroadcasting ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsBroadcasting(!isBroadcasting)}
                  className="text-xs font-semibold"
                >
                  {isBroadcasting ? "Broadcasting to ALL" : "Single User"}
                </Button>
              </div>

              {/* Single User Selector */}
              {!isBroadcasting && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Select Member:
                    </label>
                    <select
                      value={recipientUserId}
                      onChange={(e) => {
                        setRecipientUserId(e.target.value);
                      }}
                      className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">-- Choose User --</option>
                      {usersList?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.display_name || u.handle || u.id} ({u.membership_tier || "free"})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Target Email Address:
                    </label>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      value={targetEmail}
                      onChange={(e) => setTargetEmail(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Manual Grant Promo Action */}
              {recipientUserId && !isBroadcasting && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                      Grant 3-Month Free Platinum Promo
                    </p>
                    <p className="text-muted-foreground">
                      Upgrades selected user to Platinum + Creator status, sends admin message & email.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => grantPromoMutation.mutate(recipientUserId)}
                    disabled={grantPromoMutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5" /> Grant Promo Now
                  </Button>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Email Subject / Message Title:
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line..."
                  className="h-9 text-sm"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                  Message Content:
                </label>
                <Textarea
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your official admin message here..."
                  className="text-sm leading-relaxed"
                />
              </div>

              {/* Delivery Channels */}
              <div className="flex items-center gap-6 text-xs font-medium">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendInApp}
                    onChange={(e) => setSendInApp(e.target.checked)}
                    className="rounded border-gray-300 text-primary"
                  />
                  In-App System Message (User's Private Messages)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendEmail}
                    onChange={(e) => setSendEmail(e.target.checked)}
                    className="rounded border-gray-300 text-primary"
                  />
                  Queue Email from <span className="font-mono text-[11px]">admin@pasteprompts.co.uk</span>
                </label>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => sendMessageMutation.mutate()}
                  disabled={sendMessageMutation.isPending || !body.trim()}
                  className="flex items-center gap-2 px-5 font-semibold"
                >
                  <Send className="w-4 h-4" />
                  {sendMessageMutation.isPending ? "Sending..." : "Send Admin Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Outbox / Sent Messages */}
        <TabsContent value="outbox" className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground">Admin System Messages History</h3>
            <Button size="sm" variant="ghost" onClick={() => refetchSent()} className="h-8 text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>

          {sentMessages && sentMessages.length > 0 ? (
            <div className="space-y-2">
              {sentMessages.map((msg) => (
                <Card key={msg.id} className="p-3 text-xs border bg-card">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-semibold text-foreground flex items-center gap-2">
                      <span>To: {msg.receiver?.display_name || msg.receiver?.handle || msg.receiver_id}</span>
                      {msg.metadata?.promo_type === "early_bird_platinum" && (
                        <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] px-1.5 py-0">
                          Early Bird Promo
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3 leading-relaxed">
                    {msg.body}
                  </p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground border rounded-lg">
              No admin system messages sent yet.
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Email Queue */}
        <TabsContent value="email-queue" className="mt-4 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground">Outgoing Email Queue (admin@pasteprompts.co.uk)</h3>
            <Button size="sm" variant="ghost" onClick={() => refetchEmails()} className="h-8 text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
          </div>

          {emailQueue && emailQueue.length > 0 ? (
            <div className="space-y-2">
              {emailQueue.map((em) => (
                <Card key={em.id} className="p-3 text-xs border bg-card flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <div className="flex items-center gap-2 font-semibold text-foreground">
                      <span>To: {em.to_email}</span>
                      <span className="text-muted-foreground text-[10px]">({em.from_email})</span>
                    </div>
                    <p className="text-muted-foreground truncate text-[11px] font-medium">{em.subject}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Created: {new Date(em.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      em.status === "sent"
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : em.status === "failed"
                        ? "bg-red-500/10 text-red-600 border-red-500/30"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    }
                  >
                    {em.status}
                  </Badge>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-muted-foreground border rounded-lg">
              No emails currently queued.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
