import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { installAppRecovery } from "./lib/appRecovery";

// Recovers automatically from blank screens caused by stale cached chunks.
installAppRecovery();

// Register the service worker for PWA / offline support (no-op in dev failures).
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <App />
    </ThemeProvider>
  </HelmetProvider>,
);
