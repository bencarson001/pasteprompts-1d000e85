import { useEffect, Suspense, lazy, ComponentType } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdsManager } from "@/components/AdsManager";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Safe lazy import wrapper that retries on chunk / dynamic import load errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((error) => {
      const isDynamicImportError =
        error?.name === "ChunkLoadError" ||
        /failed to fetch dynamically imported module/i.test(error?.message || "");

      if (isDynamicImportError) {
        const hasReloadedKey = "retry_import_reloaded_" + window.location.pathname;
        const alreadyReloaded = sessionStorage.getItem(hasReloadedKey);
        if (!alreadyReloaded) {
          sessionStorage.setItem(hasReloadedKey, "true");
          window.location.reload();
        }
      }
      throw error;
    })
  );
}

// Code-splitting routes
const Index = lazyWithRetry(() => import("./pages/Index"));
const Browse = lazyWithRetry(() => import("./pages/Browse"));
const Category = lazyWithRetry(() => import("./pages/Category"));
const UserProfile = lazyWithRetry(() => import("./pages/UserProfile"));
const EditProfile = lazyWithRetry(() => import("./pages/EditProfile"));
const CreatorsDiscovery = lazyWithRetry(() => import("./pages/CreatorsDiscovery"));
const PromptDetail = lazyWithRetry(() => import("./pages/PromptDetail"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const CheckoutReturn = lazyWithRetry(() => import("./pages/CheckoutReturn"));
const Library = lazyWithRetry(() => import("./pages/Library"));
const Saved = lazyWithRetry(() => import("./pages/Saved"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const Sell = lazyWithRetry(() => import("./pages/Sell"));
const Pro = lazyWithRetry(() => import("./pages/Pro"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const Legal = lazyWithRetry(() => import("./pages/Legal"));
const Trust = lazyWithRetry(() => import("./pages/Trust"));
const Guides = lazyWithRetry(() => import("./pages/Guides"));
const GuideDetail = lazyWithRetry(() => import("./pages/GuideDetail"));
const About = lazyWithRetry(() => import("./pages/About"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Glossary = lazyWithRetry(() => import("./pages/Glossary"));
const Landing = lazyWithRetry(() => import("./pages/Landing"));
const EditorialStandards = lazyWithRetry(() => import("./pages/EditorialStandards"));
const DMCA = lazyWithRetry(() => import("./pages/DMCA"));
const OAuthConsent = lazyWithRetry(() => import("./pages/OAuthConsent"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const SiteMap = lazyWithRetry(() => import("./pages/SiteMap"));
const Messages = lazyWithRetry(() => import("./pages/Messages"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function AnalyticsTracker() {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnalyticsTracker />
          <AdsManager />

          <ErrorBoundary>
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/browse/:price" element={<Browse />} />
                <Route path="/browse/:price/:model" element={<Browse />} />
                <Route path="/browse/:price/:model/:category" element={<Browse />} />

                <Route path="/category/:slug" element={<Category />} />
                <Route path="/prompts/:slug" element={<Landing />} />
                <Route path="/creators" element={<CreatorsDiscovery />} />
                <Route path="/creators/:handle" element={<UserProfile />} />
                <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                <Route path="/profile/:username" element={<UserProfile />} />
                <Route path="/prompt/:slug" element={<PromptDetail />} />
                <Route path="/prompt/:category/:slug" element={<PromptDetail />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/pro" element={<Pro />} />
                <Route path="/checkout/return" element={<CheckoutReturn />} />
                <Route path="/legal/:slug" element={<Legal />} />
                <Route path="/privacy" element={<Legal docType="privacy" />} />
                <Route path="/privacy-policy" element={<Legal docType="privacy" />} />
                <Route path="/terms" element={<Legal docType="terms" />} />
                <Route path="/terms-of-service" element={<Legal docType="terms" />} />
                <Route path="/disclaimer" element={<Legal docType="disclaimer" />} />
                <Route path="/refunds" element={<Legal docType="refunds" />} />
                <Route path="/cookies" element={<Legal docType="cookies" />} />
                <Route path="/cookie-policy" element={<Legal docType="cookies" />} />
                <Route path="/trust" element={<Trust />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/guides/:slug" element={<GuideDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/editorial-standards" element={<EditorialStandards />} />
                <Route path="/dmca" element={<DMCA />} />
                <Route path="/takedown" element={<DMCA />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/glossary" element={<Glossary />} />
                <Route path="/site-map" element={<SiteMap />} />
                <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
                <Route path="/saved" element={<ProtectedRoute><Saved /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
