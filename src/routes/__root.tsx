import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdsManager } from "@/components/AdsManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { trackPageView } from "@/lib/analytics";
import { installAppRecovery } from "@/lib/appRecovery";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import { useLocation } from "@/lib/router-compat";
import NotFound from "@/pages/NotFound";
import appCss from "../styles.css?url";

const SITE_TITLE = "AI Prompts & ChatGPT Prompts Marketplace | Paste Prompts";
const SITE_DESCRIPTION =
  "Discover AI prompts & ChatGPT prompts. Copy and paste free & 49p prompts for ChatGPT, Claude, Gemini, Midjourney & Flux. Buy or sell prompts on Paste Prompts.";
const SOCIAL_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/gVA6LFVAv1NR5HdixPMdl8cXxqp2/social-images/social-1781312540994-4621.webp";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      {
        name: "keywords",
        content:
          "AI prompts, ChatGPT prompts, Claude prompts, Gemini prompts, Midjourney prompts, prompt marketplace, prompt engineering, free AI prompts, best AI prompts, buy prompts, sell prompts, DALL·E prompts, Sora prompts, prompt library, prompt templates",
      },
      { name: "author", content: "Paste Prompts" },
      { name: "theme-color", content: "#0a0a1a" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      {
        httpEquiv: "Content-Security-Policy",
        content:
          "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://adservice.google.com https://tpc.googlesyndication.com https://js.stripe.com https://*.stripe.com https://ep2.adtrafficquality.google https://*.adtrafficquality.google; img-src 'self' https: data: blob:; style-src 'self' https: 'unsafe-inline'; font-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https:;",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Paste Prompts" },
      { property: "og:url", content: "https://pasteprompts.co.uk/" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:image", content: SOCIAL_IMAGE },
      { name: "twitter:site", content: "@pasteprompts" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: SOCIAL_IMAGE },
      { name: "seobility", content: "be69fbec4bde0bbe94abbbbecb57c3ec" },
      { name: "google-adsense-account", content: "ca-pub-3809061959162534" },
      { name: "google-adsense-platform", content: "prefer_responsive" },
      { name: "copyright", content: "Copyright © 2026 Paste Prompts. All rights reserved." },
      { name: "apple-mobile-web-app-title", content: "Paste Prompts" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://www.googletagmanager.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://www.google-analytics.com" },
      { rel: "dns-prefetch", href: "https://pagead2.googlesyndication.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Paste Prompts",
          url: "https://pasteprompts.co.uk/",
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://pasteprompts.co.uk/browse?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Paste Prompts",
          url: "https://pasteprompts.co.uk/",
          logo: SOCIAL_IMAGE,
          description: "A marketplace where people discover, buy, use and sell reusable AI prompts.",
          email: "hello@pasteprompts.co.uk",
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "hello@pasteprompts.co.uk",
            url: "https://pasteprompts.co.uk/contact",
            availableLanguage: ["English"],
          },
          sameAs: [
            "https://x.com/pasteprompts",
            "https://www.facebook.com/pasteprompts",
            "https://www.instagram.com/pasteprompts",
            "https://www.tiktok.com/@pasteprompts",
          ],
          copyrightYear: 2026,
        }),
      },
      // Google tag (gtag.js) — ported from index.html
      { src: "https://www.googletagmanager.com/gtag/js?id=G-D0T32ZB520", async: true },
      {
        children:
          "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-D0T32ZB520');",
      },
      // Google AdSense — global verification, ported from index.html
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3809061959162534",
        async: true,
        crossOrigin: "anonymous",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // ported from main.tsx — recovers automatically from stale cached chunks
  useEffect(() => {
    installAppRecovery();
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <AnalyticsTracker />
              <AdsManager />
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-xl font-semibold">This page didn't load</h1>
        <p className="mb-6 text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a className="rounded-md border border-border bg-card px-4 py-2" href="/">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
