import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Search,
  Compass,
  Gift,
  TrendingUp,
  Store,
  LayoutDashboard,
  Library,
  Bookmark,
  MessageSquare,
  BookOpen,
  Settings,
  Shield,
  LogOut,
  UserPlus,
  LogIn,
  Crown,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  FileText,
  Users,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unreadCount?: number;
}

const CATEGORIES = [
  { label: "Copywriting", to: "/category/copywriting" },
  { label: "Make Money Online", to: "/category/make-money-online" },
  { label: "Business & Marketing", to: "/category/business-marketing" },
  { label: "AI Tools & Dev", to: "/category/ai-tools" },
];

export function MobileNavDrawer({ open, onOpenChange, unreadCount = 0 }: MobileNavDrawerProps) {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLinkClick = (to: string) => {
    onOpenChange(false);
    navigate(to);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="mobile-nav-drawer"
        side="left"
        className="w-[88vw] max-w-sm p-0 flex flex-col bg-background/98 backdrop-blur-2xl border-r border-border/50"
      >
        <SheetHeader className="p-4 border-b border-border/40 text-left">
          <SheetTitle className="flex items-center justify-between">
            <Link
              to="/"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-2 font-display text-base font-bold"
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </span>
              <span>Paste<span className="text-gradient">Prompts</span></span>
            </Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* User Profile / Guest State */}
          {user ? (
            <div className="rounded-2xl border border-primary/20 bg-card/80 p-3.5 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-primary/30">
                  <AvatarFallback className="bg-gradient-primary text-sm font-semibold text-primary-foreground">
                    {(user.email ?? "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate text-foreground">
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Logged in</span>
                    {isAdmin && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/40 text-primary">
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-border/40">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLinkClick("/profile/edit")}
                  className="h-8 text-xs border-border/60 justify-start px-2"
                >
                  <Users className="mr-1 h-3 w-3 text-primary-glow" /> Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLinkClick("/library")}
                  className="h-8 text-xs border-border/60 justify-start px-2"
                >
                  <Library className="mr-1 h-3 w-3 text-primary-glow" /> Library
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLinkClick("/messages")}
                  className="h-8 text-xs border-border/60 justify-between relative px-2"
                >
                  <span className="flex items-center">
                    <MessageSquare className="mr-1 h-3 w-3 text-primary-glow" /> Inbox
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-primary/25 bg-gradient-glow p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-primary-glow" />
                <h4 className="text-sm font-bold text-foreground">Unlock Free Prompts</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Create a free account to save prompt templates &amp; copy with one click.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => handleLinkClick("/auth?mode=signup")}
                  className="bg-gradient-primary text-xs font-semibold h-9"
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Sign up free
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleLinkClick("/auth")}
                  className="text-xs border-border/70 h-9"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" /> Log in
                </Button>
              </div>
            </div>
          )}

          {/* Primary Navigation Sections */}
          <div className="space-y-4">
            {/* Discover */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Discover
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleLinkClick("/browse")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Compass className="h-4 w-4 text-primary-glow" /> All Prompts
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </button>

                <button
                  onClick={() => handleLinkClick("/creators")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-sky-400" /> Creators &amp; Profiles
                  </span>
                  <Badge variant="secondary" className="bg-sky-500/10 text-sky-400 text-[10px] py-0 px-2">
                    Community
                  </Badge>
                </button>

                <button
                  onClick={() => handleLinkClick("/browse?price=free")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Gift className="h-4 w-4 text-emerald-400" /> Free Prompts
                  </span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-[10px] py-0 px-2">
                    Free
                  </Badge>
                </button>

                <button
                  onClick={() => handleLinkClick("/browse?sort=trending")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <TrendingUp className="h-4 w-4 text-amber-400" /> Trending Prompts
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </button>

                <button
                  onClick={() => handleLinkClick("/pro")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Crown className="h-4 w-4 text-primary-glow" /> PastePrompts Pro
                  </span>
                  <Badge className="bg-gradient-primary text-[10px] py-0 px-2 font-bold">PRO</Badge>
                </button>
              </div>
            </div>

            {/* Popular Categories */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Top Categories
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.to}
                    onClick={() => handleLinkClick(cat.to)}
                    className="p-2.5 rounded-xl border border-border/40 bg-card/40 text-left text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card/80 transition-all"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Creator Tools */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Creator &amp; Selling
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleLinkClick("/sell")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Store className="h-4 w-4 text-emerald-400" /> Sell Your Prompts
                  </span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[10px] py-0">
                    Earn 80%+
                  </Badge>
                </button>

                {user && (
                  <button
                    onClick={() => handleLinkClick("/dashboard")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <LayoutDashboard className="h-4 w-4 text-primary-glow" /> Creator Dashboard
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </button>
                )}
              </div>
            </div>

            {/* Guides & Learn */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                Resources
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleLinkClick("/#how-it-works")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-primary-glow" /> How It Works
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </button>
                <button
                  onClick={() => handleLinkClick("/guides")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-blue-400" /> AI Prompt Guides
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </button>
                <button
                  onClick={() => handleLinkClick("/glossary")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-purple-400" /> Prompt Glossary
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </button>
                <button
                  onClick={() => handleLinkClick("/contact")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-muted-foreground" /> Contact &amp; Support
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                </button>
              </div>
            </div>

            {/* Account Settings / Admin */}
            {user && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">
                  Account
                </p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => handleLinkClick("/saved")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Bookmark className="h-4 w-4 text-amber-400" /> Saved Prompts
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </button>
                  <button
                    onClick={() => handleLinkClick("/settings")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-muted-foreground" /> Settings
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => handleLinkClick("/admin")}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-card/80 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-primary" /> Admin Panel
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer of Drawer */}
        <div className="p-4 border-t border-border/40 bg-card/30">
          {user ? (
            <Button
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                signOut();
              }}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-10 rounded-xl"
            >
              <LogOut className="mr-2.5 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Copyright © {new Date().getFullYear()} Paste Prompts</span>
              <div className="flex gap-2">
                <Link to="/legal/privacy" onClick={() => onOpenChange(false)} className="hover:text-foreground">
                  Privacy
                </Link>
                <span>·</span>
                <Link to="/legal/terms" onClick={() => onOpenChange(false)} className="hover:text-foreground">
                  Terms
                </Link>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileNavDrawer;
