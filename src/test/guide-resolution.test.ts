import { describe, expect, it, vi } from "vitest";
import { guideQueryOptions, resolveGuideSlug } from "@/lib/guide-query";
import { getPublicArticle } from "@/lib/articles.functions";

vi.mock("@/lib/articles.functions", () => ({ getPublicArticle: vi.fn() }));

describe("Public guide resolution", () => {
  it("resolves existing aliases without fetching a database article", async () => {
    const options = guideQueryOptions("selling-ai-prompts");
    const result = await options.queryFn?.({} as never);
    expect(result?.slug).toBe("make-money-selling-ai-prompts");
    expect(getPublicArticle).not.toHaveBeenCalled();
  });

  it("loads a published database article when the slug is not static", async () => {
    vi.mocked(getPublicArticle).mockResolvedValue({
      slug: "ai-prompts-for-freelancers", title: "Freelancers", description: "Tasks",
      category: "Freelancers", read_minutes: 3, emoji: "", intro: "Brief",
      blocks: [], takeaways: [], published_at: "2026-08-12", updated_at: "2026-11-03",
    });
    const result = await guideQueryOptions("ai-prompts-for-freelancers").queryFn?.({} as never);
    expect(getPublicArticle).toHaveBeenCalledWith({ data: "ai-prompts-for-freelancers" });
    expect(result?.slug).toBe("ai-prompts-for-freelancers");
    expect(result?.updated).toBe("2026-11-03");
  });

  it("keeps unknown slugs distinct rather than using another guide", () => {
    expect(resolveGuideSlug("unknown-guide")).toBe("unknown-guide");
  });
});