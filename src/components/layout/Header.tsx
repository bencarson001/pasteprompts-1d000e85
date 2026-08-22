import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Library, LayoutDashboard, LogOut, Sparkles, Shield, Store, Bookmark, Settings, MessageSquare, User, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUnreadCount } from "@/lib/messages";

const navLinks = [
  { label: "Explore", to: "/browse" },
  { label: "Categories", to: "/#categories" },
  { label: "Free Prompts", to: "/browse/free", badge: "Free" },
  { label: "Creators", to: "/creators" },
  { label: "Guides", to: "/guides" },
  { label: "How It Works", to: "/#how-it-works" },
  { label: "Sell Prompts", to: "/sell", isAction: true },
];

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages-count", user?.id],
    queryFn: fetchUnreadCount,
    enabled: !!user?.id,
    refetchInterval: 15000,
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      {/* Top Row: Brand & Authenticated Controls */}
      <div className="container-wide flex h-12 sm:h-13 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-1.5 font-display text-base font-bold tracking-wider">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary border border-primary/40 shadow-glow">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="font-bold text-white uppercase text-sm sm:text-base tracking-widest">
            PASTEPROMPTS<span className="text-primary font-medium">.CO.UK</span>
          </span>
          <span className="sr-only">PASTEPROMPTS.CO.UK</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              {/* Profile button (navigates to Profile Edit screen) */}
              <Button
                variant="ghost"
                onClick={() => navigate("/profile/edit")}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-white/5 bg-[#0b0a13] hover:bg-white/5 hover:border-white/10 transition-all"
                aria-label="User profile settings"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-gradient-primary text-[9px] text-primary-foreground font-bold">
                    {(user.email ?? "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {/* MENU Dropdown button next to it */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 gap-1 border-white/10 bg-[#0b0a13] px-2.5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/5 hover:text-primary-glow transition-all rounded-lg"
                  >
                    <Menu className="h-3 w-3" />
                    Menu
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 glass-strong">
                  <DropdownMenuItem onClick={() => navigate("/messages")} className="flex items-center justify-between">
                    <span className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" /> Messages
                    </span>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile/edit")}>
                    <User className="mr-2 h-4 w-4" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/library")}>
                    <Library className="mr-2 h-4 w-4" /> My Library
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/saved")}>
                    <Bookmark className="mr-2 h-4 w-4" /> Saved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Creator Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/sell")}>
                    <Store className="mr-2 h-4 w-4" /> Sell a prompt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Shield className="mr-2 h-4 w-4" /> Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="outline" onClick={() => navigate("/auth")} className="h-8 border-white/10 bg-transparent text-xs font-semibold text-white hover:bg-white/5 transition-all px-3">
                Login
              </Button>
              <Button onClick={() => navigate("/auth?mode=signup")} className="h-8 bg-primary hover:bg-primary/90 text-xs font-semibold text-white px-3 rounded shadow-glow">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Full-width responsive sub-navigation bar */}
      <div className="border-t border-white/5 bg-[#07060c]/60 py-1">
        <div className="container-wide">
          <nav className="flex items-center justify-start md:justify-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none whitespace-nowrap py-0.5">
            {navLinks.map((l) => {
              const isActive =
                l.to === "/"
                  ? location.pathname === "/" && !location.hash
                  : l.to.startsWith("/#")
                  ? location.pathname === "/" && location.hash === l.to.replace("/", "")
                  : location.pathname.startsWith(l.to);

              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                    l.isAction
                      ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 ml-1"
                      : isActive
                      ? "text-primary-glow bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                  {l.badge && (
                    <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1 py-0.2 text-[8px] font-black text-emerald-400 normal-case tracking-normal">
                      {l.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
