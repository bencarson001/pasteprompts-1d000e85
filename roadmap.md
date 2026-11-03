# Paste Prompts – Development Checklist (audit 27 Sep 2026)

## Critical bugs / security
- [x] Remove public "Platform Admin Quick Login" (Auth.tsx + signInAsAdmin in AuthContext.tsx) – fakes an admin session with no password, stored in localStorage
- [x] Remove parallel Firebase auth (src/lib/firebase.ts, AuthContext.tsx) – conflicts with Lovable Cloud Google sign-in rule
- [x] Admin analytics shows invented numbers (src/lib/admin.ts ~L128, L224-250; AdminAnalytics.tsx L408) – replace with real analytics_events aggregates
- [ ] payments-webhook has no refund handling (charge.refunded) and no creator payout/transfer logic
- [x] 32 SECURITY DEFINER functions executable by anon/authenticated – revoke EXECUTE on internal/admin-only ones

## Improvements
- [ ] Split AuthContext (Supabase + Firebase + admin override mixed)
- [ ] Replace loose `db` client usage with typed queries where possible
- [ ] Only 1 placeholder test – add tests for copy gate, reserved names, checkout
- [ ] Large files: admin.ts (44k), EditProfile.tsx (44k), Index.tsx (46k), PromptDetail.tsx (36k)
- [ ] server.ts / firebase-applet-config / firestore.rules are Google AI Studio leftovers – confirm and remove

## New features
- (awaiting user's upcoming requests)

## Guide refresh — 3 November 2026
- [x] Rewrite all existing guides with practical, honest content and verified catalogue links.
- [x] Check guide pages, metadata, links and tests; publish the refresh. Four tests passed; all 27 live guide pages and their metadata verified.
- [x] Submit the live sitemap to Google and report its acknowledgement, not guaranteed indexing. Google accepted and downloaded 333 URLs with zero reported errors or warnings.
- [x] Recommend evidence-based AdSense and traffic next steps: consent compliance first, original demonstrations next, then share existing guides and measure search results.
