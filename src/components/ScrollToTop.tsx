import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Scroll to hash anchor or top on route/hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      // Small timeout to allow target DOM to render if route just changed
      const timeoutId = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <Button
      onClick={scrollUp}
      size="icon"
      aria-label="Scroll to top"
      className="fixed bottom-20 right-5 z-40 h-11 w-11 rounded-full border border-primary/20 bg-card/80 shadow-lg backdrop-blur-xl transition-all hover:scale-110 hover:bg-card sm:bottom-6 sm:right-6"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}

export default ScrollToTop;

