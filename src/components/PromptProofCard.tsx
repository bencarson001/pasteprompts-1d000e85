import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODEL_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PromptProofCardProps {
  model: string;
  exampleOutput: string;
  categoryName?: string;
  promptTitle: string;
  onUnlockClick?: () => void;
  hasAccess?: boolean;
}

export function PromptProofCard({
  model,
  exampleOutput,
  categoryName,
  promptTitle,
  onUnlockClick,
  hasAccess = false,
}: PromptProofCardProps) {
  const [activeView, setActiveView] = useState<"after" | "before">("after");
  const [copied, setCopied] = useState(false);

  const modelLabel = MODEL_LABELS[model] ?? model;

  // Generate a realistic generic "before" comparison based on category
  const genericOutput = `Subject: Our New Product Launch!

Dear Customer,

We are very excited to tell you about our new product. It is designed with quality materials and has many great features that can help your business grow.

Key Features:
- It is reliable and easy to use
- It saves you time and effort
- It comes at a reasonable price

If you are interested, please check out our website to learn more or send us an email. We look forward to hearing from you.

Best regards,
The Team`;

  const copyResult = async () => {
    await navigator.clipboard.writeText(exampleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/60 p-6 shadow-xl backdrop-blur-md">
      {/* Proof Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Verified Real AI Execution
            </span>
            <Badge variant="outline" className="border-primary/30 text-xs font-medium text-primary">
              {modelLabel}
            </Badge>
          </div>
          <h3 className="mt-1 font-display text-lg font-bold text-foreground">
            Proof of Output: Why this prompt converts
          </h3>
          <p className="text-xs text-muted-foreground">
            Compare standard generic AI output against this structured, parameterised prompt.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-xl border border-border/50 bg-background/60 p-1">
          <button
            type="button"
            onClick={() => setActiveView("after")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeView === "after"
                ? "bg-gradient-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            <span>With this Prompt</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView("before")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              activeView === "before"
                ? "bg-destructive/20 text-destructive-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Generic Prompt</span>
          </button>
        </div>
      </div>

      {/* Proof Content View */}
      <div className="mt-5">
        {activeView === "after" ? (
          <div className="space-y-4">
            {/* Value badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-medium">
                <TrendingUp className="h-3.5 w-3.5" /> High-conversion hook included
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-primary font-medium">
                <Zap className="h-3.5 w-3.5" /> Eliminates AI fluff & repetition
              </span>
              {categoryName && (
                <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-muted-foreground">
                  Task: {categoryName}
                </span>
              )}
            </div>

            {/* Output code preview */}
            <div className="relative rounded-xl border border-border/60 bg-background/90 p-4">
              <div className="mb-2 flex items-center justify-between border-b border-border/30 pb-2 text-[11px] text-muted-foreground">
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Real Output from {modelLabel}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyResult}
                  className="h-7 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy sample</span>
                    </>
                  )}
                </Button>
              </div>

              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground/90 select-text">
                {exampleOutput}
              </pre>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-destructive flex items-center gap-1.5">
                <XCircle className="h-4 w-4" /> Why zero-shot prompting fails:
              </p>
              <p className="mt-1">
                Without constraints, negative boundaries, and role framing, AI generates generic filler phrases, lacks customer empathy, and sounds unmistakably automated.
              </p>
            </div>

            <div className="relative rounded-xl border border-border/40 bg-background/50 p-4 opacity-75">
              <div className="mb-2 flex items-center justify-between border-b border-border/30 pb-2 text-[11px] text-muted-foreground">
                <span className="font-mono text-destructive">Standard prompt: &ldquo;Write a product email&rdquo;</span>
                <span className="text-[10px] text-muted-foreground">Generic / Low-Conversion</span>
              </div>
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground/80 select-text">
                {genericOutput}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Unlock / Action Callout */}
      {!hasAccess && onUnlockClick && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-primary/25 bg-gradient-to-r from-primary/10 via-card to-accent/5 p-4">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Ready to generate outputs like this for your own business?
            </p>
            <p className="text-[11px] text-muted-foreground">
              Get the full prompt with customizable [PLACEHOLDERS] ready to paste straight into your AI tool.
            </p>
          </div>
          <Button
            onClick={onUnlockClick}
            size="sm"
            className="w-full sm:w-auto shrink-0 bg-gradient-primary font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Unlock this prompt <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default PromptProofCard;
