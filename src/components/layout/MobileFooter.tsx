import { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ChevronDown, Facebook, Instagram, Twitter } from "lucide-react";

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

const mobileFooterSections = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse all prompts", to: "/browse" },
      { label: "Trending prompts", to: "/browse?sort=trending" },
      { label: "Free prompt packs", to: "/browse?price=free" },
      { label: "Sell your prompts", to: "/sell" },
      { label: "Pro membership", to: "/pro" },
    ],
  },
  {
    title: "AI Models",
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
      { label: "Copywriting", to: "/category/copywriting" },
      { label: "Make Money Online", to: "/category/make-money-online" },
      { label: "Business & Marketing", to: "/category/business-marketing" },
      { label: "AI Tools", to: "/category/ai-tools" },
    ],
  },
  {
    title: "Learn & Resources",
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
      { label: "Contact & support", to: "/contact" },
      { label: "Terms of Service", to: "/legal/terms" },
      { label: "Privacy Policy", to: "/legal/privacy" },
      { label: "Disclaimer", to: "/legal/disclaimer" },
      { label: "Refund Policy", to: "/legal/refunds" },
      { label: "Trust & Security", to: "/trust" },
      { label: "Site map", to: "/site-map" },
    ],
  },
];

export function MobileFooter() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };

  return (
    <footer id="mobile-footer" className="mt-12 border-t border-border/40 bg-card/40 pb-24 pt-8">
      <div className="px-4 space-y-6">
        {/* Brand identity */}
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 font-display text-base font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            Paste<span className="text-gradient">Prompts</span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The marketplace for AI prompts that actually work. Discover, buy and instantly copy high-performing prompts.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-2 pt-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-card/80 text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground active:scale-95"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Pure State Accordion Sections */}
        <div className="divide-y divide-border/30 border-y border-border/40">
          {mobileFooterSections.map((sec) => {
            const isOpen = openSection === sec.title;
            return (
              <div key={sec.title} className="py-1">
                <button
                  type="button"
                  onClick={() => toggleSection(sec.title)}
                  className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-foreground"
                >
                  <span>{sec.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pb-3 pt-1 animate-in fade-in-50 duration-200">
                    <ul className="space-y-2.5 pl-2">
                      {sec.links.map((l) => (
                        <li key={l.to}>
                          <Link
                            to={l.to}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors block py-0.5"
                          >
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Copyright */}
        <div className="space-y-2 pt-2 text-[11px] text-muted-foreground">
          <p>Copyright © {new Date().getFullYear()} Paste Prompts (pasteprompts.co.uk) · All rights reserved.</p>
          <p className="leading-normal">
            Prompts are user-generated. Report infringing content via our takedown form.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default MobileFooter;
