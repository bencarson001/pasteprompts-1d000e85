import { useEffect, Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdsManager } from "@/components/AdsManager";

// Code-splitting routes
const Index = lazy(() => import("./pages/Index.tsx"));
const Browse = lazy(() => import("./pages/Browse.tsx"));
const Category = lazy(() => import("./pages/Category.tsx"));
const Creator = lazy(() => import("./pages/UserProfile.tsx"));
const UserProfile = lazy(() => import("./pages/UserProfile.tsx"));
const EditProfile = lazy(() => import("./pages/EditProfile.tsx"));
const CreatorsDiscovery = lazy(() => import("./pages/CreatorsDiscovery.tsx"));
const PromptDetail = lazy(() => import("./pages/PromptDetail.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const CheckoutReturn = lazy(() => import("./pages/CheckoutReturn.tsx"));
const Library = lazy(() => import("./pages/Library.tsx"));
const Saved = lazy(() => import("./pages/Saved.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Sell = lazy(() => import("./pages/Sell.tsx"));
const Pro = lazy(() => import("./pages/Pro.tsx"));
const Admin = lazy(() => import("./pages/Admin.tsx"));
const Legal = lazy(() => import("./pages/Legal.tsx"));
const Trust = lazy(() => import("./pages/Trust.tsx"));
const Guides = lazy(() => import("./pages/Guides.tsx"));
const GuideDetail = lazy(() => import("./pages/GuideDetail.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Glossary = lazy(() => import("./pages/Glossary.tsx"));
const Landing = lazy(() => import("./pages/Landing.tsx"));
const EditorialStandards = lazy(() => import("./pages/EditorialStandards.tsx"));
const DMCA = lazy(() => import("./pages/DMCA.tsx"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const SiteMap = lazy(() => import("./pages/SiteMap.tsx"));
const Messages = lazy(() => import("./pages/Messages.tsx"));

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
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
