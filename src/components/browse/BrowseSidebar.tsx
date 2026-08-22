import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCategories } from "@/lib/queries";
import { MODELS, MODEL_LABELS } from "@/lib/format";
import { browsePath, categoryIcon, modelIcon, PRICE_LABELS, type PriceBand } from "./browse-utils";

interface BrowseSidebarProps {
  price?: string;
  model?: string;
  category?: string;
  onNavigate?: () => void;
}

const PRICE_BANDS: PriceBand[] = ["free", "paid", "all"];

export function BrowseSidebar({ price, model, category, onNavigate }: BrowseSidebarProps) {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { search } = useLocation();

  // Preserve the active sort when navigating between filters.
  const sort = new URLSearchParams(search).get("sort");
  const withSort = (path: string) => (sort ? `${path}?sort=${sort}` : path);

  const Row = ({
    to,
    active,
    icon: Icon,
    label,
    count,
  }: {
    to: string;
    active: boolean;
    icon?: React.ComponentType<{ className?: string }>;
    label: string;
    count?: number;
  }) => (
    <Link
      to={withSort(to)}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        active
          ? "bg-primary/15 font-semibold text-foreground"
          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
      )}
    >
      {Icon && <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-glow" : "")} />}
      <span className="flex-1 truncate">{label}</span>
      {typeof count === "number" && (
        <span className="text-xs tabular-nums text-muted-foreground/70">{count}</span>
      )}
      {active && <Check className="h-3.5 w-3.5 text-primary-glow" />}
    </Link>
  );

  return (
    <nav aria-label="Prompt filters" className="space-y-6">
      <div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Price
        </p>
        <div className="space-y-0.5">
          {PRICE_BANDS.map((band) => (
            <Row
              key={band}
              to={browsePath(band, model, category)}
              active={price === band}
              label={PRICE_LABELS[band]}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          AI Platform
        </p>
        <div className="space-y-0.5">
          <Row
            to={browsePath(price ?? "all", "all", category)}
            active={!model || model === "all"}
            label="All platforms"
          />
          {MODELS.map((m) => (
            <Row
              key={m}
              to={browsePath(price ?? "all", m, category)}
              active={model === m}
              icon={modelIcon(m)}
              label={MODEL_LABELS[m]}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Category
        </p>
        <div className="space-y-0.5">
          <Row
            to={browsePath(price ?? "all", model ?? "all", "all")}
            active={!category || category === "all"}
            label="All categories"
          />
          {(categories ?? []).map((c) => (
            <Row
              key={c.id}
              to={browsePath(price ?? "all", model ?? "all", c.slug)}
              active={category === c.slug}
              icon={categoryIcon(c.icon)}
              label={c.name}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default BrowseSidebar;
