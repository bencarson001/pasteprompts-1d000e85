import { PromptCard, PromptCardData } from "@/components/PromptCard";
import { Skeleton } from "@/components/ui/skeleton";

export function PromptGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl glass p-5">
          <Skeleton className="mb-3 h-5 w-24" />
          <Skeleton className="mb-2 h-5 w-full" />
          <Skeleton className="mb-4 h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function PromptGrid({
  prompts,
  loading,
  emptyMessage = "No prompts found.",
}: {
  prompts: PromptCardData[];
  loading?: boolean;
  emptyMessage?: string;
}) {
  if (loading) return <PromptGridSkeleton />;
  if (!prompts.length) {
    return (
      <p className="rounded-2xl glass p-10 text-center text-muted-foreground">{emptyMessage}</p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {prompts.map((p, i) => (
        <PromptCard key={p.id} prompt={p} index={i} />
      ))}
    </div>
  );
}

export default PromptGrid;
