import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, Sparkles, ArrowRight, Tag, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QUICK_TAGS = [
  { label: "Free Prompts", to: "/browse?price=free", icon: Sparkles, color: "text-emerald-400" },
  { label: "ChatGPT", to: "/prompts/chatgpt-prompts", icon: Zap, color: "text-green-400" },
  { label: "Claude", to: "/prompts/claude-prompts", icon: Zap, color: "text-amber-400" },
  { label: "Gemini", to: "/prompts/gemini-prompts", icon: Zap, color: "text-blue-400" },
  { label: "Midjourney", to: "/prompts/midjourney-prompts", icon: Sparkles, color: "text-purple-400" },
  { label: "Copywriting", to: "/category/copywriting", icon: Tag, color: "text-pink-400" },
  { label: "Make Money", to: "/category/make-money-online", icon: TrendingUp, color: "text-yellow-400" },
  { label: "Marketing", to: "/category/business-marketing", icon: Tag, color: "text-cyan-400" },
];

const POPULAR_SEARCHES = [
  "SEO Blog Post Generator",
  "Cold Email Sequence",
  "Midjourney Photorealistic Portrait",
  "Python Code Refactor",
  "Viral Hook Generator",
  "E-commerce Product Description",
];

const RECENT_KEY = "pp_mobile_recent_searches";

export function MobileSearchDialog({ open, onOpenChange }: MobileSearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, [open]);

  const saveRecent = (term: string) => {
    try {
      const updated = [term, ...recentSearches.filter((t) => t !== term)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSearch = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    saveRecent(term);
    onOpenChange(false);
    navigate(`/browse?q=${encodeURIComponent(term)}`);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="mobile-search-dialog"
        className="top-0 translate-y-0 h-full max-h-[92vh] max-w-full rounded-b-3xl border-x-0 border-t-0 p-0 sm:max-w-md sm:rounded-2xl sm:border sm:top-[50%] sm:-translate-y-1/2 flex flex-col bg-background/98 backdrop-blur-2xl"
      >
        <DialogHeader className="p-4 pb-2 border-b border-border/40">
          <DialogTitle className="sr-only">Search Prompts</DialogTitle>
          <form onSubmit={onSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search prompts, models, tags…"
                className="h-11 pl-10 pr-9 rounded-xl bg-card/80 border-white/10 text-base focus-visible:ring-primary"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button type="submit" size="sm" className="h-11 px-4 rounded-xl bg-gradient-primary">
              Search
            </Button>
          </form>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Quick Filter Badges */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
              Quick filters
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => (
                <button
                  key={tag.label}
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(tag.to);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-card/60 text-xs font-medium text-foreground hover:border-primary/40 hover:bg-card transition-colors active:scale-95"
                >
                  <tag.icon className={`h-3 w-3 ${tag.color}`} />
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent searches
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem(RECENT_KEY);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearch(term)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left text-foreground hover:bg-card/70 transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{term}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular searches */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-primary-glow" />
              Popular right now
            </h4>
            <div className="space-y-1">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearch(term)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-left text-muted-foreground hover:text-foreground hover:bg-card/70 transition-colors group"
                >
                  <span className="truncate group-hover:text-primary-glow transition-colors">{term}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MobileSearchDialog;
