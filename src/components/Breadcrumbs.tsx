import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  name: string;
  to?: string;
}

/**
 * Accessible visual breadcrumb trail. Improves crawl paths (works with the
 * page-level BreadcrumbList JSON-LD already emitted by SEO components) and
 * strengthens internal linking on prompt & category pages.
 */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`mb-5 flex items-center gap-1.5 overflow-x-auto text-sm text-muted-foreground ${className}`}
    >
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.name}-${i}`} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:text-foreground hover:underline"
                >
                  {i === 0 && <Home className="h-3.5 w-3.5" aria-hidden />}
                  <span>{item.name}</span>
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={`flex items-center gap-1 px-1 py-0.5 ${isLast ? "font-medium text-foreground" : ""}`}
                >
                  {i === 0 && <Home className="h-3.5 w-3.5" aria-hidden />}
                  <span className="max-w-[240px] truncate">{item.name}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
