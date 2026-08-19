import { ShieldCheck, Cpu, CheckCircle2, Award, Zap } from "lucide-react";
import { MODEL_LABELS } from "@/lib/format";

interface ModelCompatibilityBadgeProps {
  model: string;
  className?: string;
}

export function ModelCompatibilityBadge({ model, className = "" }: ModelCompatibilityBadgeProps) {
  const primaryModel = MODEL_LABELS[model] ?? model;

  // Derive compatible secondary architectures based on model category
  const isLLM = !["midjourney", "dall-e", "flux", "stable-diffusion", "sora"].includes(model.toLowerCase());

  return (
    <div className={`rounded-2xl border border-white/10 bg-card/40 p-4 ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-foreground">Verified Model Architecture</span>
            <p className="text-[10px] text-muted-foreground">Tested for deterministic output consistency</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      </div>

      <div className="mt-3 space-y-2.5 text-xs">
        <div>
          <span className="text-[11px] font-medium text-muted-foreground">Primary Optimized Target:</span>
          <div className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
            <Cpu className="h-3.5 w-3.5 text-primary-glow" />
            <span>{primaryModel}</span>
          </div>
        </div>

        {isLLM ? (
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Compatible Cross-Platform Engines:</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-md border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                ChatGPT (GPT-4o &amp; GPT-4.5)
              </span>
              <span className="rounded-md border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                Claude 3.5 / 3.7 Sonnet
              </span>
              <span className="rounded-md border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                Google Gemini 2.0 Flash / Pro
              </span>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Compatible Image Engines:</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="rounded-md border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                Midjourney v6.1 / Niji 6
              </span>
              <span className="rounded-md border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                Flux 1.1 Pro / Schnell
              </span>
              <span className="rounded-md border border-white/5 bg-black/40 px-2 py-0.5 text-[10px] text-muted-foreground">
                DALL·E 3
              </span>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Award className="h-3.5 w-3.5 text-primary-glow" /> Commercial License
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" /> Instant Copy
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelCompatibilityBadge;
