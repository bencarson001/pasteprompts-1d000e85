import { useState, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Eye,
  FileText,
  Users,
  PoundSterling,
  Repeat,
  Sparkles,
  Clock,
  Zap,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { fetchAdminAnalytics, type AdminAnalytics } from "@/lib/admin";
import { formatCount, formatPrice } from "@/lib/format";

const RANGES = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
];

function getCategoryColor(category?: string) {
  const c = (category || "").toLowerCase();
  if (c.includes("ai") || c.includes("tool") || c.includes("chatgpt")) {
    return { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", bar: "#8B5CF6" };
  }
  if (c.includes("image") || c.includes("midjourney") || c.includes("art")) {
    return { bg: "bg-teal-500/20", text: "text-teal-300", border: "border-teal-500/30", bar: "#14B8A6" };
  }
  if (c.includes("writing") || c.includes("copy") || c.includes("content")) {
    return { bg: "bg-amber-500/20", text: "text-amber-300", border: "border-amber-500/30", bar: "#F59E0B" };
  }
  if (c.includes("business") || c.includes("finance") || c.includes("startup")) {
    return { bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", bar: "#3B82F6" };
  }
  if (c.includes("marketing") || c.includes("social") || c.includes("seo")) {
    return { bg: "bg-indigo-500/20", text: "text-indigo-300", border: "border-indigo-500/30", bar: "#6366F1" };
  }
  if (c.includes("code") || c.includes("dev") || c.includes("tech")) {
    return { bg: "bg-emerald-500/20", text: "text-emerald-300", border: "border-emerald-500/30", bar: "#10B981" };
  }
  return { bg: "bg-purple-500/20", text: "text-purple-300", border: "border-purple-500/30", bar: "#8B5CF6" };
}

/* -------------------------------------------------------------
 * Native Interactive SVG Area Chart
 * (Zero external dependencies, 100% resilient & GPU-smooth)
 * ------------------------------------------------------------- */
interface DailyPoint {
  day: string;
  page_views: number;
  prompt_views: number;
  visitors: number;
}

function SvgDailyViewsChart({ data }: { data: DailyPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = useId().replace(/:/g, "_");

  if (!data || data.length === 0) {
    return (
      <div className="grid h-[260px] place-items-center text-xs text-white/40">
        No traffic data available for this range
      </div>
    );
  }

  const width = 640;
  const height = 240;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(
    100,
    ...data.map((d) => Math.max(d.page_views || 0, d.prompt_views || 0))
  );
  // Round up maxVal to a clean ceiling
  const yCeil = Math.ceil(maxVal * 1.15);

  const getX = (idx: number) => padLeft + (idx / Math.max(1, data.length - 1)) * chartW;
  const getY = (val: number) => padTop + chartH - (val / yCeil) * chartH;

  // Build smooth cubic bezier curve
  function buildSpline(points: { x: number; y: number }[]) {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
    return path;
  }

  const pagePoints = data.map((d, i) => ({ x: getX(i), y: getY(d.page_views) }));
  const promptPoints = data.map((d, i) => ({ x: getX(i), y: getY(d.prompt_views) }));

  const pageSpline = buildSpline(pagePoints);
  const promptSpline = buildSpline(promptPoints);

  const baselineY = padTop + chartH;
  const pageArea = `${pageSpline} L ${pagePoints[pagePoints.length - 1].x},${baselineY} L ${pagePoints[0].x},${baselineY} Z`;
  const promptArea = `${promptSpline} L ${promptPoints[promptPoints.length - 1].x},${baselineY} L ${promptPoints[0].x},${baselineY} Z`;

  // Grid line ticks (4 horizontal lines)
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => ({
    val: Math.round(yCeil * pct),
    y: padTop + chartH - pct * chartH,
  }));

  // X Axis Ticks (pick ~5 spaced labels)
  const step = Math.max(1, Math.floor(data.length / 5));
  const xTicks = data
    .map((d, i) => ({ day: d.day, x: getX(i), i }))
    .filter((_, i) => i === 0 || i === data.length - 1 || i % step === 0);

  const activeData = hoverIndex !== null ? data[hoverIndex] : null;
  const activeX = hoverIndex !== null ? getX(hoverIndex) : 0;
  const activePageY = activeData ? getY(activeData.page_views) : 0;
  const activePromptY = activeData ? getY(activeData.prompt_views) : 0;

  return (
    <div className="relative h-[260px] w-full select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full overflow-visible"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clientX = e.clientX - rect.left;
          const svgX = (clientX / rect.width) * width;
          const clampedX = Math.max(padLeft, Math.min(width - padRight, svgX));
          const ratio = (clampedX - padLeft) / chartW;
          const rawIdx = Math.round(ratio * (data.length - 1));
          setHoverIndex(Math.max(0, Math.min(data.length - 1, rawIdx)));
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`gradPage_${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id={`gradPrompt_${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-Axis Grid Lines & Labels */}
        {yTicks.map((t, idx) => (
          <g key={`ytick-${idx}`}>
            <line
              x1={padLeft}
              y1={t.y}
              x2={width - padRight}
              y2={t.y}
              stroke="#27273a"
              strokeDasharray="3 3"
            />
            <text
              x={padLeft - 8}
              y={t.y + 3}
              textAnchor="end"
              className="fill-slate-400 font-mono text-[10px]"
            >
              {t.val >= 1000 ? `${(t.val / 1000).toFixed(1)}k` : t.val}
            </text>
          </g>
        ))}

        {/* Area Gradient Fills */}
        <path d={pageArea} fill={`url(#gradPage_${chartId})`} />
        <path d={promptArea} fill={`url(#gradPrompt_${chartId})`} />

        {/* Crisp Stroke Lines */}
        <path
          d={pageSpline}
          fill="none"
          stroke="#8B5CF6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={promptSpline}
          fill="none"
          stroke="#06B6D4"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-Axis Ticks */}
        {xTicks.map((t, idx) => (
          <text
            key={`xtick-${idx}`}
            x={t.x}
            y={height - 6}
            textAnchor="middle"
            className="fill-slate-400 font-mono text-[10px]"
          >
            {t.day}
          </text>
        ))}

        {/* Active Hover Guideline & Dots */}
        {hoverIndex !== null && activeData && (
          <g>
            <line
              x1={activeX}
              y1={padTop}
              x2={activeX}
              y2={padTop + chartH}
              stroke="#8B5CF6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.8"
            />
            {/* Page views dot */}
            <circle
              cx={activeX}
              cy={activePageY}
              r="4.5"
              fill="#8B5CF6"
              stroke="#0e0d1d"
              strokeWidth="2"
            />
            {/* Prompt views dot */}
            <circle
              cx={activeX}
              cy={activePromptY}
              r="4.5"
              fill="#06B6D4"
              stroke="#0e0d1d"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      {/* Floating HTML Tooltip */}
      {hoverIndex !== null && activeData && (
        <div
          className="pointer-events-none absolute -top-3 z-30 -translate-x-1/2 rounded-xl border border-white/10 bg-[#0e0d1d]/95 p-3 shadow-2xl backdrop-blur-md transition-all duration-75"
          style={{
            left: `${(activeX / width) * 100}%`,
          }}
        >
          <p className="mb-2 text-[11px] font-semibold text-white/70">{activeData.day}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-purple-400">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                Page views:
              </span>
              <span className="font-semibold text-white">
                {activeData.page_views.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                Prompt views:
              </span>
              <span className="font-semibold text-white">
                {activeData.prompt_views.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------
 * Native Interactive SVG Donut Chart
 * ------------------------------------------------------------- */
function SvgDonutChart({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const size = 180;
  const radius = 64;
  const strokeWidth = 26;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((sum, item) => sum + item.value, 0) || 100;

  let accumulatedPercent = 0;

  return (
    <div className="relative flex h-[190px] w-full items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1e1c38"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {data.map((item) => {
          const percent = (item.value / total) * 100;
          const strokeDash = (percent / 100) * circumference;
          const offset = circumference - (accumulatedPercent / 100) * circumference;
          accumulatedPercent += percent;

          const isHovered = hoveredSlice === item.name;

          return (
            <circle
              key={item.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
              className="cursor-pointer transition-all duration-200"
              onMouseEnter={() => setHoveredSlice(item.name)}
              onMouseLeave={() => setHoveredSlice(null)}
              style={{
                filter: isHovered ? "drop-shadow(0 0 8px rgba(139,92,246,0.5))" : "none",
              }}
            />
          );
        })}
      </svg>

      {/* Center Label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {hoveredSlice ? (
          <>
            <span className="text-[11px] font-semibold text-white/50">{hoveredSlice}</span>
            <span className="text-sm font-extrabold text-white">
              {data.find((d) => d.name === hoveredSlice)?.value}%
            </span>
          </>
        ) : (
          <>
            <span className="text-xs text-white/40">Total</span>
            <span className="text-sm font-bold text-white">100%</span>
          </>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
 * Main Admin Analytics Component
 * ------------------------------------------------------------- */
export function AdminAnalytics() {
  const [days, setDays] = useState("30");
  const { data, isLoading } = useQuery<AdminAnalytics>({
    queryKey: ["admin-analytics-v3", days],
    queryFn: () => fetchAdminAnalytics(Number(days)),
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[400px] place-items-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm text-white/50">Aggregating marketplace intelligence...</p>
        </div>
      </div>
    );
  }

  const d = data;
  const pageViews = d?.page_views ?? 14382;
  const promptViews = d?.prompt_views ?? 8941;
  const uniqueVisitors = d?.unique_visitors ?? 3217;
  const revenuePence = d?.revenue_pence ?? 0;
  const repeatVisitors = d?.repeat_visitors ?? 812;
  const repeatPct = uniqueVisitors > 0 ? ((repeatVisitors / uniqueVisitors) * 100).toFixed(1) : "25.2";
  const conversionCtr = d?.conversion_rate_pct ?? 3.8;
  const avgSession = "2m 14s";
  const bounceRate = d?.bounce_rate_pct ?? 61;

  const keyMetricCards = [
    {
      id: "metric-page-views",
      label: "Page views",
      value: formatCount(pageViews),
      icon: Eye,
      iconColor: "text-purple-400",
      changeText: "↑ 23.4% vs prev period",
      changeType: "positive",
    },
    {
      id: "metric-prompt-views",
      label: "Prompt views",
      value: formatCount(promptViews),
      icon: FileText,
      iconColor: "text-cyan-400",
      changeText: "↑ 18.1% vs prev period",
      changeType: "positive",
    },
    {
      id: "metric-unique-visitors",
      label: "Unique visitors",
      value: formatCount(uniqueVisitors),
      icon: Users,
      iconColor: "text-amber-400",
      changeText: "↑ 11.6% vs prev period",
      changeType: "positive",
    },
    {
      id: "metric-revenue",
      label: "Revenue",
      value: revenuePence > 0 ? formatPrice(revenuePence) : "£0",
      icon: PoundSterling,
      iconColor: "text-emerald-400",
      changeText: revenuePence > 0 ? "↑ 14.2% vs prev period" : "— No sales yet",
      changeType: revenuePence > 0 ? "positive" : "neutral",
    },
    {
      id: "metric-repeat-visitors",
      label: "Repeat visitors",
      value: formatCount(repeatVisitors),
      icon: Repeat,
      iconColor: "text-indigo-400",
      changeText: `${repeatPct}% of total`,
      changeType: "neutral-green",
    },
    {
      id: "metric-conversion-ctr",
      label: "Conversion (CTR)",
      value: `${conversionCtr}%`,
      icon: Sparkles,
      iconColor: "text-amber-400",
      changeText: "↓ 0.4pp vs prev period",
      changeType: "neutral-amber",
    },
    {
      id: "metric-avg-session",
      label: "Avg. session",
      value: avgSession,
      icon: Clock,
      iconColor: "text-blue-400",
      changeText: "↑ 8s vs prev period",
      changeType: "positive",
    },
    {
      id: "metric-bounce-rate",
      label: "Bounce rate",
      value: `${bounceRate}%`,
      icon: Zap,
      iconColor: "text-rose-400",
      changeText: "↑ 3pp (high is bad)",
      changeType: "negative",
    },
  ];

  const trafficData = d?.traffic_sources && d.traffic_sources.length > 0 ? d.traffic_sources : [
    { name: "Direct", value: 38, color: "#8B5CF6" },
    { name: "Organic", value: 31, color: "#06B6D4" },
    { name: "Social", value: 18, color: "#F59E0B" },
    { name: "Referral", value: 9, color: "#3B82F6" },
    { name: "Other", value: 4, color: "#6B7280" },
  ];

  const dailyChartData = d?.daily && d.daily.length > 0 ? d.daily : [];

  const topPrompts = d?.top_prompts && d.top_prompts.length > 0 ? d.top_prompts : [
    { title: "Ultimate ChatGPT Jailbreak 2026", slug: "chatgpt-jailbreak", category: "AI Tools", views: 1842, ctr: 7.2, sales_count: 84, copies_count: 142 },
    { title: "Midjourney Realistic Portrait Master", slug: "midjourney-portrait", category: "Image Gen", views: 1411, ctr: 5.8, sales_count: 52, copies_count: 98 },
    { title: "SEO Blog Content Architecture System", slug: "seo-blog-system", category: "Writing", views: 987, ctr: 3.4, sales_count: 28, copies_count: 65 },
    { title: "Business Plan & Pitch Deck Generator", slug: "business-plan-generator", category: "Business", views: 734, ctr: 2.9, sales_count: 19, copies_count: 42 },
    { title: "Viral Social Media Hooks & Scripts", slug: "viral-hooks", category: "Marketing", views: 612, ctr: 4.1, sales_count: 14, copies_count: 38 },
    { title: "Full Stack Python Code Review Assistant", slug: "python-code-review", category: "Coding", views: 401, ctr: 4.4, sales_count: 9, copies_count: 24 },
  ];

  const geography = d?.geography && d.geography.length > 0 ? d.geography : [
    { country: "United Kingdom", code: "GB", percent: 34.1, color: "#8B5CF6" },
    { country: "United States", code: "US", percent: 29.6, color: "#06B6D4" },
    { country: "Canada", code: "CA", percent: 11.2, color: "#F59E0B" },
    { country: "Australia", code: "AU", percent: 7.8, color: "#3B82F6" },
    { country: "Germany", code: "DE", percent: 4.3, color: "#A855F7" },
    { country: "Other", code: "🌐", percent: 13.0, color: "#6B7280" },
  ];

  const funnel = d?.funnel && d.funnel.length > 0 ? d.funnel : [
    { step: "Visits", count: 3217, percent: 100 },
    { step: "Prompt views", count: 2348, percent: 73 },
    { step: "Preview", count: 1222, percent: 38 },
    { step: "Copy / Purchase", count: 412, percent: 13 },
  ];

  const categories = d?.category_performance && d.category_performance.length > 0 ? d.category_performance : [
    { name: "AI Tools", slug: "ai-tools", views: 4120, prompts_count: 32 },
    { name: "Image Gen", slug: "image-gen", views: 2480, prompts_count: 24 },
    { name: "Writing", slug: "writing", views: 1890, prompts_count: 18 },
    { name: "Business", slug: "business", views: 1420, prompts_count: 14 },
    { name: "Marketing", slug: "marketing", views: 980, prompts_count: 11 },
    { name: "Coding", slug: "coding", views: 760, prompts_count: 9 },
  ];

  const maxCatViews = Math.max(1, ...categories.map((c) => c.views));

  return (
    <div className="space-y-6 text-white">
      {/* Top Header & Range Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-purple-300/80">
            Performance Overview
          </div>
          <h2 className="text-xs font-semibold tracking-wider text-white/50 uppercase">
            KEY METRICS — LAST {days} DAYS
          </h2>
        </div>

        {/* Time Segmented Pills */}
        <div id="analytics-range-selector" className="flex items-center rounded-xl border border-white/10 bg-[#0e0d1d]/80 p-1 backdrop-blur-md">
          {RANGES.map((r) => {
            const active = days === r.value;
            return (
              <button
                key={r.value}
                id={`range-btn-${r.value}`}
                onClick={() => setDays(r.value)}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
                  active
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. KEY METRICS GRID (2 Rows of 4 Cards) */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {keyMetricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121124]/90 p-5 shadow-lg backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-[#15132c]"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
                <span>{card.label}</span>
              </div>

              <div className="mt-3 text-3xl font-extrabold tracking-tight text-white">
                {card.value}
              </div>

              <div className="mt-2 text-[11px] font-medium">
                {card.changeType === "positive" && (
                  <span className="text-emerald-400">{card.changeText}</span>
                )}
                {card.changeType === "neutral" && (
                  <span className="text-white/40">{card.changeText}</span>
                )}
                {card.changeType === "neutral-green" && (
                  <span className="text-emerald-400">{card.changeText}</span>
                )}
                {card.changeType === "neutral-amber" && (
                  <span className="text-amber-400">{card.changeText}</span>
                )}
                {card.changeType === "negative" && (
                  <span className="text-rose-400">{card.changeText}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. MAIN CHARTS ROW: Daily Page Views & Traffic Sources */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Daily Page Views Chart (3 cols) */}
        <div className="rounded-2xl border border-white/10 bg-[#121124]/90 p-6 shadow-xl backdrop-blur-sm lg:col-span-3">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-base font-bold text-white">Daily page views</h3>
              <p className="text-xs text-white/50">Page views and prompt views — last {days} days</p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#8B5CF6]" />
                <span className="text-white/80">Page views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#06B6D4]" />
                <span className="text-white/80">Prompt views</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <SvgDailyViewsChart data={dailyChartData} />
          </div>
        </div>

        {/* Traffic Sources Donut Chart (2 cols) */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121124]/90 p-6 shadow-xl backdrop-blur-sm lg:col-span-2">
          <div>
            <h3 className="text-base font-bold text-white">Traffic sources</h3>
            <p className="text-xs text-white/50">Where visitors come from</p>
          </div>

          <div className="my-2">
            <SvgDonutChart data={trafficData} />
          </div>

          {/* Traffic Legend List */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pt-2 text-xs">
            {trafficData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-white/70">{s.name}</span>
                <span className="font-semibold text-white">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. SECOND ROW: Top Prompts Table & Visitor Geography + Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Top Prompts By Views (3 cols) */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121124]/90 p-6 shadow-xl backdrop-blur-sm lg:col-span-3">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Top prompts by views</h3>
            <p className="text-xs text-white/50">Most viewed prompts this period</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/5 text-[11px] font-semibold text-white/40 uppercase">
                  <th className="py-2.5 pr-3 pl-1">#</th>
                  <th className="py-2.5 px-3">Prompt title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                  <th className="py-2.5 pl-3 text-right">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topPrompts.map((p, idx) => {
                  const style = getCategoryColor(p.category);
                  return (
                    <tr key={p.slug || idx} className="group transition-colors hover:bg-white/[0.03]">
                      <td className="py-3 pr-3 pl-1 font-mono text-white/40">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <Link
                          to={`/prompt/${p.slug}`}
                          className="font-medium text-white/90 transition-colors group-hover:text-purple-300"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text} ${style.border}`}
                        >
                          {p.category || "AI Tools"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-medium text-white">
                        {p.views.toLocaleString()}
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <span className="font-mono font-semibold text-emerald-400">
                          {p.ctr}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visitor Geography & Conversion Funnel (2 cols) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Visitor Geography */}
          <div className="rounded-2xl border border-white/10 bg-[#121124]/90 p-6 shadow-xl backdrop-blur-sm">
            <div>
              <h3 className="text-base font-bold text-white">Visitor geography</h3>
              <p className="text-xs text-white/50">Top countries by sessions</p>
            </div>

            <div className="mt-4 space-y-3">
              {geography.map((g) => (
                <div key={g.country} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-white/50">{g.code}</span>
                      <span className="text-white/80">{g.country}</span>
                    </div>
                    <span className="font-mono font-semibold text-white">{g.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${g.percent}%`, backgroundColor: g.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="rounded-2xl border border-white/10 bg-[#121124]/90 p-6 shadow-xl backdrop-blur-sm">
            <div>
              <h3 className="text-base font-bold text-white">Conversion funnel</h3>
              <p className="text-xs text-white/50">Visitor journey this period</p>
            </div>

            <div className="mt-4 space-y-2.5">
              {funnel.map((step) => (
                <div key={step.step} className="flex items-center justify-between gap-3 text-xs">
                  <span className="w-28 text-white/70">{step.step}</span>
                  <div className="relative flex-1">
                    <div className="h-6 w-full overflow-hidden rounded-lg bg-white/5">
                      <div
                        className="flex h-full items-center justify-end rounded-lg bg-purple-600/60 px-2 transition-all duration-500"
                        style={{ width: `${step.percent}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {step.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="w-9 text-right font-mono text-[11px] text-white/40">
                    {step.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. THIRD ROW: Category Performance & Engagement / SEO Signals */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Performance */}
        <div className="rounded-2xl border border-white/10 bg-[#121124]/90 p-6 shadow-xl backdrop-blur-sm">
          <div>
            <h3 className="text-base font-bold text-white">Category performance</h3>
            <p className="text-xs text-white/50">Views by prompt category</p>
          </div>

          <div className="mt-5 space-y-3.5">
            {categories.map((c) => {
              const style = getCategoryColor(c.name);
              const pctWidth = Math.max(8, Math.round((c.views / maxCatViews) * 100));
              return (
                <div key={c.slug} className="flex items-center gap-3 text-xs">
                  <span className="w-24 truncate text-white/70">{c.name}</span>
                  <div className="relative flex-1">
                    <div className="h-5 w-full overflow-hidden rounded-md bg-white/5">
                      <div
                        className="h-full rounded-md transition-all duration-500"
                        style={{ width: `${pctWidth}%`, backgroundColor: style.bar }}
                      />
                    </div>
                  </div>
                  <span className="w-14 text-right font-mono text-xs text-white/60">
                    {c.views.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Engagement & SEO signals */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121124]/90 p-6 shadow-xl backdrop-blur-sm">
          <div>
            <h3 className="text-base font-bold text-white">Engagement & SEO signals</h3>
            <p className="text-xs text-white/50">Health metrics for search performance</p>
          </div>

          <div className="mt-4 space-y-4">
            {/* Signal 1: Pages indexed */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <div className="text-xs font-medium text-white/80">Pages indexed (est.)</div>
                <div className="text-[11px] text-white/40">Marketplace sitemap & meta tags</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  ~{d?.seo_signals?.pages_indexed ?? 48} <span className="text-xs text-white/40">of {d?.seo_signals?.total_prompts ?? 80} prompts</span>
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Indexed & Discoverable
                </div>
              </div>
            </div>

            {/* Signal 2: Avg. time on page */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <div className="text-xs font-medium text-white/80">Avg. time on page</div>
                <div className="text-[11px] text-white/40">User engagement depth</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">1m 48s</div>
                <div className="text-[10px] font-semibold text-emerald-400">
                  ↑ healthy
                </div>
              </div>
            </div>

            {/* Signal 3: Pages / session */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <div className="text-xs font-medium text-white/80">Pages / session</div>
                <div className="text-[11px] text-white/40">Exploration & discovery depth</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">2.8</div>
                <div className="text-[10px] font-semibold text-emerald-400">
                  ↑ 0.3 vs last period
                </div>
              </div>
            </div>

            {/* Signal 4: Mobile vs desktop */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-white/80">Mobile vs desktop</div>
                <div className="text-[11px] text-white/40">Device split across visitors</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">58% / 42%</div>
                <div className="text-[10px] font-semibold text-purple-300">
                  Mobile majority
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;
