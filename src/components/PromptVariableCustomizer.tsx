import { useState, useMemo } from "react";
import { Copy, Check, Sparkles, RotateCcw, ExternalLink, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface PromptVariableCustomizerProps {
  promptBody: string;
  model: string;
  onCopySuccess?: () => void;
}

export function PromptVariableCustomizer({ promptBody, model, onCopySuccess }: PromptVariableCustomizerProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  // Extract placeholders matching [ALL_CAPS_OR_WORDS] but excluding markdown links [text](...)
  const variables = useMemo(() => {
    if (!promptBody) return [];
    const regex = /\[([A-Z0-9_\s/-]{2,40})\]/g;
    const found = new Set<string>();
    let match;
    while ((match = regex.exec(promptBody)) !== null) {
      const varName = match[1].trim();
      // Skip if it looks like markdown or citation
      if (varName && !varName.startsWith("http")) {
        found.add(varName);
      }
    }
    return Array.from(found);
  }, [promptBody]);

  // Compute final customized prompt with user replacements
  const customizedPrompt = useMemo(() => {
    if (!promptBody) return "";
    let result = promptBody;
    for (const [key, val] of Object.entries(values)) {
      if (val && val.trim() !== "") {
        // Replace all occurrences of [KEY]
        const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        result = result.replace(new RegExp(`\\[${escaped}\\]`, "g"), val.trim());
      }
    }
    return result;
  }, [promptBody, values]);

  const hasVariables = variables.length > 0;
  const filledCount = Object.values(values).filter((v) => v.trim() !== "").length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(customizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Prompt Copied to Clipboard!",
      description: hasVariables && filledCount > 0
        ? `Copied with ${filledCount} customized variable${filledCount === 1 ? "" : "s"}.`
        : "Ready to paste directly into your AI tool.",
    });
    onCopySuccess?.();
  };

  const handleReset = () => {
    setValues({});
    toast({ title: "Variables reset to defaults" });
  };

  const formatLabel = (raw: string) => {
    return raw
      .replace(/[_-]/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="rounded-2xl glass-strong border border-white/10 p-5 shadow-xl">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary-glow" />
              {hasVariables ? "Interactive Prompt Customizer" : "Ready-to-Paste Prompt"}
            </span>
            {hasVariables && (
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary-glow bg-primary/5">
                {variables.length} dynamic variable{variables.length > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {hasVariables
              ? "Fill in your variables below to generate your custom copy-ready prompt."
              : "Click copy below and paste straight into your AI assistant."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasVariables && filledCount > 0 && (
            <Button size="sm" variant="ghost" onClick={handleReset} className="h-8 text-xs text-muted-foreground">
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          )}
          <Button size="sm" onClick={handleCopy} className="bg-gradient-primary btn-glow h-8 px-4 text-xs font-semibold">
            {copied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-white" /> Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy Prompt
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Interactive Variable Inputs (if variables present) */}
      {hasVariables && (
        <div className="mb-5 rounded-xl bg-card/60 border border-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-primary-glow" /> Variables ({filledCount}/{variables.length} filled)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {variables.map((v) => (
              <div key={v} className="space-y-1">
                <Label htmlFor={`var-${v}`} className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>{formatLabel(v)}</span>
                  <code className="text-[10px] text-primary-glow font-mono opacity-80">[{v}]</code>
                </Label>
                <Input
                  id={`var-${v}`}
                  value={values[v] ?? ""}
                  onChange={(e) => setValues({ ...values, [v]: e.target.value })}
                  placeholder={`Enter your ${formatLabel(v).toLowerCase()}...`}
                  className="h-8 text-xs bg-black/40 border-white/10 focus:border-primary/50"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Prompt Preview */}
      <div className="relative rounded-xl bg-black/50 border border-white/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">Live Output Preview</span>
          {hasVariables && filledCount > 0 && (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Customized
            </span>
          )}
        </div>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs sm:text-sm text-foreground/90 max-h-[360px] overflow-y-auto leading-relaxed">
          {customizedPrompt}
        </pre>
      </div>

      {/* 1-Click Launchers */}
      <div className="mt-4 border-t border-white/5 pt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Paste in Platform:
        </span>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => {
              navigator.clipboard.writeText(customizedPrompt);
              toast({ title: "Customized Prompt Copied!", description: "Opening ChatGPT in a new tab..." });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card transition-colors"
          >
            <ExternalLink className="h-3 w-3 text-primary-glow" /> ChatGPT
          </a>
          <a
            href="https://claude.ai"
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => {
              navigator.clipboard.writeText(customizedPrompt);
              toast({ title: "Customized Prompt Copied!", description: "Opening Claude in a new tab..." });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card transition-colors"
          >
            <ExternalLink className="h-3 w-3 text-primary-glow" /> Claude
          </a>
          <a
            href="https://gemini.google.com"
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => {
              navigator.clipboard.writeText(customizedPrompt);
              toast({ title: "Customized Prompt Copied!", description: "Opening Gemini in a new tab..." });
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-card/70 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-card transition-colors"
          >
            <ExternalLink className="h-3 w-3 text-primary-glow" /> Gemini
          </a>
        </div>
      </div>
    </div>
  );
}

export default PromptVariableCustomizer;
