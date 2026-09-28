## Goal
Fix the verified causes behind the Seobility warnings without redesigning pages, inventing content, or bloating the sitemap.

## What I found
- The published site returns HTTP 200 quickly for all 261 sitemap URLs, and every sampled page has one H1.
- However, non-JavaScript crawlers currently receive the same homepage title and description on all 261 sitemap URLs. This explains the duplicate-title, duplicate-description, duplicate-content, heading, and short-title clusters in the screenshot.
- The React pages already set unique titles, descriptions, canonicals, headings, and structured data after JavaScript loads. The gap is the initial HTML sent to crawlers.
- The sitemap and robots file are valid. Private and utility pages are intentionally excluded, so they should not be added merely to satisfy a route-count comparison.

## Changes
1. Extend the existing HTML metadata handler so every public route gets its own server-delivered title, description, canonical URL, Open Graph URL/title/description, and Twitter title/description.
2. Keep database-driven prompt and creator metadata, but safely escape all values before inserting them into HTML.
3. Add route metadata for browse, model collections, guides, categories, company pages, and legal pages using their existing page content—not new or fabricated copy.
4. Make duplicate/legacy public URLs point to the preferred canonical route and mark non-indexable account, auth, checkout, search, and utility routes as `noindex` in the initial HTML.
5. Correct any stale SEO copy that still claims “hundreds”, “tested”, “verified”, or “battle-tested” where the database cannot prove it.
6. Add focused tests for the metadata resolver, then verify representative public and private routes locally.

## Not changing
- No new pages, dependencies, design changes, database changes, or sitemap mechanism replacement.
- No keyword stuffing, fake reviews, fake popularity claims, or speculative backlink changes.
- Search rankings cannot be guaranteed; this fixes crawlable on-page signals. The live result requires publishing and a fresh Seobility crawl.
