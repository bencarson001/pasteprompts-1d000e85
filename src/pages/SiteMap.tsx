import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GUIDES } from "@/lib/guides";
import { CATEGORY_CONTENT } from "@/lib/categoryContent";
import { LANDING_PAGES } from "@/lib/landingContent";

const SITE_URL = "https://pasteprompts.co.uk";

interface Group {
  title: string;
  intro: string;
  links: { label: string; to: string }[];
}

const groups: Group[] = [
  {
    title: "Marketplace",
    intro: "Browse and filter every prompt listed on Paste Prompts.",
    links: [
      { label: "Home", to: "/" },
      { label: "Browse all prompts", to: "/browse" },
      { label: "Free prompts", to: "/browse/free" },
      { label: "Premium prompts", to: "/browse/paid" },
      { label: "Sell your prompts", to: "/sell" },
      { label: "Paste Prompts Pro", to: "/pro" },
    ],
  },
  {
    title: "Popular prompt collections",
    intro: "Curated landing pages for the models people search for most.",
    links: Object.values(LANDING_PAGES).map((l) => ({
      label: l.heading,
      to: `/prompts/${l.slug}`,
    })),
  },
  {
    title: "Categories",
    intro: "Prompt categories with buying advice and worked examples.",
    links: Object.entries(CATEGORY_CONTENT).map(([slug, c]) => ({
      label: c.title,
      to: `/category/${slug}`,
    })),
  },
  {
    title: "Guides & learning",
    intro: "Long-form, originally written guides to prompt engineering.",
    links: [
      { label: "All guides", to: "/guides" },
      { label: "AI prompt glossary", to: "/glossary" },
      ...GUIDES.map((g) => ({ label: g.title, to: `/guides/${g.slug}` })),
    ],
  },
  {
    title: "Company & legal",
    intro: "Who runs the site, how to reach us, and the policies you agree to.",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact & support", to: "/contact" },
      { label: "Trust & security", to: "/trust" },
      { label: "Editorial Standards & Quality Pipeline", to: "/editorial-standards" },
      { label: "DMCA & Copyright Takedowns", to: "/dmca" },
      { label: "Terms of Service", to: "/legal/terms" },
      { label: "Privacy Policy", to: "/legal/privacy" },
      { label: "Cookie Policy", to: "/legal/cookies" },
      { label: "Content & Editorial Policy", to: "/legal/content-policy" },
      { label: "Disclaimer", to: "/legal/disclaimer" },
      { label: "Refund Policy", to: "/legal/refunds" },
    ],
  },
  {
    title: "Your account",
    intro: "Sign-in required pages for buyers and creators.",
    links: [
      { label: "Sign in or create an account", to: "/auth" },
      { label: "Your library", to: "/library" },
      { label: "Saved prompts", to: "/saved" },
      { label: "Creator dashboard", to: "/dashboard" },
      { label: "Account settings", to: "/settings" },
    ],
  },
];

export default function SiteMap() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Paste Prompts site map",
    url: `${SITE_URL}/site-map`,
    description: "A complete HTML index of every public page on Paste Prompts.",
  };

  return (
    <Layout>
      <SEO
        title="Site Map — Every Page on Paste Prompts"
        description="A complete HTML site map of Paste Prompts: browse pages, prompt categories, model collections, prompt-engineering guides, glossary, and company and legal pages."
        canonical="/site-map"
        keywords="paste prompts site map, AI prompt site index, prompt marketplace pages"
        jsonLd={jsonLd}
      />
      <div className="container-wide py-10">
        <Breadcrumbs items={[{ name: "Site map" }]} />
        <header className="mt-4 max-w-2xl">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Site map</h1>
          <p className="mt-3 text-muted-foreground">
            Every public page on Paste Prompts in one place — useful if you would rather scan a list than use search.
            Prompt pages themselves are indexed continuously in our{" "}
            <a href="/sitemap.xml" className="text-primary underline underline-offset-4">
              XML sitemap
            </a>
            .
          </p>
        </header>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {groups.map((g) => (
            <section key={g.title} className="rounded-2xl border border-white/10 bg-card/40 p-6">
              <h2 className="font-display text-xl font-semibold">{g.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{g.intro}</p>
              <ul className="mt-4 space-y-2">
                {g.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}
