import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, Sparkles, Zap, ShieldCheck, TrendingUp, FileText, Gift, Bookmark, 
  Check, UserPlus, Award, Wallet, Banknote, Star, Quote, Mail, Lock, 
  Megaphone, Briefcase, Code, Paintbrush, Play, PenTool, CheckCircle2,
  Search, SlidersHorizontal, Eye, Flame, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { fetchPrompts } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const faqs = [
  {
    q: "Is Paste Prompts free to use?",
    a: "Yes. Creating an account is completely free, and there are hundreds of free prompts you can copy and use instantly — no payment needed to get started.",
  },
  {
    q: "What do I get with a free account?",
    a: "A free account lets you save prompts to your library, get free prompts, follow your favourite creators, and unlock new releases the moment they drop.",
  },
  {
    q: "Which AI models do these prompts work with?",
    a: "Every prompt is written to copy and paste straight into ChatGPT, Claude, Gemini and other leading AI models.",
  },
  {
    q: "Can I sell my own prompts?",
    a: "Absolutely. Upload your best prompts, set your price, and get paid automatically when they sell.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

function useStats() {
  return useQuery({
    queryKey: ["home-stats"],
    queryFn: async () => {
      const { count: prompts } = await supabase
        .from("prompts")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved");
      return { prompts: prompts ?? 0 };
    },
  });
}

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModel, setActiveModel] = useState("all");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const { data: trending } = useQuery({ 
    queryKey: ["trending-home"], 
    queryFn: () => fetchPrompts({ sort: "trending", limit: 4 }) 
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/browse");
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  // Curated showcase prompts highlighting world-class diversity
  const showcaseFeatured = {
    id: "feat-hero-1",
    title: "Cinematic 8K Hyper-Realistic Studio Portraits",
    price_pence: 499,
    rating_avg: 5.0,
    rating_count: 248,
    model: "Midjourney v6.1",
    category: "Photography & Art",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    creator: { display_name: "ApexVisuals", sales: "1.4k sales" },
    slug: "browse"
  };

  const showcaseSecondary = [
    {
      id: "feat-hero-2",
      title: "SaaS Cold Outreach & Email Closing Playbook",
      price_pence: 699,
      rating_avg: 4.9,
      rating_count: 182,
      model: "ChatGPT / Claude",
      category: "Marketing",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      creator: { display_name: "GrowthCopy" },
      slug: "browse"
    },
    {
      id: "feat-hero-3",
      title: "Photorealistic 3D Luxury Product Mockups",
      price_pence: 599,
      rating_avg: 5.0,
      rating_count: 94,
      model: "Flux Pro",
      category: "Design",
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
      creator: { display_name: "StudioRender" },
      slug: "browse"
    }
  ];

  const topPrompts = [
    {
      id: "top-1",
      title: "Ultimate Content Creator Bundle",
      price_pence: 999,
      rating_avg: 5.0,
      rating_count: 175,
      model: "ChatGPT",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      creator: { display_name: "PromptPro" }
    },
    {
      id: "top-2",
      title: "Midjourney Master Collection",
      price_pence: 1299,
      rating_avg: 5.0,
      rating_count: 116,
      model: "Midjourney",
      image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
      creator: { display_name: "AI Artist" }
    },
    {
      id: "top-3",
      title: "Business Growth Toolkit",
      price_pence: 899,
      rating_avg: 4.9,
      rating_count: 76,
      model: "Claude",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
      creator: { display_name: "GrowthHacks" }
    },
    {
      id: "top-4",
      title: "Coding Assistant Pro",
      price_pence: 799,
      rating_avg: 5.0,
      rating_count: 63,
      model: "ChatGPT",
      image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80",
      creator: { display_name: "DevPrompt" }
    }
  ];

  // Merge with real database entries if they are loaded
  const displayTrending = trending && trending.length > 0 
    ? trending.map((p, index) => ({
        id: p.id,
        title: p.title,
        price_pence: p.price_pence || 0,
        rating_avg: p.rating_avg || 5.0,
        rating_count: p.rating_count || (120 - index * 15),
        model: p.model || "ChatGPT",
        image: topPrompts[index % 4].image,
        creator: { display_name: p.creator?.display_name || topPrompts[index % 4].creator.display_name },
        slug: p.slug
      }))
    : topPrompts.map((p) => ({ ...p, slug: "browse" }));

  const modelQuickFilters = [
    { label: "All", value: "all", icon: "✨" },
    { label: "Midjourney", value: "midjourney", icon: "🎨" },
    { label: "ChatGPT", value: "chatgpt", icon: "💬" },
    { label: "Claude", value: "claude", icon: "🧠" },
    { label: "Flux", value: "flux", icon: "⚡" },
    { label: "DALL-E", value: "dall-e", icon: "🖼️" },
    { label: "Gemini", value: "gemini", icon: "🔮" },
  ];

  return (
    <Layout>
      <SEO
        title="Free AI prompts that actually work | Buy & Sell Top Prompts"
        description="Discover, save and instantly use high-performing AI prompts for Midjourney, ChatGPT, Claude & Gemini. Top marketplace to buy and sell prompts."
        canonical="/"
        jsonLd={faqSchema}
      />

      {/* Modern Split Hero Section: Elite Marketplace Experience */}
      <section className="relative overflow-hidden pt-6 pb-8 lg:pt-8 lg:pb-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background border-b border-white/5">
        {/* Subtle background ambient glows */}
        <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -z-10 h-80 w-80 rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

        <div className="container-wide">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
            
            {/* Left Column: Headline, Search Engine, Model Filter Pills, Trust & Action */}
            <div className="flex flex-col text-left lg:col-span-7">
              
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black tracking-wider text-primary-glow mb-3.5 w-fit"
              >
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-white font-extrabold">#1 AI PROMPT MARKETPLACE</span>
                <span className="text-muted-foreground">•</span>
                <span>12,000+ Active Users</span>
              </motion.div>

              {/* High-Impact Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] font-black tracking-tight leading-[1.08] text-white"
              >
                The Home of Premium <br className="hidden sm:inline" />
                <span className="text-primary-glow shadow-glow-text bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                  AI Prompts &amp; Engineering
                </span>
              </motion.h1>

              {/* Punchy Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-2.5 max-w-xl text-xs sm:text-sm md:text-base text-muted-foreground font-medium leading-relaxed"
              >
                Find proven, copy-paste prompts for <strong className="text-white font-semibold">Midjourney, ChatGPT, Claude, Flux &amp; DALL-E</strong>. Generate studio-grade visuals and content in seconds, or sell your best prompts and keep 90%.
              </motion.p>

              {/* Instant Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-4 sm:mt-5"
              >
                <form 
                  onSubmit={handleSearch}
                  className="relative flex items-center rounded-2xl bg-[#0b0a13] border border-white/15 p-1.5 shadow-2xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
                >
                  <Search className="ml-3 h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 5,000+ prompts (e.g. 'Photorealistic portrait', 'SaaS email', 'Logo design')..."
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-white font-black text-xs px-4 sm:px-6 h-9 rounded-xl shadow-glow shrink-0 uppercase tracking-wider"
                  >
                    Search
                  </Button>
                </form>

                {/* Quick Model Filter Chips */}
                <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3" /> Trending:
                  </span>
                  {modelQuickFilters.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setActiveModel(m.value);
                        navigate(m.value === "all" ? "/browse" : `/browse?model=${encodeURIComponent(m.label)}`);
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all shrink-0 border ${
                        activeModel === m.value 
                          ? "bg-primary/20 text-primary-glow border-primary/50 shadow-sm" 
                          : "bg-white/5 text-muted-foreground border-white/5 hover:border-white/15 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Action Buttons & Micro Trust */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 flex flex-wrap items-center gap-3"
              >
                <Button asChild className="bg-primary hover:bg-primary/90 text-white font-black rounded-xl h-10 px-5 shadow-glow text-xs uppercase tracking-wider">
                  <Link to="/browse" className="flex items-center gap-1.5">
                    Explore Prompts <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-primary/30 bg-[#0b0a13]/80 text-white hover:text-primary-glow hover:bg-white/5 font-black rounded-xl h-10 px-5 text-xs uppercase tracking-wider">
                  <Link to="/sell">Sell &amp; Earn 90%</Link>
                </Button>
              </motion.div>

              {/* Micro Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-4 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[10px] sm:text-[11px] font-bold text-muted-foreground"
              >
                <span className="flex items-center gap-1 text-emerald-400">
                  <Check className="h-3 w-3 stroke-[3]" /> Tested &amp; Verified Output
                </span>
                <span className="flex items-center gap-1 text-primary-glow">
                  <Zap className="h-3 w-3 fill-primary-glow" /> 1-Click Instant Copy
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" /> 4.9/5 Average Rating
                </span>
              </motion.div>

            </div>

            {/* Right Column: Live High-Impact Showcase Deck */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Showcase Featured Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  className="group relative rounded-2xl bg-[#0b0a13] border border-white/10 overflow-hidden shadow-xl transition-all duration-300 hover:border-primary/40 max-w-sm mx-auto"
                >
                  {/* Top Header inside card */}
                  <div className="flex items-center justify-between px-3 py-2 bg-black/40 border-b border-white/5 text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-primary-glow">
                      <Flame className="h-3 w-3 fill-primary-glow" /> #1 Featured
                    </span>
                    <span className="text-muted-foreground font-semibold">
                      {showcaseFeatured.category}
                    </span>
                  </div>

                  {/* Image with live badges - reduced aspect ratio */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <img 
                      src={showcaseFeatured.image} 
                      alt={showcaseFeatured.title} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    
                    {/* Model Badge */}
                    <div className="absolute bottom-2 left-2">
                      <span className="rounded-lg bg-black/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-black text-white uppercase tracking-wider border border-white/10 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5 text-primary-glow" /> {showcaseFeatured.model}
                      </span>
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-xs transition-opacity duration-300">
                      <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white font-black text-[10px] rounded-xl shadow-glow">
                        <Link to="/browse" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Details
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Card Details - more compact */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-black text-white text-xs leading-snug line-clamp-1 group-hover:text-primary-glow transition-colors">
                        {showcaseFeatured.title}
                      </h3>
                      <span className="font-display text-xs font-black text-primary-glow shrink-0">
                        {formatPrice(showcaseFeatured.price_pence)}
                      </span>
                    </div>

                    {/* Creator and Rating Footer */}
                    <div className="mt-2 pt-2 flex items-center justify-between border-t border-white/5 text-[9px]">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/25 text-[8px] font-black text-primary-glow border border-primary/20">
                          {showcaseFeatured.creator.display_name[0]}
                        </span>
                        <span className="font-bold text-white">
                          {showcaseFeatured.creator.display_name}
                        </span>
                        <span className="text-[8px] text-muted-foreground font-semibold">
                          ({showcaseFeatured.creator.sales})
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-black text-amber-400">
                        <Star className="h-2.5 w-2.5 fill-amber-400" />
                        <span>5.0</span>
                        <span className="text-muted-foreground text-[8px] font-semibold">({showcaseFeatured.rating_count})</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Secondary Mini Cards for Depth */}
                <div className="mt-3 grid grid-cols-2 gap-2.5">
                  {showcaseSecondary.map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.25 + idx * 0.1 }}
                      onClick={() => navigate("/browse")}
                      className="group cursor-pointer rounded-xl bg-[#0b0a13] border border-white/5 p-2 sm:p-2.5 hover:border-primary/30 transition-all flex items-center gap-2 sm:gap-2.5"
                    >
                      <img 
                        src={s.image} 
                        alt={s.title} 
                        className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover shrink-0 border border-white/5 group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <span className="block text-[9px] font-black text-primary-glow uppercase tracking-wider truncate">
                          {s.model}
                        </span>
                        <h4 className="font-bold text-white text-[10px] sm:text-[11px] truncate leading-tight mt-0.5 group-hover:text-white">
                          {s.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground mt-1">
                          <span className="text-white font-extrabold">{formatPrice(s.price_pence)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star className="h-2.5 w-2.5 fill-amber-400" /> 5.0
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sleek High-Density Trust Metrics Bar */}
      <section className="border-b border-white/5 bg-[#08070e]/80 py-3 sm:py-3.5">
        <div className="container-wide">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:divide-x md:divide-white/5">
            {[
              { icon: UsersIcon, value: "12,000+", label: "Happy Customers" },
              { icon: Sparkles, value: "5,000+", label: "Tested Prompts" },
              { icon: Award, value: "600+", label: "Expert Creators" },
              { icon: Wallet, value: "£120K+", label: "Paid to Creators" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-center gap-2.5 px-2">
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary-glow">
                  <item.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
                <div className="text-left">
                  <div className="font-display text-xs sm:text-sm font-black text-white leading-none">{item.value}</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold mt-0.5">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Selling Prompts Section exactly matching image layout */}
      <section className="container-wide py-7">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span className="text-amber-400">🔥</span> Top Selling Prompts
            </h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
              The most popular AI prompts bought and rated by the community this week
            </p>
          </div>
          <Link to="/browse?sort=trending" className="text-xs font-black text-primary-glow hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:gap-6 lg:grid-cols-4">
          {displayTrending.map((p, i) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group flex flex-col rounded-2xl bg-[#0b0a13] border border-white/5 overflow-hidden shadow-2xl transition-all duration-300 hover:border-primary/30 hover:translate-y-[-2px]"
            >
              {/* Product Cover Card Image */}
              <div className="relative aspect-[4/3] lg:aspect-[16/10] w-full overflow-hidden">
                {/* Rank Corner Badge exactly as image design */}
                <div className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-20 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md font-display text-[9px] sm:text-[11px] font-black text-white ${
                  i === 0 ? "bg-amber-500 shadow-md" : i === 1 ? "bg-primary" : i === 2 ? "bg-red-500" : "bg-neutral-800"
                }`}>
                  {i + 1}
                </div>

                <img 
                  src={p.image} 
                  alt={p.title} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Model badge inside image at bottom-left */}
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-20">
                  <span className="rounded bg-black/80 backdrop-blur-sm px-2 py-0.5 text-[8px] sm:text-[10px] font-black text-white uppercase tracking-wider border border-white/5">
                    {p.model}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-3 sm:p-3.5">
                <h3 className="font-display font-black text-white text-[11px] sm:text-xs lg:text-[13px] leading-snug group-hover:text-primary-glow transition-colors line-clamp-2 min-h-[1.5rem] sm:min-h-[2rem]">
                  <Link to={p.slug ? `/browse` : "#"}>{p.title}</Link>
                </h3>

                {/* Pricing & Rating on single line */}
                <div className="mt-1.5 pt-1.5 sm:mt-2.5 sm:pt-2.5 flex items-center justify-between border-t border-white/5">
                  <span className="font-display text-xs sm:text-sm font-black text-white">
                    {formatPrice(p.price_pence)}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-white">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    {p.rating_avg.toFixed(1)} <span className="text-[9px] text-muted-foreground font-semibold">({p.rating_count})</span>
                  </span>
                </div>

                {/* Creator signature row */}
                <div className="mt-1.5 pt-1.5 sm:mt-2 sm:pt-2 flex items-center gap-1.5 border-t border-white/5">
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/25 text-[8px] text-primary-glow font-black border border-primary/20">
                    {p.creator.display_name.slice(0, 1)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground truncate">
                    {p.creator.display_name}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Dual Spotlight Modules matching image exactly */}
      <section className="container-wide py-8">
        <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
          {/* Left Module: Creator Spotlight */}
          <div className="rounded-3xl border border-white/5 bg-[#0b0a13] p-6 lg:p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs lg:text-sm font-black text-primary-glow">
                <Star className="h-4 w-4 fill-primary text-primary" /> Creator Spotlight
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <span className="flex h-12 w-12 lg:h-14 lg:w-14 items-center justify-center rounded-full bg-gradient-primary p-0.5 shadow-glow">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                      className="h-full w-full object-cover rounded-full" 
                      alt="Spotlight Prompt Engineer Avatar" 
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white border border-card">
                    ✓
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-base lg:text-lg font-black text-white">PromptPro</h3>
                  <div className="text-[11px] lg:text-xs font-bold text-primary-glow">Top Creator</div>
                  <p className="mt-0.5 text-xs text-muted-foreground font-medium">Specializing in marketing &amp; content creation prompts.</p>
                </div>
              </div>

              {/* Spotlight Stats */}
              <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-4 mb-5">
                <div>
                  <div className="font-display text-sm lg:text-base font-black text-white flex items-center gap-1">
                    <Star className="h-3 w-3 text-primary fill-primary" /> 1,245
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">Sales</div>
                </div>
                <div>
                  <div className="font-display text-sm lg:text-base font-black text-white">
                    4.9 ★
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">Rating</div>
                </div>
                <div>
                  <div className="font-display text-sm lg:text-base font-black text-white">
                    50+
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">Prompts</div>
                </div>
              </div>
            </div>

            <Button onClick={() => navigate("/browse")} className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 transition-all text-xs tracking-wider uppercase">
              View Profile
            </Button>
          </div>

          {/* Right Module: Earn as Creator */}
          <div className="rounded-3xl border border-white/5 bg-[#0b0a13] p-6 lg:p-8 relative overflow-hidden flex flex-col justify-between min-h-[340px]">
            <div className="absolute right-6 top-6 flex flex-col gap-2 pointer-events-none select-none opacity-20">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-primary-glow font-black text-sm">£</span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary-glow font-black text-base translate-x-2">$</span>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs lg:text-sm font-black text-primary-glow">
                <Banknote className="h-4 w-4" /> Earn as Creator
              </div>
              <h3 className="font-display text-lg lg:text-xl font-black text-white mb-4">Turn your knowledge into income</h3>

              <ul className="space-y-2.5 mb-5">
                {[
                  "Easy to get started — Instant approvals",
                  "Set your own prices & Keep up to 90%",
                  "Fast weekly payouts direct to your bank",
                  "Grow your audience & brand across the globe"
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span className="text-xs lg:text-[13px] font-bold text-muted-foreground">{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={() => navigate("/sell")} className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 transition-all text-xs tracking-wider uppercase">
              Start Selling Now
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid Section */}
      <section id="categories" className="container-wide py-8 scroll-mt-24">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl lg:text-2xl font-black text-white">Popular Categories</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Explore by industry and specialized use case</p>
          </div>
          <Link to="/browse" className="text-xs font-black text-primary-glow hover:text-white flex items-center gap-1 transition-colors uppercase tracking-wider">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Marketing", count: "120+ prompts", icon: Megaphone, slug: "marketing" },
            { label: "Business", count: "98+ prompts", icon: Briefcase, slug: "business" },
            { label: "Coding", count: "150+ prompts", icon: Code, slug: "coding" },
            { label: "Design", count: "85+ prompts", icon: Paintbrush, slug: "design" },
            { label: "YouTube", count: "60+ prompts", icon: Play, slug: "youtube" },
            { label: "Writing", count: "110+ prompts", icon: PenTool, slug: "writing" }
          ].map((item, index) => (
            <Link
              key={index}
              to={`/browse?category=${item.slug}`}
              className="group flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-2xl bg-[#0b0a13] border border-white/5 transition-all duration-300 hover:border-primary/30 hover:bg-white/5"
            >
              <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary transition-transform group-hover:scale-105">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="font-display font-black text-white text-xs sm:text-sm leading-tight group-hover:text-primary-glow transition-colors">{item.label}</div>
              <div className="mt-1 text-[10px] text-muted-foreground font-semibold">{item.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container-wide py-12 scroll-mt-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-black tracking-wider text-primary-glow mb-3 uppercase">
            <Sparkles className="h-3 w-3" /> Step-by-Step Guide
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            How Paste Prompts Works
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Whether you want to discover studio-grade AI prompts or monetize your prompt engineering skills, getting started takes less than 60 seconds.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Step 1 */}
          <div className="rounded-2xl border border-white/5 bg-[#0b0a13] p-6 relative overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all group">
            <div className="absolute top-4 right-4 font-display text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
              01
            </div>
            <div>
              <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary-glow mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-black text-white mb-2">
                1. Discover &amp; Filter
              </h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                Browse thousands of tested prompts across ChatGPT, Claude, Gemini, Midjourney, and Flux. Filter by price, category, and community ratings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-primary-glow">Over 5,000+ Templates</span>
              <Link to="/browse" className="text-xs font-bold text-white hover:text-primary-glow flex items-center gap-1">
                Explore <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-white/5 bg-[#0b0a13] p-6 relative overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all group">
            <div className="absolute top-4 right-4 font-display text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
              02
            </div>
            <div>
              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-black text-white mb-2">
                2. Test &amp; 1-Click Copy
              </h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                View verified generation outputs and test parameters. Fill in dynamic placeholders like <code className="text-primary-glow text-[11px]">[YOUR NICHE]</code> and copy directly to your clipboard.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400">Zero Setup Required</span>
              <Link to="/browse?price=free" className="text-xs font-bold text-white hover:text-emerald-400 flex items-center gap-1">
                Free Prompts <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-white/5 bg-[#0b0a13] p-6 relative overflow-hidden flex flex-col justify-between hover:border-primary/30 transition-all group">
            <div className="absolute top-4 right-4 font-display text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
              03
            </div>
            <div>
              <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mb-4">
                <Banknote className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base sm:text-lg font-black text-white mb-2">
                3. Sell &amp; Earn 90%
              </h3>
              <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed">
                Prompt engineers and creators can upload verified prompts, set competitive pricing, and keep up to 90% of every sale with automatic weekly Stripe bank payouts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-400">Instant Creator Approval</span>
              <Link to="/sell" className="text-xs font-bold text-white hover:text-amber-400 flex items-center gap-1">
                Start Selling <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Newsletter Block */}
      <section className="container-wide py-8">
        <div className="rounded-3xl border border-white/5 bg-[#0b0a13] p-6 md:p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-lg">
              <h2 className="font-display text-xl lg:text-2xl font-black text-white">Stay in the Loop</h2>
              <p className="mt-1 text-xs lg:text-sm text-muted-foreground font-semibold">
                Get the best new prompts, creator discounts &amp; weekly exclusive drops.
              </p>
            </div>

            <div className="w-full md:w-auto flex-1 max-w-md">
              {subscribed ? (
                <div className="rounded-xl bg-primary/10 border border-primary/30 p-3 text-center text-xs font-semibold text-primary">
                  ✓ Awesome! You are officially subscribed to our prompt drop list.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative flex items-center bg-black/40 border border-white/10 rounded-full p-1.5 w-full focus-within:border-primary/40 transition-colors">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-transparent text-xs lg:text-sm text-white px-3 py-1.5 w-full focus:outline-none focus:ring-0"
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-black text-xs rounded-full h-9 px-6 transition-all shrink-0 uppercase tracking-wider">
                    Subscribe
                  </Button>
                </form>
              )}
              <div className="mt-2 text-left text-[10px] text-muted-foreground/60 font-semibold">
                No spam, unsubscribe anytime.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Footer Row */}
      <section className="container-wide py-8 border-t border-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {[
            { icon: Zap, title: "Instant Access", desc: "Get prompts immediately" },
            { icon: Lock, title: "Secure Payments", desc: "Safe 256-bit encrypted checkout" },
            { icon: Award, title: "Quality Guaranteed", desc: "100% verified test outputs" },
            { icon: CheckCircle2, title: "24/7 Support", desc: "Dedicated support team" }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <badge.icon className="h-4 w-4" />
              </span>
              <div>
                <h4 className="font-display font-black text-white text-xs sm:text-sm">{badge.title}</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground font-semibold leading-normal mt-0.5">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Section */}
      <section className="container-wide py-10 border-t border-white/5">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl lg:text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="mt-1 text-xs lg:text-sm text-muted-foreground font-semibold">Everything you need to know before you get started.</p>
        </div>
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {faqs.map((f) => (
            <div key={f.q} className="rounded-2xl bg-[#0b0a13] border border-white/5 p-5 lg:p-6">
              <h3 className="flex items-start gap-2 font-display font-bold text-white text-sm lg:text-base">
                <span className="text-primary font-black">Q.</span> {f.q}
              </h3>
              <p className="mt-2 text-xs lg:text-sm text-muted-foreground leading-relaxed font-medium">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}

// Inline fallback components for Lucide compatibility
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

