import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Search, Menu, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { MobileSearchDialog } from "./MobileSearchDialog";

interface MobileHeaderProps {
  onOpenMenu: () => void;
  unreadCount?: number;
}

export function MobileHeader({ onOpenMenu, unreadCount = 0 }: MobileHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header
        id="mobile-app-header"
        className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-xl transition-all"
      >
        <div className="flex h-14 items-center justify-between px-3.5 sm:px-4">
          {/* Brand Logo & Menu Trigger */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 -ml-1.5 rounded-xl text-muted-foreground hover:text-foreground"
              onClick={onOpenMenu}
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link to="/" className="flex items-center gap-1.5 font-display text-base font-bold">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
              </span>
              <span>Paste<span className="text-gradient">Prompts</span></span>
            </Link>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Quick Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-card hover:text-foreground"
              aria-label="Search prompts"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Unread Message / Inbox Trigger (if logged in) */}
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/messages")}
                className="relative h-9 w-9 rounded-xl text-muted-foreground hover:bg-card hover:text-foreground"
                aria-label="Messages"
              >
                <MessageSquare className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            ) : null}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile or Sign In */}
            {user ? (
              <button
                type="button"
                onClick={onOpenMenu}
                className="ml-0.5 rounded-full p-0.5 ring-1 ring-primary/40 focus:outline-none"
                aria-label="Open user menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-gradient-primary text-[10px] font-bold text-primary-foreground">
                    {(user.email ?? "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/auth?mode=signup")}
                className="h-8 px-2.5 rounded-lg bg-gradient-primary text-xs font-semibold btn-glow ml-1"
              >
                Join Free
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Search Dialog */}
      <MobileSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

export default MobileHeader;
