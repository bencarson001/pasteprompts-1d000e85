import { ReactNode, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileFooter } from "./MobileFooter";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { SignUpNudge } from "@/components/SignUpNudge";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CookieConsent } from "@/components/CookieConsent";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUnreadCount } from "@/lib/messages";

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unread-messages-count", user?.id],
    queryFn: fetchUnreadCount,
    enabled: !!user?.id,
    staleTime: 30000,
  });

  return (
    <div id="app-layout-root" className="flex min-h-screen flex-col bg-background text-foreground antialiased selection:bg-primary/30">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Top Banner */}
      <AnnouncementBanner />

      {/* 1. Mobile Header (< 768px) */}
      <div className="block md:hidden">
        <MobileHeader onOpenMenu={() => setDrawerOpen(true)} unreadCount={unreadCount} />
      </div>

      {/* 2. Desktop / Tablet Header (>= 768px) */}
      <div className="hidden md:block">
        <Header />
      </div>

      {/* Single Main Content instance */}
      <main id="main-content" className="flex-1 pb-14 md:pb-0">
        {children}
      </main>

      {/* 1. Mobile Footer (< 768px) */}
      <div className="block md:hidden">
        <MobileFooter />
      </div>

      {/* 2. Desktop / Tablet Footer (>= 768px) */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Mobile Fixed Bottom Nav (< 768px) */}
      <div className="block md:hidden">
        <MobileBottomNav onOpenMenu={() => setDrawerOpen(true)} unreadCount={unreadCount} />
      </div>

      {/* Shared Mobile Drawer (rendered once in layout) */}
      <MobileNavDrawer open={drawerOpen} onOpenChange={setDrawerOpen} unreadCount={unreadCount} />

      {/* Global Utilities */}
      <SignUpNudge />
      <ScrollToTop />
      <CookieConsent />
    </div>
  );
}

export default Layout;
