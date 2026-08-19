import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Compass,
  PlusCircle,
  Bookmark,
  Library,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface MobileBottomNavProps {
  onOpenMenu: () => void;
  unreadCount?: number;
}

export function MobileBottomNav({ onOpenMenu, unreadCount = 0 }: MobileBottomNavProps) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isHomeActive = pathname === "/";
  const isBrowseActive = pathname.startsWith("/browse") || pathname.startsWith("/category");
  const isSellActive = pathname === "/sell";
  const isLibraryActive = pathname === "/library" || pathname === "/saved";

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile navigation"
      className="fixed bottom-0 inset-x-0 z-40 block border-t border-border/50 bg-background/92 backdrop-blur-2xl transition-all shadow-[0_-4px_24px_rgba(0,0,0,0.2)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5"
    >
      <div className="flex items-center justify-around px-2 max-w-lg mx-auto">
        {/* 1. Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
            isHomeActive
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="relative">
            <Home className={`h-5 w-5 ${isHomeActive ? "stroke-[2.5]" : "stroke-2"}`} />
            {isHomeActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </Link>

        {/* 2. Browse */}
        <Link
          to="/browse"
          className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
            isBrowseActive
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="relative">
            <Compass className={`h-5 w-5 ${isBrowseActive ? "stroke-[2.5]" : "stroke-2"}`} />
            {isBrowseActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Explore</span>
        </Link>

        {/* 3. Sell (Center Action) */}
        <Link
          to="/sell"
          className="flex flex-col items-center justify-center py-0 px-2 group min-w-[56px]"
        >
          <div className="relative -mt-3.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow transition-transform group-active:scale-95 border-2 border-background">
            <PlusCircle className="h-6 w-6 text-primary-foreground stroke-[2.2]" />
          </div>
          <span className={`text-[10px] mt-1 tracking-tight font-medium ${isSellActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
            Sell
          </span>
        </Link>

        {/* 4. Library / Saved */}
        <Link
          to={user ? "/library" : "/saved"}
          className={`flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl transition-all ${
            isLibraryActive
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <div className="relative">
            {user ? (
              <Library className={`h-5 w-5 ${isLibraryActive ? "stroke-[2.5]" : "stroke-2"}`} />
            ) : (
              <Bookmark className={`h-5 w-5 ${isLibraryActive ? "stroke-[2.5]" : "stroke-2"}`} />
            )}
            {isLibraryActive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">
            {user ? "Library" : "Saved"}
          </span>
        </Link>

        {/* 5. Menu Drawer Trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-xl text-muted-foreground hover:text-foreground transition-all"
          aria-label="More navigation options"
        >
          <div className="relative">
            <Menu className="h-5 w-5 stroke-2" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}

export default MobileBottomNav;
