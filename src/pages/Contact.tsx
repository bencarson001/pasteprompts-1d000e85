import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, MessageSquare, ShieldAlert, Clock, LifeBuoy, Store, BookOpen, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { submitFeedback } from "@/lib/feedback";

function ContactForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", category: "general", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in your name, email and message", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await submitFeedback(form);
      setSent(true);
      toast({ title: "Message sent", description: "Thanks — we'll get back to you within one business day." });
    } catch (err) {
      toast({ title: "Couldn't send message", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-3xl glass-strong p-8 text-center md:p-10">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-success" />
        <h2 className="font-display text-2xl font-bold">Message received</h2>
        <p className="mt-2 text-muted-foreground">Thanks for reaching out. Our team will reply to <span className="text-foreground">{form.email}</span> within one business day.</p>
        <Button className="mt-6" variant="secondary" onClick={() => { setSent(false); setForm({ name: "", email: "", category: "general", subject: "", message: "" }); }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl glass-strong p-6 md:p-8">
      <h2 className="font-display text-2xl font-bold">Send us a message</h2>
      <p className="mt-1 text-sm text-muted-foreground">Fill this in and it lands straight in our inbox — no account needed.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Your name</label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" className="bg-card/60" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Email</label>
          <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className="bg-card/60" required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Topic</label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger className="bg-card/60"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General support</SelectItem>
              <SelectItem value="creator">Creator & payouts</SelectItem>
              <SelectItem value="report">Report content / takedown</SelectItem>
              <SelectItem value="billing">Billing & refunds</SelectItem>
              <SelectItem value="feedback">Feedback & ideas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Subject</label>
          <Input value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="How can we help?" className="bg-card/60" />
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1.5 block text-sm font-medium">Message</label>
        <Textarea value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="Tell us what's going on…" className="min-h-[140px] bg-card/60" required />
      </div>
      <Button type="submit" size="lg" disabled={sending} className="mt-5 w-full bg-gradient-primary btn-glow sm:w-auto">
        {sending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" /> Sending…</> : <><Send className="mr-1 h-4 w-4" /> Send message</>}
      </Button>
    </form>
  );
}

const SITE_URL = "https://pasteprompts.co.uk";
const SUPPORT_EMAIL = "support@pasteprompts.co.uk";

const channels = [
  {
    icon: LifeBuoy,
    title: "General support",
    desc: "Questions about your account, a purchase, or how something works.",
    email: SUPPORT_EMAIL,
  },
  {
    icon: Store,
    title: "Creator & payouts",
    desc: "Selling prompts, membership tiers, earnings and payout questions.",
    email: "creators@pasteprompts.co.uk",
  },
  {
    icon: ShieldAlert,
    title: "Report content / takedowns",
    desc: "Flag infringing, unsafe or policy-breaking prompts for review.",
    email: "trust@pasteprompts.co.uk",
  },
];

const quickLinks = [
  { label: "Refund policy", to: "/legal/refunds" },
  { label: "Trust & security", to: "/trust" },
  { label: "Browse the guides", to: "/guides" },
  { label: "How it works", to: "/about" },
];

export default function Contact() {
  return (
    <Layout>
      <SEO
        title="Contact & support"
        description="Get in touch with the Paste Prompts team — support for buyers and creators, billing questions, and content takedown requests. We reply within one business day."
        canonical="/contact"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Contact Paste Prompts",
          url: `${SITE_URL}/contact`,
          description:
            "Support for buyers and creators, billing questions, and content takedown requests.",
        }}
      />

      <div className="container-wide py-14">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Contact & Support" },
          ]}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5 text-primary-glow" /> We're here to help
          </div>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Contact <span className="text-gradient">Paste Prompts</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Real humans, real answers. Whether you're a buyer, a creator, or reporting a problem,
            reach the right team below. We aim to reply within one business day.
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary-glow" /> Support hours: Mon–Fri, 9am–6pm UK time.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {channels.map((c) => (
            <div key={c.title} className="flex h-full flex-col rounded-2xl glass p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-glow">
                <c.icon className="h-5 w-5 text-primary-glow" />
              </div>
              <h2 className="font-display text-lg font-semibold">{c.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{c.desc}</p>
              <a
                href={`mailto:${c.email}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary-glow hover:underline"
              >
                <Mail className="h-4 w-4" /> {c.email}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <ContactForm />
        </div>



        <div className="mt-10 rounded-3xl glass-strong p-8 md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-bold">Before you email — you might find it faster here</h2>
              <p className="mt-2 text-muted-foreground">
                Many questions are answered instantly in our guides and policy pages. Take a look before reaching out.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {quickLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
            <Button asChild size="lg" className="bg-gradient-primary btn-glow">
              <Link to="/guides">
                <BookOpen className="mr-1 h-4 w-4" /> Read the guides
              </Link>
            </Button>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Paste Prompts · pasteprompts.co.uk · Registered in the United Kingdom. For legal notices see our{" "}
          <Link to="/legal/terms" className="text-primary-glow hover:underline">Terms</Link> and{" "}
          <Link to="/legal/privacy" className="text-primary-glow hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </Layout>
  );
}
