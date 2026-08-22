import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, Gift, Search, Sparkles, Tag, Filter } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { PromptGrid } from "@/components/PromptGrid";
import { BrowseSidebar } from "@/components/browse/BrowseSidebar";
import { browsePath, categoryIcon, modelIcon, PRICE_LABELS } from "@/components/browse/browse-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchPrompts,
  fetchCategories,
  fetchCategoryBySlug,
  fetchCategoryCounts,
  fetchModelCounts,
  BrowseFilters,
} from "@/lib/queries";
import { MODELS, MODEL_LABELS } from "@/lib/format";

const PAGE_SIZE = 24;

function Breadcrumb({ price, model, category }: { price?: string; model?: string; category?: string }) {
  const crumbs: { label: string; to: string }[] = [{ label: "Browse", to: "/browse" }];
  if (price) crumbs.push({ label: PRICE_LABELS[price as keyof typeof PRICE_LABELS] ?? price, to: browsePath(price) });
  if (price && model)
    crumbs.push({ label: model === "all" ? "All platforms" : MODEL_LABELS[model] ?? model, to: browsePath(price, model) });
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
      {crumbs.map((c, i) => (
        <span key={c.to} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/50">/</span>}
          <Link to={c.to} className="hover:text-foreground">{c.label}</Link>
        </span>
      ))}
      {category && category !== "all" && (
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground/50">/</span>
          <span className="text-foreground">{category}</span>
        </span>
      )}
    </nav>
  );
}

/* ---------------- Step 1: choose price band ---------------- */
function PriceStep() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Browse prompts</h1>
        <p className="mt-2 text-muted-foreground">Step 1 of 3 — start with how much you want to spend.</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2">
        <Link to={browsePath("free")} className="card-hover group rounded-3xl glass p-8">
          <div className="mb-4 inline-flex rounded-2xl bg-success/15 p-3 text-success">
            <Gift className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold">Free prompts</h2>
          <p className="mt-2 text-muted-foreground">Hundreds of ready-to-use prompts you can copy right now — no sign-up needed.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary-glow">
            Choose free <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
        <Link to={browsePath("paid")} className="card-hover group rounded-3xl glass p-8">
          <div className="mb-4 inline-flex rounded-2xl bg-primary/15 p-3 text-primary-glow">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold">Paid prompts</h2>
          <p className="mt-2 text-muted-foreground">Premium, battle-tested prompts engineered for serious results and edge cases.</p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary-glow">
            Choose paid <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
      <div className="mt-6 text-center">
        <Button asChild variant="ghost">
          <Link to={browsePath("all")}>Skip — browse everything <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Step 2: choose AI platform ---------------- */
