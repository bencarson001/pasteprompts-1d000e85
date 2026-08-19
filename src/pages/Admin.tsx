import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield, LayoutDashboard, FileText, Users, ShoppingBag, Star, Tag,
  Megaphone, AlertTriangle, Flag, ToggleLeft, ScrollText, CreditCard,
  Gift, Gauge, Share2, TrendingUp, BarChart3, Sparkles, Video, Inbox, Bell, Facebook, Mail,
} from "lucide-react";
import { fetchFeedbackUnreadCount, fetchAdminNotifications, getNotifSeenAt } from "@/lib/admin";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import AdminMailbox from "@/components/admin/AdminMailbox";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminPrompts } from "@/components/admin/AdminPrompts";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminSales } from "@/components/admin/AdminSales";
import { AdminReviews, AdminCategories, AdminAnnouncements } from "@/components/admin/AdminContent";
import { AdminErrorLogs, AdminReports, AdminFeatureFlags, AdminAudit, AdminAI } from "@/components/admin/AdminSystem";
import { AdminQuota, AdminSubscriptions, AdminReferrals, AdminTrending } from "@/components/admin/AdminMonitor";
import { AdminSocial } from "@/components/admin/AdminSocial";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, render: () => <AdminOverview /> },
  { id: "notifications", label: "Notifications", icon: Bell, render: (nav: (t: string) => void) => <AdminNotifications onNavigate={nav} /> },
  { id: "mailbox", label: "Admin Mailbox & Promo", icon: Mail, render: () => <AdminMailbox /> },
  { id: "analytics", label: "Analytics", icon: BarChart3, render: () => <AdminAnalytics /> },
  { id: "ai", label: "AI controls", icon: Sparkles, render: () => <AdminAI /> },
  { id: "prompts", label: "Prompts", icon: FileText, render: () => <AdminPrompts /> },
  { id: "members", label: "Members", icon: Users, render: () => <AdminUsers /> },
  { id: "sales", label: "Sales", icon: ShoppingBag, render: () => <AdminSales /> },
  { id: "feedback", label: "Feedback inbox", icon: Inbox, render: () => <AdminFeedback /> },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard, render: () => <AdminSubscriptions /> },
  { id: "quotas", label: "Upload quotas", icon: Gauge, render: () => <AdminQuota /> },
  { id: "reviews", label: "Reviews", icon: Star, render: () => <AdminReviews /> },
  { id: "categories", label: "Categories", icon: Tag, render: () => <AdminCategories /> },
  { id: "announcements", label: "Announcements", icon: Megaphone, render: () => <AdminAnnouncements /> },
  { id: "social-scheduler", label: "Social Scheduler", icon: Share2, render: () => <AdminSocial /> },
  { id: "reports", label: "Reports", icon: Flag, render: () => <AdminReports /> },
  { id: "errors", label: "Error logs", icon: AlertTriangle, render: () => <AdminErrorLogs /> },
  { id: "flags", label: "Feature flags", icon: ToggleLeft, render: () => <AdminFeatureFlags /> },
  { id: "referrals", label: "Referrals", icon: Gift, render: () => <AdminReferrals /> },
  { id: "trending", label: "Trending", icon: TrendingUp, render: () => <AdminTrending /> },
  { id: "audit", label: "Audit log", icon: ScrollText, render: () => <AdminAudit /> },
] as const;

function AdminTabContent({ active, onNavigate }: { active: string; onNavigate: (t: string) => void }) {
  switch (active) {
    case "overview": return <AdminOverview />;
    case "notifications": return <AdminNotifications onNavigate={onNavigate} />;
    case "mailbox": return <AdminMailbox />;
    case "analytics": return <AdminAnalytics />;
    case "ai": return <AdminAI />;
    case "prompts": return <AdminPrompts />;
    case "members": return <AdminUsers />;
    case "sales": return <AdminSales />;
    case "feedback": return <AdminFeedback />;
    case "subscriptions": return <AdminSubscriptions />;
    case "quotas": return <AdminQuota />;
    case "reviews": return <AdminReviews />;
    case "categories": return <AdminCategories />;
    case "announcements": return <AdminAnnouncements />;
    case "social-scheduler": return <AdminSocial />;
    case "reports": return <AdminReports />;
    case "errors": return <AdminErrorLogs />;
    case "flags": return <AdminFeatureFlags />;
    case "referrals": return <AdminReferrals />;
    case "trending": return <AdminTrending />;
    case "audit": return <AdminAudit />;
    default: return <AdminOverview />;
  }
}

export default function Admin() {
  const [active, setActive] = useState<string>("overview");
  const { data: unread } = useQuery({
    queryKey: ["admin-feedback-unread"],
    queryFn: fetchFeedbackUnreadCount,
    refetchInterval: 60000,
  });
  const { data: notifs } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: fetchAdminNotifications,
    refetchInterval: 60000,
  });
  const seenAt = getNotifSeenAt();
  const notifCount = (notifs ?? []).filter((n) => new Date(n.created_at).getTime() > seenAt).length;

  return (
    <Layout>
      <SEO title="Admin Hub" description="Paste Prompts admin control centre." canonical="/admin" noindex />
      <div className="container-wide py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">Admin Hub</h1>
            <p className="text-sm text-muted-foreground">Total control over Paste Prompts.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setActive(n.id)}
                className={cn(
                  "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  active === n.id ? "bg-gradient-primary text-primary-foreground shadow-glow" : "glass text-muted-foreground hover:text-foreground",
                )}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
                {n.id === "feedback" && !!unread && (
                  <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
                {n.id === "notifications" && !!notifCount && (
                  <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                    {notifCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="min-w-0">
            <AdminTabContent active={active} onNavigate={setActive} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
