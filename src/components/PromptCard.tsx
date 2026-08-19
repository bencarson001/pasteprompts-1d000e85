import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatCount, MODEL_LABELS } from "@/lib/format";

export interface PromptCardData {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url?: string | null;
  model: string;
  price_pence: number;
  is_free: boolean;
  rating_avg: number;
  rating_count: number;
  sales_count: number;
  copies_count: number;
  featured?: boolean;
  category?: { slug: string; name: string } | null;
  creator?: { handle: string; display_name: string } | null;
}

export function PromptCard({ prompt, index = 0 }: { prompt: PromptCardData; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        to={prompt.category ? `/prompt/${prompt.category.slug}/${prompt.slug}` : `/prompt/${prompt.slug}`}
        className="card-hover group flex h-full flex-col overflow-hidden rounded-2xl glass"
      >
        {prompt.image_url ? (
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
            <img
              src={prompt.image_url}
              alt={prompt.title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-md text-xs font-medium text-white border-white/10">
                {prompt.category?.name ?? "Prompt"}
              </Badge>
              <Badge variant="outline" className="border-white/20 bg-black/60 backdrop-blur-md text-[10px] uppercase tracking-wide text-white/90">
                {MODEL_LABELS[prompt.model] ?? prompt.model}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="p-5 pb-0 flex items-center justify-between gap-2">
            <Badge variant="secondary" className="bg-secondary/70 text-xs font-medium">
              {prompt.category?.name ?? "Prompt"}
            </Badge>
            <Badge variant="outline" className="border-white/10 text-[10px] uppercase tracking-wide text-muted-foreground">
              {MODEL_LABELS[prompt.model] ?? prompt.model}
            </Badge>
          </div>
        )}

        <div className="flex flex-1 flex-col p-5">
          <h3 className="mb-1.5 line-clamp-2 font-display text-base font-semibold leading-snug group-hover:text-primary-glow">
            {prompt.title}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{prompt.description}</p>

          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {prompt.rating_count > 0 ? prompt.rating_avg.toFixed(1) : "New"}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5" />
                {formatCount(prompt.sales_count)}
              </span>
              <span className="hidden items-center gap-1 sm:flex">
                <Copy className="h-3.5 w-3.5" />
                {formatCount(prompt.copies_count)}
              </span>
            </div>
            <span className="font-display text-sm font-bold">
              {prompt.is_free ? (
                <span className="text-success">Free</span>
              ) : (
                formatPrice(prompt.price_pence)
              )}
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

export default PromptCard;
