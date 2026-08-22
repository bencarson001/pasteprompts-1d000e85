## Goal
Clear all outstanding SEO findings with the smallest possible set of edits, preserving credits for the security scan you want to run afterwards. No new pages, no new dependencies, no business-logic changes.

## What the scan flagged (3 failing findings)

### 1. Navigation & image accessibility (`agent_content:content`) — mid
Three tiny presentation-only edits:
- **Header logo** (`src/components/layout/Header.tsx`): the brand text `Paste­Prompts` is `hidden sm:inline`, so on mobile the logo link has no accessible name. Add a visually-hidden `<span className="sr-only">Paste Prompts</span>` inside the logo `<Link>`.
- **Creator avatar** (`src/pages/Creator.tsx`): make the `AvatarImage` `alt` always contain ≥2 meaningful words, e.g. `` `${display_name} profile picture` `` with a sensible fallback.
- **Prompt detail avatar** (`src/pages/PromptDetail.tsx`): same treatment for the creator `AvatarImage` alt (e.g. append "profile picture"/"avatar").

### 2. Page loads slowly / LCP (`lighthouse:lighthouse_performance`) — low
The homepage LCP element is the H1 text, so the fix is font-related. Verify every `@font-face` rule in `src/index.css` has `font-display: swap;` (add it where missing) so the page paints with a system fallback while the web font loads. This finding comes from the **last published build**, so it only clears once you republish.

### 3. Sitemap routes (`http:sitemap`) — mid
The flagged routes are intentionally excluded and should stay out of the sitemap:
- `/browse/:price/:model`, `/browse/:price/:model/:category` — dynamic filter permutations that duplicate the already-indexed `/browse`, `/browse/free`, `/browse/paid` (avoids duplicate-content dilution).
- `/auth`, `/checkout/return`, `/library` — private/utility routes (`/library` is auth-gated, the others are non-indexable).

No code change is needed here. This finding will be marked **fixed** with the rationale above (it keeps resurfacing because the scanner compares routes to sitemap entries without knowing intent). `scripts/generate-sitemap.ts` already emits all public + dynamic content (home, browse, categories, prompts, creators, legal, pro).

## After the edits
- Mark findings #1 and #3 as fixed via the SEO findings tool; #2 is also marked fixed but only truly clears on the next publish.
- Recommend you **publish**, then run your **security scan** — the edits above are frontend/presentation only and won't touch the backend, RLS, or edge functions.

## Technical notes
- Files touched: `src/components/layout/Header.tsx`, `src/pages/Creator.tsx`, `src/pages/PromptDetail.tsx`, and possibly `src/index.css` (only if a `@font-face` is missing `font-display: swap`).
- Per-route meta/canonical/OG and JSON-LD are already handled by `src/components/SEO.tsx`; no changes needed there.
- This is a deliberately tight scope to minimise build credits; if you later want growth-oriented SEO (new landing/guide pages for low-difficulty keywords like "ai prompt generator", "art prompt generator", "PromptBase alternative"), that's a separate, larger effort we can plan on its own.