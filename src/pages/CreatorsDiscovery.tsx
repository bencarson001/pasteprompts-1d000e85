import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Users,
  Sparkles,
  Crown,
  ShieldCheck,
  Star,
  Grid,
  TrendingUp,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

export default function CreatorsDiscovery() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | "platinum" | "pro">("all");

  const { data: creators = [], isLoading } = useQuery({
    queryKey: ["creators-discovery-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, avatar_url, banner_url, total_sales, is_creator, created_at")
        .order("total_sales", { ascending: false })
        .limit(40);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filteredCreators = creators.filter((c) => {
    const term = search.toLowerCase().trim();
    const matchesSearch =
      !term ||
      c.display_name?.toLowerCase().includes(term) ||
      c.handle?.toLowerCase().includes(term) ||
      c.bio?.toLowerCase().includes(term);

    const isPlat = (c.total_sales ?? 0) >= 50;
    const isPro = (c.total_sales ?? 0) >= 5;

    if (tierFilter === "platinum") return matchesSearch && isPlat;
    if (tierFilter === "pro") return matchesSearch && isPro;
    return matchesSearch;
  });

  return (
    <Layout>
      <SEO
        title="Discover AI Prompt Creators | Paste Prompts"
        description="Explore top verified AI prompt creators, prompt engineers, and workflow architects on Paste Prompts."
        canonical="https://pasteprompts.co.uk/creators"
      />

      <div className="container-wide py-8 sm:py-12">
        {/* Header Hero Banner */}
        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-primary/20 via-card to-accent/15 p-8 sm:p-12 shadow-2xl backdrop-blur-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
            <Users className="h-7 w-7" />
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-3">
            Discover Top AI Prompt Creators
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">
            Connect with vetted prompt engineers, follow workflow specialists, and discover high-converting prompt systems for ChatGPT, Claude 3.7, Midjourney, and Gemini.
          </p>

          {/* Search and Filters */}
          <div className="mx-auto max-w-xl flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search creators by name, skill, or handle..."
                className="pl-10 h-11 bg-card/90 border-white/15 text-sm rounded-xl"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-center">
              <Button
                size="sm"
                variant={tierFilter === "all" ? "default" : "outline"}
                onClick={() => setTierFilter("all")}
                className={`h-11 rounded-xl text-xs font-semibold ${tierFilter === "all" ? "bg-gradient-primary" : "border-white/10 bg-card/50"}`}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={tierFilter === "platinum" ? "default" : "outline"}
                onClick={() => setTierFilter("platinum")}
                className={`h-11 rounded-xl text-xs font-semibold ${tierFilter === "platinum" ? "bg-amber-500 text-slate-950 font-bold" : "border-amber-500/30 text-amber-300 bg-card/50"}`}
              >
                <Crown className="mr-1 h-3.5 w-3.5" /> Platinum
              </Button>
              <Button
                size="sm"
                variant={tierFilter === "pro" ? "default" : "outline"}
                onClick={() => setTierFilter("pro")}
                className={`h-11 rounded-xl text-xs font-semibold ${tierFilter === "pro" ? "bg-primary text-primary-foreground" : "border-primary/30 text-primary-glow bg-card/50"}`}
              >
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Pro
              </Button>
            </div>
          </div>
        </div>

        {/* Creators Grid */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-sm text-muted-foreground">Discovering prompt creators...</p>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center text-muted-foreground">
            <Users className="mx-auto h-10 w-10 text-muted-foreground/60 mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No creators matched</h3>
            <p className="text-xs text-muted-foreground">Try clearing your search query or tier filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCreators.map((creator) => {
              const isPlat = (creator.total_sales ?? 0) >= 50;
              const isPro = (creator.total_sales ?? 0) >= 5;

              return (
                <div
                  key={creator.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-card/90"
                >
                  <div className="flex items-start gap-3.5 mb-3">
                    <Avatar className="h-14 w-14 rounded-xl border border-primary/20">
                      <AvatarImage src={creator.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-gradient-primary font-display font-bold text-primary-foreground">
                        {(creator.display_name ?? creator.handle ?? "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="truncate font-display text-base font-bold text-foreground group-hover:text-primary-glow transition-colors">
                          {creator.display_name || `@${creator.handle}`}
                        </h3>
                        {isPlat ? (
                          <Crown className="h-3.5 w-3.5 shrink-0 text-amber-400 fill-current" />
                        ) : isPro ? (
                          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary-glow" />
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">@{creator.handle}</p>
                    </div>
                  </div>

                  {creator.bio && (
                    <p className="mb-4 line-clamp-2 text-xs text-foreground/80 leading-relaxed">
                      {creator.bio}
                    </p>
                  )}

                  <div className="flex items-center justify-between border-t border-white/5 pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="font-semibold">{Math.min(99, 75 + (creator.total_sales ?? 0) * 2)}</span>
                      <span className="text-[10px] text-muted-foreground">Rep</span>
                    </div>

                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs font-semibold text-primary-glow hover:text-foreground p-0 hover:bg-transparent"
                    >
                      <Link to={`/profile/${creator.handle}`}>
                        View Profile <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
