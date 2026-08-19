import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, Plus, Eye, ShoppingBag, Copy, Coins, FileText, Star,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyPrompts, fetchMySales, fetchMyBilling } from "@/lib/queries";
import { formatPrice, formatCount, timeAgo } from "@/lib/format";
import { UpgradeBanner } from "@/components/UpgradeBanner";

const statusStyles: Record<string, string> = {
  approved: "bg-success/15 text-success",
  pending: "bg-warning/15 text-warning",
  rejected: "bg-destructive/15 text-destructive",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const justSubscribed = params.get("subscribed") === "1";
  const justPublished = params.get("published") === "1";
  const { data: billing } = useQuery({ queryKey: ["my-billing", user?.id], enabled: !!user?.id, queryFn: fetchMyBilling });
  const { data: prompts, isLoading } = useQuery({ queryKey: ["my-prompts", user?.id], enabled: !!user?.id, queryFn: () => fetchMyPrompts(user!.id) });
  const { data: sales } = useQuery({ queryKey: ["my-sales", user?.id], enabled: !!user?.id, queryFn: () => fetchMySales(user!.id) });

  const totalViews = (prompts ?? []).reduce((s, p) => s + (p.views ?? 0), 0);
  const totalSales = (prompts ?? []).reduce((s, p) => s + (p.sales_count ?? 0), 0);
  const totalCopies = (prompts ?? []).reduce((s, p) => s + (p.copies_count ?? 0), 0);
  const earnings = billing?.total_earnings_pence ?? 0;
  const paidSalesCount = (sales ?? []).filter((s) => !s.is_free).length;
  const hasRecentSale = paidSalesCount > 0 && (sales?.[0] && !sales[0].is_free && (Date.now() - new Date(sales[0].created_at).getTime()) < 1000 * 60 * 60 * 24 * 7);

  const stats = [
    { label: "Prompts", value: formatCount(prompts?.length ?? 0), icon: FileText },
    { label: "Total views", value: formatCount(totalViews), icon: Eye },
    { label: "Sales", value: formatCount(totalSales), icon: ShoppingBag },
    { label: "Copies", value: formatCount(totalCopies), icon: Copy },
    { label: "Earnings", value: formatPrice(earnings, false), icon: Coins },
  ];

  return (
    <Layout>
      <SEO title="Creator Dashboard" description="Track your prompt performance, sales and earnings on Paste Prompts." canonical="/dashboard" noindex />
      <div className="container-wide py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold">Creator Dashboard</h1>
              <p className="text-sm text-muted-foreground">Your prompts, performance and payouts.</p>
            </div>
          </div>
          <Button asChild className="bg-gradient-primary btn-glow">
            <Link to="/sell"><Plus className="mr-1 h-4 w-4" /> New prompt</Link>
          </Button>
        </div>

        {justSubscribed && (
          <div className="mb-6 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm text-success">
            🎉 Welcome to your new plan — higher earnings are already active on every future sale.
          </div>
        )}

        <UpgradeBanner
          totalSales={paidSalesCount}
          variant={justPublished ? "post-publish" : hasRecentSale ? "post-sale" : "dashboard"}
          className="mb-8"
        />


        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl glass p-5">
              <s.icon className="mb-2 h-5 w-5 text-primary-glow" />
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="mb-4 font-display text-xl font-bold">Your prompts</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : !prompts?.length ? (
          <div className="rounded-3xl glass-strong p-12 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-primary-glow" />
            <h3 className="font-display text-lg font-bold">No prompts yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Publish your first prompt and start earning.</p>
            <Button asChild className="mt-5 bg-gradient-primary btn-glow"><Link to="/sell"><Plus className="mr-1 h-4 w-4" /> Create a prompt</Link></Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl glass">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Price</th>
                  <th className="hidden px-4 py-3 md:table-cell">Views</th>
                  <th className="px-4 py-3">Sales</th>
                  <th className="hidden px-4 py-3 md:table-cell">Rating</th>
                </tr>
              </thead>
              <tbody>
                {prompts.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-card/40">
                    <td className="px-4 py-3">
                      <Link to={`/prompt/${p.slug}`} className="font-medium hover:text-primary-glow">{p.title}</Link>
                      {p.featured && <Badge className="ml-2 bg-gradient-primary text-[10px]">Featured</Badge>}
                    </td>
                    <td className="px-4 py-3"><Badge className={`${statusStyles[p.status] ?? ""} capitalize`}>{p.status}</Badge></td>
                    <td className="hidden px-4 py-3 sm:table-cell">{formatPrice(p.price_pence, p.is_free)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">{formatCount(p.views)}</td>
                    <td className="px-4 py-3">{formatCount(p.sales_count)}</td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {p.rating_count > 0 ? p.rating_avg.toFixed(1) : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!!sales?.length && (
          <>
            <h2 className="mb-4 mt-12 font-display text-xl font-bold">Recent sales</h2>
            <div className="overflow-hidden rounded-2xl glass">
              <table className="w-full text-sm">
                <thead className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr><th className="px-4 py-3">Prompt</th><th className="px-4 py-3">Your earning</th><th className="px-4 py-3">When</th></tr>
                </thead>
                <tbody>
                  {sales.slice(0, 20).map((s) => (
                    <tr key={s.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3">{(s.prompt as unknown as { title: string })?.title ?? "Prompt"}</td>
                      <td className="px-4 py-3 text-success">{s.is_free ? "—" : formatPrice(s.creator_earning_pence ?? 0, false)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{timeAgo(s.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
