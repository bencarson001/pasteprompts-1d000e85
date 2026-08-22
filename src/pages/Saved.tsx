import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptGrid } from "@/components/PromptGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMySaved } from "@/lib/queries";
import type { PromptCardData } from "@/components/PromptCard";

export default function Saved() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["saved-list", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchMySaved(user!.id),
  });

  const prompts = (data ?? []).map((row) => row.prompt as unknown as PromptCardData);

  return (
    <Layout>
      <SEO title="Saved prompts" description="Prompts you've saved for later on Paste Prompts." canonical="/saved" noindex />
      <div className="container-wide py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <Bookmark className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">Saved for later</h1>
            <p className="text-sm text-muted-foreground">Your shortlist of prompts to revisit.</p>
          </div>
        </div>

        {!isLoading && prompts.length === 0 ? (
          <div className="rounded-3xl glass-strong p-12 text-center">
            <Bookmark className="mx-auto mb-3 h-8 w-8 text-primary-glow" />
            <h2 className="font-display text-xl font-bold">Nothing saved yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Tap “Save for later” on any prompt to build your shortlist.
            </p>
            <Button asChild className="mt-5 bg-gradient-primary btn-glow">
              <Link to="/browse">Browse prompts</Link>
            </Button>
          </div>
        ) : (
          <PromptGrid prompts={prompts} loading={isLoading} />
        )}
      </div>
    </Layout>
  );
}
