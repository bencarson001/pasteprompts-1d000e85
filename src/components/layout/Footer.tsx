import { Link } from "react-router-dom";
import { Sparkles, Facebook, Instagram, Twitter } from "lucide-react";

const socials = [
  { label: "Follow on X", href: "https://x.com/pasteprompts", icon: Twitter },
  { label: "Follow on Instagram", href: "https://instagram.com/pasteprompts", icon: Instagram },
  { label: "Follow on Facebook", href: "https://facebook.com/pasteprompts", icon: Facebook },
  {
    label: "Follow on TikTok",
    href: "https://tiktok.com/@pasteprompts",
    icon: (props: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className} aria-hidden="true">
        <path d="M16.5 3c.3 2.2 1.8 3.9 4 4.2v2.5c-1.4.1-2.7-.3-4-1v6.6a5.9 5.9 0 1 1-5.9-5.9c.3 0 .6 0 .9.1v2.6a3.3 3.3 0 1 0 2.3 3.2V3h2.7z" />
      </svg>
    ),
  },
];

const footerCols = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse all prompts", to: "/browse" },
      { label: "Free prompts", to: "/browse/free" },
      { label: "Trending prompts", to: "/browse?sort=trending" },
      { label: "Creators directory", to: "/creators" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "Sell your prompts", to: "/sell" },
    ],
  },
  {
    title: "Popular searches",
    links: [
      { label: "ChatGPT prompts", to: "/prompts/chatgpt-prompts" },
      { label: "Claude prompts", to: "/prompts/claude-prompts" },
      { label: "Gemini prompts", to: "/prompts/gemini-prompts" },
      { label: "Midjourney prompts", to: "/prompts/midjourney-prompts" },
      { label: "Free AI prompts", to: "/prompts/free-ai-prompts" },
    ],
  },
  {
    title: "Categories",
    links: [
      { label: "Marketing", to: "/browse?category=marketing" },
      { label: "Business", to: "/browse?category=business" },
      { label: "Coding & Dev", to: "/browse?category=coding" },
      { label: "Design & Art", to: "/browse?category=design" },
      { label: "Copywriting", to: "/category/copywriting" },
      { label: "Make Money Online", to: "/category/make-money-online" },
    ],
  },
  {
    title: "Learn & Guides",
    links: [
      { label: "All guides", to: "/guides" },
      { label: "AI prompt glossary", to: "/glossary" },
      { label: "How to write AI prompts", to: "/guides/how-to-write-effective-ai-prompts" },
      { label: "ChatGPT vs Claude vs Gemini", to: "/guides/chatgpt-vs-claude-vs-gemini" },
    ],
  },
  {
    title: "Company & Legal",
    links: [
      { label: "About us", to: "/about" },
      { label: "Editorial standards", to: "/editorial-standards" },
      { label: "Contact & support", to: "/contact" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Cookie Policy", to: "/cookies" },
      { label: "Disclaimer", to: "/disclaimer" },
      { label: "Refund Policy", to: "/refunds" },
      { label: "Trust & Security", to: "/trust" },
      { label: "DMCA & Takedowns", to: "/dmca" },
      { label: "Site map", to: "/site-map" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-card/30">
      <div className="container-wide grid grid-cols-2 gap-8 py-14 md:grid-cols-3 lg:grid-cols-7">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </span>
            Paste<span className="text-gradient">Prompts</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The marketplace for AI prompts that actually work. Discover, buy and instantly use high-performing prompts
            from top creators.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-card/60 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-glow"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="container-wide flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>Copyright © {new Date().getFullYear()} Paste Prompts (pasteprompts.co.uk) · All rights reserved.</p>
          <p>Prompts are user-generated. Report infringing content via our takedown form.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