function ModelStep({ price }: { price: string }) {
  const { data: counts } = useQuery({
    queryKey: ["model-counts", price],
    queryFn: () => fetchModelCounts(price === "all" ? undefined : (price as BrowseFilters["price"])),
  });
  return (
    <div>
      <Breadcrumb price={price} />
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Pick an AI platform</h1>
        <p className="mt-2 text-muted-foreground">Step 2 of 3 — which tool are you prompting?</p>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link to={browsePath(price, "all", "all")} className="card-hover group rounded-2xl glass p-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-glow">
            <Sparkles className="h-6 w-6 text-primary-glow" />
          </div>
          <div className="font-semibold">All platforms</div>
        </Link>
        {MODELS.map((m) => {
          const Icon = modelIcon(m);
          const count = counts?.[m] ?? 0;
          return (
            <Link key={m} to={browsePath(price, m)} className="card-hover group rounded-2xl glass p-6 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-glow">
                <Icon className="h-6 w-6 text-primary-glow" />
              </div>
              <div className="font-semibold">{MODEL_LABELS[m]}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{count} prompt{count === 1 ? "" : "s"}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 3: choose category ---------------- */
function CategoryStep({ price, model }: { price: string; model: string }) {
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: counts } = useQuery({
    queryKey: ["category-counts", price, model],
    queryFn: () => fetchCategoryCounts(price === "all" ? undefined : (price as BrowseFilters["price"]), model),
  });
  return (
    <div>
      <Breadcrumb price={price} model={model} />
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Choose a category</h1>
        <p className="mt-2 text-muted-foreground">Step 3 of 3 — pick the topic you need prompts for.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to={browsePath(price, model, "all")} className="card-hover group rounded-2xl glass p-6">
          <div className="mb-3 inline-flex rounded-xl bg-gradient-glow p-2.5">
            <Tag className="h-5 w-5 text-primary-glow" />
          </div>
          <div className="font-display text-lg font-semibold">All categories</div>
          <p className="mt-1 text-sm text-muted-foreground">See every matching prompt at once.</p>
        </Link>
        {(categories ?? []).map((c) => {
          const Icon = categoryIcon(c.icon);
          const count = counts?.[c.id] ?? 0;
          return (
            <Link key={c.id} to={browsePath(price, model, c.slug)} className="card-hover group rounded-2xl glass p-6">
              <div className="mb-3 inline-flex rounded-xl bg-gradient-glow p-2.5">
                <Icon className="h-5 w-5 text-primary-glow" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-semibold">{c.name}</span>
                <span className="text-xs text-muted-foreground">· {count}</span>
              </div>
              {c.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Results view ---------------- */
function ResultsView({
  price,
  model,
  category,
}: {
  price?: string;
  model?: string;
  category?: string;
}) {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const priceFilter = price && price !== "all" ? (price as BrowseFilters["price"]) : undefined;
  const modelFilter = model && model !== "all" ? model : undefined;
  const categoryFilter = category && category !== "all" ? category : undefined;

  const { data: cat } = useQuery({
    queryKey: ["category", categoryFilter],
    queryFn: () => (categoryFilter ? fetchCategoryBySlug(categoryFilter) : Promise.resolve(null)),
    enabled: !!categoryFilter,
  });

  const filters: BrowseFilters = {
    q: params.get("q") ?? undefined,
    categorySlug: categoryFilter,
    model: modelFilter,
    price: priceFilter,
    sort: (params.get("sort") as BrowseFilters["sort"]) ?? "trending",
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
  };

  useEffect(() => setPage(0), [params, price, model, category]);

  const { data: prompts, isLoading } = useQuery({
    queryKey: ["browse-results", price, model, category, params.toString()],
    queryFn: () => fetchPrompts(filters),
  });

  const heading = useMemo(() => {
    if (params.get("q")) return `Results for “${params.get("q")}”`;
    const parts: string[] = [];
    if (priceFilter) parts.push(PRICE_LABELS[priceFilter as keyof typeof PRICE_LABELS]);
    if (cat?.name) parts.push(cat.name);
    else if (modelFilter) parts.push(MODEL_LABELS[modelFilter] ?? modelFilter);
    return parts.length ? `${parts.join(" · ")} prompts` : "All prompts";
  }, [params, priceFilter, modelFilter, cat]);

  const updateSort = (value: string) => {
    const next = new URLSearchParams(params);
    if (value && value !== "trending") next.set("sort", value);
    else next.delete("sort");
    setParams(next, { replace: true });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params);
    if (q) next.set("q", q);
    else next.delete("q");
    navigate(`${browsePath(price ?? "all", model ?? "all", category ?? "all")}?${next.toString()}`);
  };

  return (
    <div>
      <Breadcrumb price={price} model={model} category={cat?.name ?? category} />
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{heading}</h1>
        <p className="mt-2 text-muted-foreground">
          {prompts?.length ?? 0} results · {cat?.description ?? "find a prompt for exactly what you're building."}
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="browse-search" className="sr-only">
            Search prompts
          </label>
          <Input
            id="browse-search"
            type="search"
            aria-label="Search prompts"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search prompts, descriptions, tags…"
            className="h-11 pl-10 bg-card/60 border-white/10"
          />
        </form>
        <Select value={params.get("sort") ?? "trending"} onValueChange={updateSort}>
          <SelectTrigger className="h-11 w-full sm:w-[160px] bg-card/60 border-white/10">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trending">Trending</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rated">Top rated</SelectItem>
            <SelectItem value="popular">Most sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PromptGrid
        prompts={(prompts ?? []) as never}
        loading={isLoading}
        emptyMessage="No prompts match your filters. Try widening your search."
      />

      {!!prompts?.length && prompts.length >= PAGE_SIZE && (
        <div className="mt-10 flex justify-center gap-3">
          <Button variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Previous
          </Button>
          <span className="grid place-items-center px-3 text-sm text-muted-foreground">Page {page + 1}</span>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Next <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ---------------- Page shell ---------------- */
export default function Browse() {
  const { price, model, category } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Back-compat: convert legacy query-param links to the guided path.
  useEffect(() => {
    if (price) return;
    const qp = params.get("price");
    const cp = params.get("category");
    const mp = params.get("model");
    const sp = params.get("sort");
    const search = params.get("q");
    if (qp || cp || mp || sp || search) {
      const next = new URLSearchParams();
      if (search) next.set("q", search);
      if (sp) next.set("sort", sp);
      const target = browsePath(qp ?? "all", mp ?? "all", cp ?? "all");
      navigate(next.toString() ? `${target}?${next.toString()}` : target, { replace: true });
    }
  }, [price, params, navigate]);

  // Decide which step / view to render.
  const hasSearch = !!params.get("q");
  let content: React.ReactNode;
  let showSidebar = true;

  if (hasSearch) {
    content = <ResultsView price={price} model={model} category={category} />;
  } else if (!price) {
    content = <PriceStep />;
    showSidebar = false;
  } else if (!model) {
    content = <ModelStep price={price} />;
  } else if (!category) {
    content = <CategoryStep price={price} model={model} />;
  } else {
    content = <ResultsView price={price} model={model} category={category} />;
  }

  // Canonical points at the current guided-browse path so filter combinations don't
  // collide with the root /browse in Google's index. Search queries (?q=) and
  // intermediate step pages are noindexed — they're navigation, not content.
  const canonicalPath = price ? browsePath(price, model, category) : "/browse";
  const isStepPage = !hasSearch && (!price || !model || !category);
  return (
    <Layout>
      <SEO
        title="Browse AI prompts"
        description="Browse high-performing AI prompts — filter by free or paid, AI platform and category. Prompts for ChatGPT, Claude, Gemini and more."
        canonical={canonicalPath}
        noindex={hasSearch || isStepPage}
      />

      <div className="container-wide py-10">
        {showSidebar ? (
          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl glass p-4">
                <p className="mb-4 flex items-center gap-2 px-3 text-sm font-semibold">
                  <Filter className="h-4 w-4 text-primary-glow" /> Filters
                </p>
                <BrowseSidebar price={price} model={model} category={category} />
              </div>
            </aside>
            <div>
              <div className="mb-4 lg:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="border-white/10">
                      <Filter className="mr-2 h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <BrowseSidebar
                        price={price}
                        model={model}
                        category={category}
                        onNavigate={() => setSheetOpen(false)}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              {content}
            </div>
          </div>
        ) : (
          content
        )}
      </div>
    </Layout>
  );
}
