import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MessageSquare, User, Loader2, Search, Send, Inbox, 
  Trash2, Mail, CheckCircle2, MoreHorizontal, Reply, Plus
} from "lucide-react";
import { format } from "date-fns";
import { fetchMyMessages, sendMessage, markAsRead, PrivateMessage } from "@/lib/messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger 
} from "@/components/ui/dialog";

export function MessageInbox() {
  const [searchParams] = useSearchParams();
  const recipientParam = searchParams.get("recipient");
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedMsg, setSelectedMsg] = useState<PrivateMessage | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // New message state
  const [composeOpen, setComposeOpen] = useState(!!recipientParam);
  const [targetRecipientId, setTargetRecipientId] = useState(recipientParam || "");
  const [composeBody, setComposeBody] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ["private-messages"],
    queryFn: fetchMyMessages,
  });

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["private-messages"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: ({ receiverId, body }: { receiverId: string; body: string }) => 
      sendMessage(receiverId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["private-messages"] });
      toast({ title: "Message sent!" });
      setReplyBody("");
      setIsReplying(false);
    },
    onError: (e) => {
      toast({ title: "Failed to send", description: e.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (selectedMsg && !selectedMsg.read_at && selectedMsg.receiver_id === currentUser?.id) {
      readMutation.mutate(selectedMsg.id);
    }
  }, [selectedMsg, currentUser, readMutation]);

  const handleReply = () => {
    if (!selectedMsg || !replyBody.trim()) return;
    const receiverId = selectedMsg.sender_id === currentUser?.id ? selectedMsg.receiver_id : selectedMsg.sender_id;
    if (!receiverId) return;
    sendMutation.mutate({ receiverId, body: replyBody });
  };

  const handleNewMessage = () => {
    if (!targetRecipientId.trim() || !composeBody.trim()) return;
    sendMutation.mutate(
      { receiverId: targetRecipientId.trim(), body: composeBody.trim() },
      {
        onSuccess: () => {
          setComposeOpen(false);
          setComposeBody("");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unreadCount = messages?.filter(m => !m.read_at && m.receiver_id === currentUser?.id).length ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-black/20 backdrop-blur-md">
      {/* Sidebar List */}
      <div className="md:col-span-1 border-r border-white/10 flex flex-col bg-white/5">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Messages
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center px-1">
                {unreadCount}
              </Badge>
            )}
          </h3>

          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full border border-white/10">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/10">
              <DialogHeader>
                <DialogTitle>New Direct Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Recipient User ID</label>
                  <Input 
                    value={targetRecipientId} 
                    onChange={(e) => setTargetRecipientId(e.target.value)} 
                    placeholder="Enter User ID..." 
                    className="mt-1 bg-black/20 border-white/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Message</label>
                  <Textarea 
                    value={composeBody} 
                    onChange={(e) => setComposeBody(e.target.value)} 
                    placeholder="Write your message..." 
                    className="mt-1 min-h-[100px] bg-black/20 border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setComposeOpen(false)}>Cancel</Button>
                <Button onClick={handleNewMessage} disabled={!targetRecipientId || !composeBody || sendMutation.isPending}>
                  {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  Send Message
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-1 p-2">
          {!messages?.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground opacity-50">
              <Mail className="h-10 w-10 mb-2" />
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isSender = msg.sender_id === currentUser?.id;
              const otherUser = isSender ? msg.receiver : msg.sender;
              const isUnread = !msg.read_at && !isSender;

              return (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMsg(msg)}
                  className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group relative ${
                    selectedMsg?.id === msg.id 
                      ? "bg-primary/20 ring-1 ring-primary/30" 
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                      {otherUser?.avatar_url ? (
                        <img src={otherUser.avatar_url} alt={otherUser.display_name || "Member avatar"} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-bold truncate ${isUnread ? "text-white" : "text-muted-foreground"}`}>
                          {otherUser?.display_name || "Member"}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.created_at), "MMM d")}
                        </span>
                      </div>
                      <p className={`text-xs truncate mt-1 ${isUnread ? "text-white/80 font-medium" : "text-muted-foreground"}`}>
                        {isSender ? "You: " : ""}{msg.body}
                      </p>
                    </div>
                  </div>
                  {isUnread && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="md:col-span-2 flex flex-col h-full bg-black/20">
        {!selectedMsg ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-30">
            <MessageSquare className="h-16 w-16 mb-4" />
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl overflow-hidden bg-white/10">
                  {(() => {
                    const otherUser = selectedMsg.sender_id === currentUser?.id ? selectedMsg.receiver : selectedMsg.sender;
                    return otherUser?.avatar_url ? (
                      <img src={otherUser.avatar_url} alt={otherUser.display_name || "User avatar"} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    );
                  })()}
                </div>
                <div>
                  <p className="font-bold">{(selectedMsg.sender_id === currentUser?.id ? selectedMsg.receiver : selectedMsg.sender)?.display_name || "Member"}</p>
                  <p className="text-xs text-muted-foreground">@{ (selectedMsg.sender_id === currentUser?.id ? selectedMsg.receiver : selectedMsg.sender)?.handle || "user"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    {format(new Date(selectedMsg.created_at), "MMMM do, h:mm a")}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>
                
                <div className={`flex ${selectedMsg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    selectedMsg.sender_id === currentUser?.id 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "glass border-white/10 rounded-tl-none"
                  }`}>
                    {selectedMsg.body}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5">
              {!isReplying ? (
                <Button 
                  onClick={() => setIsReplying(true)} 
                  className="w-full justify-start gap-2 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10"
                  variant="ghost"
                >
                  <Reply className="h-4 w-4" />
                  Write a reply...
                </Button>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Type your message..."
                    className="min-h-[100px] rounded-2xl border-white/10 focus-visible:ring-primary/50 bg-black/20"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsReplying(false)}>Cancel</Button>
                    <Button 
                      onClick={handleReply} 
                      disabled={!replyBody.trim() || sendMutation.isPending}
                      className="gap-2 px-6 rounded-xl"
                    >
                      {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
