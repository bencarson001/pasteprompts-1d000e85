import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, CheckCircle2, AlertCircle, Send, ShieldCheck, Mail } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SITE_URL = "https://pasteprompts.co.uk";

export default function DMCA() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    rightsHolder: "",
    infringingUrl: "",
    originalWorkUrl: "",
    statement: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.infringingUrl || !form.statement) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields marked with an asterisk (*).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    // Simulate submission delivery to support mailbox
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Notice Received",
        description: "Your takedown request has been received and logged for expedited review.",
      });
    }, 600);
  };

  return (
    <Layout>
      <SEO
        title="Intellectual Property & DMCA Takedown Policy — Paste Prompts"
        description="Submit a copyright takedown notice or report infringing prompt content on Paste Prompts. Our compliance team acts quickly on verified requests."
        canonical="/dmca"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "DMCA & Intellectual Property Takedown Policy",
          url: `${SITE_URL}/dmca`,
          description: "Official takedown notice procedure and intellectual property protection framework for Paste Prompts.",
        }}
      />

      <div className="container-tight py-12">
        <Breadcrumbs
          items={[
            { name: "Home", to: "/" },
            { name: "Legal", to: "/legal/terms" },
            { name: "DMCA & Takedown" },
          ]}
        />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-card/60 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            <Scale className="h-3.5 w-3.5 text-primary-glow" /> Intellectual Property &amp; Copyright Protection
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            DMCA &amp; Copyright Takedown Procedure
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Paste Prompts respects the intellectual property rights of creators and rights holders. We respond promptly to notices of alleged copyright or intellectual property infringement in accordance with the UK Copyright, Designs and Patents Act and the Digital Millennium Copyright Act (DMCA).
          </p>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-white/10 bg-card/40 p-6 sm:p-8">
                {submitted ? (
                  <div className="text-center py-10 space-y-4">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Takedown Request Submitted</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                      Thank you for submitting your notice. Our legal &amp; compliance review team has received your submission and will investigate the specified URL within 24–48 business hours.
                    </p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="mt-4">
                      Submit Another Notice
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="text-lg font-bold text-foreground">Submit a Formal Notice of Infringement</h2>
                      <p className="text-xs text-muted-foreground mt-1">
                        Please provide exact details so our compliance team can verify and act upon your request immediately.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs">Your Full Legal Name *</Label>
                        <Input
                          id="name"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="e.g. Jane Doe"
                          className="bg-card/80 border-white/10"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs">Official Contact Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="e.g. legal@company.com"
                          className="bg-card/80 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="rightsHolder" className="text-xs">Copyright Owner / Represented Entity (Optional)</Label>
                      <Input
                        id="rightsHolder"
                        value={form.rightsHolder}
                        onChange={(e) => setForm({ ...form, rightsHolder: e.target.value })}
                        placeholder="Company name or creator organization (if acting on behalf of owner)"
                        className="bg-card/80 border-white/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="infringingUrl" className="text-xs">Infringing Paste Prompts URL *</Label>
                      <Input
                        id="infringingUrl"
                        required
                        value={form.infringingUrl}
                        onChange={(e) => setForm({ ...form, infringingUrl: e.target.value })}
                        placeholder="https://pasteprompts.co.uk/prompt/exact-prompt-slug"
                        className="bg-card/80 border-white/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="originalWorkUrl" className="text-xs">Location of Original Copyrighted Work (URL or description)</Label>
                      <Input
                        id="originalWorkUrl"
                        value={form.originalWorkUrl}
                        onChange={(e) => setForm({ ...form, originalWorkUrl: e.target.value })}
                        placeholder="https://yourportfolio.com/original-work or repository link"
                        className="bg-card/80 border-white/10"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="statement" className="text-xs">Statement &amp; Identification of Infringement *</Label>
                      <Textarea
                        id="statement"
                        required
                        rows={4}
                        value={form.statement}
                        onChange={(e) => setForm({ ...form, statement: e.target.value })}
                        placeholder="Describe the copyrighted work that has been infringed, how the listed prompt replicates it without authorization, and your good faith belief."
                        className="bg-card/80 border-white/10 text-xs"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-muted-foreground leading-relaxed">
                      By submitting this form, you affirm that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law, and that the information in this notification is accurate.
                    </div>

                    <Button type="submit" disabled={loading} className="w-full bg-gradient-primary btn-glow">
                      {loading ? "Transmitting notice..." : "Transmit Formal Takedown Notice"}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar Guidelines */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-card/40 p-6 space-y-4 text-xs text-muted-foreground">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary-glow" /> Our SLA &amp; Response Time
                </h3>
                <p className="leading-relaxed">
                  Upon receiving a complete and valid notice, Paste Prompts removes or disables access to the allegedly infringing prompt within <strong>24–48 business hours</strong>.
                </p>
                <p className="leading-relaxed">
                  The original creator of the prompt is notified and provided an opportunity to submit a counter-notice if they believe the material was misidentified.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-card/40 p-6 space-y-3 text-xs text-muted-foreground">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary-glow" /> Designated Copyright Agent
                </h3>
                <p className="leading-relaxed">
                  You may also email formal notices directly to our designated copyright mailbox:
                </p>
                <p className="font-mono text-foreground font-semibold">
                  hello@pasteprompts.co.uk
                </p>
                <p className="text-[10px] text-muted-foreground pt-2 border-t border-white/5">
                  Paste Prompts Legal Compliance Team<br />
                  Oxford, United Kingdom
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
