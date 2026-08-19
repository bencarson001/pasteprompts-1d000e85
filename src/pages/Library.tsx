import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Library as LibraryIcon, Bookmark, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptGrid } from "@/components/PromptGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyLibrary } from "@/lib/queries";
import type { PromptCardData } from "@/components/PromptCard";

export default function Library() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["library", user?.id],
    enabled: !!user?.id,
    queryFn: () => fetchMyLibrary(user!.id),
  });

  const prompts = (data ?? []).map((row) => row.prompt as unknown as PromptCardData);

  return (
    <Layout>
      <SEO title="My Library" description="Your purchased and free AI prompts — copy any of them in one click." canonical="/library" noindex />
      <div className="container-wide py-10">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
            <LibraryIcon className="h-5 w-5 text-primary-foreground" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-bold">My Library</h1>
            <p className="text-sm text-muted-foreground">Every prompt you own — copy-ready, any time.</p>
          </div>
        </div>

        {!isLoading && prompts.length === 0 ? (
          <div className="rounded-3xl glass-strong p-12 text-center">
            <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary-glow" />
            <h2 className="font-display text-xl font-bold">Your library is empty</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Browse the marketplace and grab a free prompt or two to get started.
            </p>
            <Button asChild className="mt-5 bg-gradient-primary btn-glow">
              <Link to="/browse"><Bookmark className="mr-1 h-4 w-4" /> Browse prompts</Link>
            </Button>
          </div>
        ) : (
          <PromptGrid prompts={prompts} loading={isLoading} />
        )}
      </div>
    </Layout>
  );
}
