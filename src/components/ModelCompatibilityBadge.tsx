import { Cpu, Info, Zap } from "lucide-react";
import { MODEL_LABELS } from "@/lib/format";

interface ModelCompatibilityBadgeProps {
  model: string;
  className?: string;
}

// Plain, checkable facts only: which tool the creator wrote the prompt for.
export function ModelCompatibilityBadge({ model, className = "" }: ModelCompatibilityBadgeProps) {
  const primaryModel = MODEL_LABELS[model] ?? model;
  const isLLM = !["midjourney", "dall-e", "flux", "stable-diffusion", "sora"].includes(model.toLowerCase());

  return (
    <div className={`rounded-2xl border border-white/10 bg-card/40 p-4 text-xs ${className}`}>
      <span className="text-[11px] font-medium text-muted-foreground">Written for:</span>
      <div className="mt-1 flex items-center gap-1.5 font-semibold text-foreground">
        <Cpu className="h-3.5 w-3.5 text-primary-glow" />
        <span>{primaryModel}</span>
      </div>
      <p className="mt-3 flex gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        {isLLM
          ? "Text prompts often work in other chat tools too, but results vary between tools and versions. Check the output before you use it."
          : "Image prompts often need small wording or setting changes to work in other image tools."}
      </p>
      <div className="mt-3 flex items-center gap-1 border-t border-white/5 pt-2 text-[11px] text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-primary-glow" /> Copy-ready once unlocked
      </div>
    </div>
  );
}

export default ModelCompatibilityBadge;
