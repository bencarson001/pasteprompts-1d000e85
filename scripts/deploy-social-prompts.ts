import { dataApi } from "../src/lib/dataApi";

process.env.AGENT_API_KEY = "1dTBM4aa680T2JZdn7U4TbovFIK6kxVH";

interface PromptData {
  slug: string;
  title: string;
  description: string;
  body: string;
  example_output: string;
  tags: string[];
  model: string;
}

const PROMPTS: PromptData[] = [
  {
    slug: "viral-tiktok-hook-generator-soc0",
    title: "Viral TikTok 3-Second Hook Matrix",
    description:
      "Generate 15 scroll-stopping video hooks across 5 psychological retention triggers (Negative, Curiosity Gap, Conflict, Secret, and Result). Tested to maximize watch time and stop swipe-aways.",
    tags: ["social", "tiktok", "hooks", "growth", "short-form"],
    model: "chatgpt",
    body: `Act as a world-class viral short-form video strategist with over 500M organic views across TikTok and Reels.

Your goal is to engineer 15 high-converting, pattern-interrupting video openers for the first 3 seconds of a TikTok video.

INPUTS:
- Video Topic: [e.g. Personal finance mistakes, Shopify dropshipping, B2B cold email, Coffee brewing]
- Target Audience: [Who is scrolling on their phone? e.g. 20-30yo beginners, small business owners, aspiring creators]
- Core Takeaway / Transformation: [What will they learn by watching until the end?]
- Creator Vibe / Persona: [e.g. Direct & authoritative, relatable best friend, high-energy founder]

FRAMEWORK & RULES:
1. Apply the "3-Second Rule": The first sentence must create an intense emotional or cognitive friction that makes scrolling away feel like losing out.
2. Ban all generic AI introductions: Do NOT start with "In this video", "Hey guys", "Are you struggling with", or rhetorical questions that can be answered with "no".
3. Provide 3 hooks for each of these 5 psychological triggers:
   - The Negative Constraint ("Stop doing X if you actually want Y...")
   - The Curiosity Gap / Secret ("The 1 thing nobody in [niche] admits...")
   - The Conflict / Unpopular Truth ("Everyone is lying to you about...")
   - The Concrete Proof / Result ("How I went from X to Y without Z...")
   - The High-Stakes Cliffhanger ("I almost didn't share this because...")
4. For every hook, include specific Visual Scene Direction (e.g. speaking while performing an action, text pop, camera tilt) to capture visual attention simultaneously with audio.

OUTPUT FORMAT:
Deliver 15 numbered hooks categorized by psychological trigger, with exact spoken words in quotes, accompanied by bracketed visual directions and text-on-screen overlay recommendations.`,
    example_output: `[TRIGGER 1: THE NEGATIVE CONSTRAINT]
1. Spoken: "Stop spending 3 hours filming your TikToks. If your retention drops in the first 2 seconds, the algorithm doesn't care how good your lighting is."
   - Visual: Creator violently slapping a camera lens cap onto the table, leaning in close with eye contact.
   - On-Screen Text: "Stop wasting 3 hours filming" (Bold white on red outline).

2. Spoken: "If you're still using popular trending sounds in 2026 without voiceover, you're killing your account reach."
   - Visual: Showing screen recording of 200 views analytics with a big red 'X' drawn over it.
   - On-Screen Text: "Why trending audio fails alone"

3. Spoken: "Don't post another video until you turn this one setting off in Creator Tools."
   - Visual: Screen capture of TikTok settings menu rapidly toggling a switch.
   - On-Screen Text: "Check your settings right now"

[TRIGGER 2: THE CURIOSITY GAP]
4. Spoken: "There is an exact formula top creators use to get 70% average watch time, and it has nothing to do with fancy editing."
   - Visual: Writing a single equation on a mirror with dry-erase marker.
   - On-Screen Text: "The 70% retention rule"`,
  },
  {
    slug: "viral-storytelling-framework-soc23",
    title: "Viral TikTok Storytelling & Retention Scriptwriter",
    description:
      "Write structured 45-60 second TikTok scripts with narrative pacing, mid-video pattern interrupts, and open loops that keep viewers glued until the last second.",
    tags: ["social", "tiktok", "storytelling", "scripts", "retention"],
    model: "claude",
    body: `Act as an elite narrative short-form video director specializing in high-completion-rate TikTok and Reel scripts.

Your task is to write a complete 45-to-60 second scripted video that grips the viewer instantly, maintains a relentless narrative pace, and builds to an irresistible payoff.

INPUTS:
- Core Story / Anecdote: [What happened, or what lesson are you sharing?]
- Target Audience: [Who is watching?]
- Key Friction / Turning Point: [The moment of conflict, surprise, or realization]
- Call to Action: [Comment, follow, save, or share]

STRUCTURE GUIDELINES:
1. The Hook (0-3s): Drop the viewer directly into the middle of the climax or conflict ("In media res").
2. The Context Setup (3-12s): Establish the stakes in 2 punchy sentences. Why does this matter?
3. The Escalation (12-30s): Introduce the complication and the counter-intuitive twist. Use sensory details.
4. The Pattern Interrupt (at 20s): Introduce a sudden tempo change, b-roll shift, or tonal pivot to re-awaken wandering attention.
5. The Climax & Lesson (30-45s): Deliver the core breakthrough or insight with actionable clarity.
6. The Seamless Loop CTA (45-55s): Conclude with a phrase that transitions smoothly back into the opening hook for continuous playback.

OUTPUT FORMAT:
- Timecode Breakdown (0-3s, 3-12s, etc.)
- Audio Script (exact spoken voiceover)
- Visual Direction & B-roll prompts
- Loop Continuity Strategy (how the ending connects to the beginning)`,
    example_output: `[0:00 - 0:03] THE HOOK (IN MEDIA RES)
- Visual: Close-up of creator holding a crumpled legal letter with an exasperated laugh.
- Audio: "I almost lost my entire business over a single 4-word sentence in an email."
- Text: "The 4 words that almost broke me"

[0:03 - 0:12] THE STAKES
- Visual: Fast cut to laptop screen showing an inbox with 40 unread messages, creator typing quickly.
- Audio: "It was 2AM on a Tuesday. We had just crossed $50,000 in monthly revenue, and within twenty minutes, our payment processor froze every single transaction."

[0:12 - 0:25] THE ESCALATION
- Visual: Creator walking through their workspace holding a coffee mug, dynamic hand-held camera.
- Audio: "Everyone told us to send formal appeals. But formal appeals go straight into automated bots. So instead of playing defense, I did something completely reckless."

[0:25 - 0:42] THE PATTERN INTERRUPT & BREAKTHROUGH
- Visual: Sudden snap zoom into camera, quiet whisper tone.
- Audio: "I pulled up LinkedIn, found the personal profile of the VP of Risk, and sent a 30-second loom video showing our real inventory. He replied in six minutes."

[0:42 - 0:50] THE SEAMLESS LOOP & CTA
- Visual: Creator unfolding the letter and smiling.
- Audio: "If you ever face an automated roadblock, bypass the inbox and humanize the problem. Because remember..." (Loops back to: "I almost lost my entire business over a single 4-word sentence...")`,
  },
  {
    slug: "instagram-reels-script-writer-soc6",
    title: "Instagram Reels Hook-Body-CTA Engine",
    description:
      "Architect high-converting Instagram Reels scripts designed around the proven 3-second visual hook, high-retention bullet body, and DM keyword conversion triggers.",
    tags: ["social", "reels", "instagram", "scripts", "growth"],
    model: "claude",
    body: `Act as a senior Instagram growth architect and short-form copywriter.

Your task is to write a high-converting, save-worthy Instagram Reel script specifically structured to trigger the Instagram algorithm's primary ranking signals: Saves, Shares to DMs, and Keyword Comments.

INPUTS:
- Content Pillar: [e.g. Growth marketing, Fitness coaching, Interior design, SaaS founder]
- Target Prospect: [Who is this Reel attracting as a potential follower/buyer?]
- Core Transformation: [The single most valuable tip or breakthrough shared]
- Lead Magnet / Offer: [What free asset or guide will you DM them? e.g. Free checklist, template, workflow]

FRAMEWORK:
1. Visual Hook (0-3s): Visually disruptive action paired with an authoritative 1-sentence promise.
2. Problem Qualification (3-8s): Call out the exact mistake the viewer is making right now.
3. Rapid-Fire Value Delivery (8-28s): 3 numbered, high-signal tips (max 15 words per tip).
4. Audio / Pacing Note: State the recommended trending audio bpm and pacing.
5. The DM Conversation Trigger CTA (28-35s): Instruct the viewer to drop a specific 1-word keyword in comments to trigger an automated ManyChat DM link.

OUTPUT FORMAT:
- Two-Column Layout: Visual Scene / On-Screen Text (Column 1) | Spoken Audio / Voiceover (Column 2)
- Pinned Comment Template: First comment to pin under the post.
- Caption with SEO Keywords: Optimized for Instagram Search rankings.`,
    example_output: `[REEL SCRIPT LAYOUT]

Visual Scene & Text Overlay | Spoken Audio Voiceover
-----------------------------------|-----------------------------------
[0-3s] Creator holding a tablet showing a red negative ROI bar, tapping the screen. | "Stop boosting your Instagram posts with the blue button. You are handing Meta free money."
Text: "Stop clicking Boost Post" |
-----------------------------------|-----------------------------------
[3-8s] Cut to screen recording of Meta Ads Manager interface. | "The blue boost button optimizes for vanity likes from non-buyers. Here is what six-figure e-commerce brands do instead."
Text: "Likes != Customers" |
-----------------------------------|-----------------------------------
[8-25s] Fast cuts showing 3 workflow clicks. | "1: Open Ads Manager on desktop and choose Sales objective. 2: Set targeting to 'Broad' with creative as the targeting filter. 3: Test 3 distinct hooks with identical bodies to find the lowest CPA."
Text: "1. Sales Objective\n2. Broad Targeting\n3. 3-Hook Testing" |
-----------------------------------|-----------------------------------
[25-32s] Creator leaning into camera with direct eye contact. | "I put the full step-by-step setup guide into a free 2-page PDF. Comment 'ADS' below and I will DM you the instant link."
Text: "Comment 'ADS' for the guide" |

[PINNED COMMENT]
"Drop 'ADS' below and I'll send you the exact campaign structure template straight to your DMs 👇"

[INSTAGRAM SEO CAPTION]
"If your ad spend isn't returning at least 2.5x ROAS, the problem usually isn't your product—it's using the mobile boost feature. Save this Reel to reference when you set up your next campaign."`,
  },
  {
    slug: "carousel-post-designer-soc29",
    title: "Viral Instagram Carousel Blueprint",
    description:
      "Design 8-to-10 slide educational carousels engineered for peak bookmarking, saves, and shares. Complete with slide-by-slide copy, visual layouts, and swipe prompts.",
    tags: ["social", "instagram", "carousel", "saves", "engagement"],
    model: "claude",
    body: `Act as a master visual designer and content strategist responsible for multi-million reach Instagram carousel posts.

Your goal is to engineer an 8-to-10 slide Instagram carousel packed with dense, actionable value that compels viewers to bookmark (save) the post and share it to their Stories.

INPUTS:
- Carousel Subject: [e.g. 7 AI prompts to write landing pages, The 5-stage pricing framework, 10 mental models for founders]
- Target Audience: [Who is swiping?]
- Desired Takeaway: [What practical problem does this carousel solve?]
- Visual Theme: [e.g. Minimalist monochrome, Dark mode developer aesthetic, Clean editorial]

SLIDE-BY-SLIDE RETENTION RULES:
- Slide 1 (The Cover): Irresistible curiosity gap headline + clear subtitle + subtle swipe incentive ("Swipe →").
- Slide 2 (The Hook Expansion): Validate why the conventional approach fails in 2-3 sentences.
- Slides 3-7 (The Core Framework): 1 clear, punchy concept per slide. Use bold text, callout boxes, and comparison tables.
- Slide 8 (The Summary / Cheat Sheet): A single high-density summary visual that makes saving mandatory.
- Slide 9 (The Call to Action): Clear next step (Save for later, share with a friend, comment keyword).

OUTPUT FORMAT:
For each slide (1-9), provide:
- Header & Body Copy
- Visual Composition / Layout Note
- Micro-swipe prompt (text at bottom right)`,
    example_output: `[SLIDE 1: THE COVER]
- Layout: Large 48pt bold display typography on dark charcoal background with a neon lime accent dot.
- Headline: "The 5 Prompts That Replaced Our $5k Copywriter"
- Subtitle: "Tested on 12 client product launches. Copy-paste ready."
- Bottom Right: "Swipe to copy [1/9] →"

[SLIDE 2: THE PROBLEM WITH ZERO-SHOT AI]
- Layout: Split comparison graphic.
- Left Box (Red): "Standard AI: 'Write a landing page' → Bland, generic, 1.2% conversion."
- Right Box (Green): "Engineered Prompt: Role + Negative Constraints + Few-Shot Examples → 4.8% conversion."
- Bottom Right: "The 5 prompts [2/9] →"

[SLIDE 3: PROMPT 1 — THE HOOK ANCHOR]
- Layout: Code snippet block with monospace font and copy indicators.
- Content: Full prompt syntax with bracketed placeholders.
- Bottom Right: "Prompt 2 next [3/9] →"

[SLIDE 8: THE 1-PAGE CHEAT SHEET]
- Layout: Grid summary displaying all 5 prompt names, recommended models, and primary use case.
- Header: "The Quick Reference Sheet"
- Bottom Banner: "Save this slide so you have it ready when writing your next launch."`,
  },
  {
    slug: "youtube-title-and-description-seo-soc4",
    title: "High-CTR YouTube Title & Thumbnail Architect",
    description:
      "Generate 20 click-worthy YouTube titles across 4 psychological frameworks paired with high-contrast thumbnail visual briefs that maximize Click-Through Rate (CTR).",
    tags: ["social", "youtube", "seo", "thumbnails", "titles", "ctr"],
    model: "claude",
    body: `Act as a top-tier YouTube algorithm consultant who has packaged videos resulting in tens of millions of views.

Your task is to develop 20 high-CTR video titles and 5 complete thumbnail visual briefs based on psychological packaging principles used by creators like MrBeast, Ali Abdaal, and Colin and Samir.

INPUTS:
- Video Subject: [What is the video actually about?]
- Target Viewer: [Demographic, experience level, desires]
- Key Metric / Proof Point: [Any numbers, timeframes, or astonishing facts]
- Tone / Style: [e.g. Documentary investigative, Educational tutorial, Bold opinion, Personal challenge]

PACKAGING GUIDELINES:
1. Titles must be under 55 characters whenever possible to avoid mobile truncation.
2. Balance curiosity with clarity: The viewer must understand what they will gain, while feeling compelled to find out how.
3. Categorize 20 titles into 4 psychological angles:
   - Curiosity Gap & Secrets (Make the answer impossible to guess)
   - Extreme Contrast / Before & After (Highlight radical change)
   - The Warning / Avoid Disaster (Loss aversion trigger)
   - Direct Transformation & Simplicity (Speed, ease, concrete outcome)
4. For the 5 thumbnail concepts:
   - Provide a 3-element visual description (Subject Face/Action, Focal Object, Background Contrast).
   - Thumbnail Text: Maximum 3 words (never duplicate the video title words).

OUTPUT FORMAT:
- 20 Categorized Titles
- 5 Complete Thumbnail Briefs with visual composition notes and color contrast guidelines
- SEO Video Description: 200 words with primary keyword anchors and chapter markers template.`,
    example_output: `[ANGLE 1: CURIOSITY GAP & SECRETS]
1. "The AI Tool Nobody Is Talking About" (35 chars)
2. "Why 99% of Channels Die at 1,000 Subs" (37 chars)
3. "The Video That Changed My Entire Strategy" (41 chars)
4. "I Tested 50 AI Tools. Only 3 Matter." (36 chars)
5. "The Truth About YouTube in 2026" (31 chars)

[THUMBNAIL BRIEF 1]
- Visual Focus: Split screen. Left side: Desaturated creator looking stressed with empty analytics graph. Right side: Saturated, clean green hockey-stick graph with creator smiling holding a simple microphone.
- Thumbnail Text: "THE 1 FIX" (Bold yellow typography, black drop-shadow).
- Composition: High contrast between left (cool blue/gray) and right (warm amber).`,
  },
  {
    slug: "youtube-long-form-script-writer-soc1",
    title: "10-Minute YouTube Script Director",
    description:
      "Write comprehensive, retention-engineered long-form YouTube scripts featuring 30-second pacing hooks, pattern interrupts, and seamless mid-roll transition points.",
    tags: ["social", "youtube", "scripts", "long-form", "retention"],
    model: "claude",
    body: `Act as a master YouTube video scriptwriter and retention director.

Your task is to write a comprehensive, highly engaging 8-to-12 minute YouTube video script designed to maximize Average Percentage Viewed (APV) and prevent audience drop-off at key dip points.

INPUTS:
- Video Topic: [e.g. How to build an automated AI agency, Complete Notion workspace tour]
- Target Audience: [Who is watching and why?]
- Core Value / Takeaways: [3 to 5 core lessons or steps]
- Creator Style: [e.g. Conversational teaching, Documentary essay, Fast-paced tutorial]

RETENTION BLUEPRINT:
1. The Critical 30-Second Hook: Validate the thumbnail promise immediately, establish stakes, and show a glimpse of the climax.
2. The Roadmap (30-60s): Preview the value without giving away the breakthrough.
3. Content Blocks (Minutes 1-8): Divided into 3-4 distinct chapters, each ending on a mini-cliffhanger that leads into the next chapter.
4. Retention Resets (every 90 seconds): State specific visual/sound effects (SFX, zoom, graphic pop, B-roll shift) to reset viewer attention.
5. The End-Screen Handoff: Never say "In conclusion" or "Thanks for watching" (causes instant drop-off). Seamlessly pitch the next related video on your channel.

OUTPUT FORMAT:
Full script with:
- [A-ROLL]: Spoken words with vocal emphasis
- [B-ROLL / GRAPHICS]: Visual prompts and on-screen diagrams
- [SFX / MUSIC]: Audio tone transitions and sound cues`,
    example_output: `[0:00 - 0:30] CHAPTER 1: THE CRITICAL HOOK
[A-ROLL]: "By the end of this video, you will have a fully functioning AI workflow that handles 80% of your repetitive client work—without writing a single line of code."
[SFX]: Quick swoosh + keyboard clack.
[B-ROLL]: Fast 3-second montage of automated notifications firing in Slack.
[A-ROLL]: "Most people think this takes complex API connections. But in the next 10 minutes, I am going to show you the 3-step pipeline that runs entirely on free tier tools."

[0:30 - 1:15] CHAPTER 2: THE FATAL MISTAKE
[A-ROLL]: "Before we build it, here is the exact mistake that causes 90% of automated systems to break on day two..."`,
  },
  {
    slug: "youtube-shorts-strategy-soc8",
    title: "YouTube Shorts Looping Retention Hack",
    description:
      "Draft 30-to-45 second YouTube Shorts scripts engineered around seamless, infinite video loops that drive 120%+ average view duration and trigger algorithm virality.",
    tags: ["social", "youtube", "shorts", "looping", "growth"],
    model: "chatgpt",
    body: `Act as a YouTube Shorts algorithm specialist.

Your task is to create 3 high-retention YouTube Shorts scripts that utilize the "Infinite Loop" technique—where the final sentence flows seamlessly into the first sentence, making viewers watch multiple times before realizing the video restarted.

INPUTS:
- Topic: [What is the subject?]
- Target Audience: [Who is watching?]
- Key Insight: [The single most surprising or useful takeaway]

ENGINEERING INSTRUCTIONS:
1. Pacing: Target 25-40 seconds total duration (shorter scripts achieve higher percentage retention).
2. The Split Sentence Technique:
   - Part A of the sentence is the opening hook.
   - Part B of the sentence is the video conclusion.
   - When played on loop, Part B seamlessly resolves into Part A.
3. Information Density: 130-150 words per minute delivery rate. Every word must carry information; zero filler.
4. Visual Movement: Prescribe screen actions every 2 seconds to retain viewer eye tracking.

OUTPUT FORMAT:
- Title & Thumbnail Keyword
- The Exact Loop Transition (Ending line into Opening line)
- Script with Visual Cues and Spoken Voiceover`,
    example_output: `[THE INFINITE LOOP DEMONSTRATION]
- Opening Sentence (Part A): "...is the reason your code breaks every Friday afternoon."
- Closing Sentence (Part B): "And forgetting to validate this one environment variable..."
- Seamless Combination on Loop: "And forgetting to validate this one environment variable... is the reason your code breaks every Friday afternoon."

[FULL SCRIPT]
[0-3s] Creator holding head in hands looking at terminal.
Voiceover: "...is the reason your code breaks every Friday afternoon."

[3-15s] Rapid screen zoom showing configuration file.
Voiceover: "You push to staging, tests pass with flying colors, but the moment production deploys, auth tokens fail silently. Why? Because your local environment defaults to lax CORS cookies, while your production server enforces strict cross-origin checks."

[15-28s] Code snippet highlighting exact fix.
Voiceover: "Add this single line to your middleware: credentials true with specific origin headers. It takes 10 seconds to fix. And forgetting to validate this one environment variable..." (Loops instantly back to top)`,
  },
  {
    slug: "long-form-to-shorts-repurposer-soc21",
    title: "Long-Form to 7-Day Social Clip Repurposer",
    description:
      "Turn a single long-form video, podcast, or article transcript into 5 viral short-form video scripts, 2 Instagram carousels, and 3 engagement posts.",
    tags: ["social", "repurposing", "youtube", "tiktok", "reels", "systems"],
    model: "claude",
    body: `Act as an omnichannel content repurposing engine for elite creators and media brands.

Your goal is to ingest a single piece of long-form content (video transcript, podcast notes, or blog post) and extract an entire week of high-performing social media assets across TikTok, YouTube Shorts, and Instagram.

INPUTS:
- Source Transcript / Text: [Paste your transcript, interview notes, or article text here]
- Core Audience: [Who are we reaching across social?]
- Desired Brand Voice: [e.g. High-authority executive, Candid behind-the-scenes founder, Educational creator]

REPURPOSING DELIVERABLES:
1. 3x Short-Form Video Scripts (TikTok / Reels / Shorts):
   - Clip 1: The Tactical How-To (focused on quick execution)
   - Clip 2: The Counter-Intuitive Mythbuster (focused on controversy/debate)
   - Clip 3: The Story / Vulnerable Lesson (focused on emotional connection)
   Each with dedicated hook, 45s script, and visual direction.
2. 1x Instagram Carousel Outline (7 slides):
   - Cover headline, slide-by-slide bullet points, and CTA slide.
3. 2x Text-First Discussion Posts (ideal for Threads, LinkedIn, or YouTube Community tab):
   - Hook line, body breakdown, and discussion question.

OUTPUT FORMAT:
Cleanly separated sections with copy-ready markdown formatting, ready to hand straight to an editor or schedule.`,
    example_output: `[ASSET 1: TACTICAL SHORT-FORM CLIP]
- Hook: "If you're charging clients per hour, you are literally punishing yourself for being fast."
- Body: "When I started my agency, a project that took 10 hours paid $1,000. Two years later, I could do the exact same work in 2 hours—and earned $200. That's when I switched to value-based deliverables."
- Visual Cue: Creator demonstrating the math on a whiteboard.
- CTA: "Save this clip before your next client quote."

[ASSET 2: SEVEN-SLIDE CAROUSEL BLUEPRINT]
- Slide 1: "The Retainer Shift: How to Stop Chasing Invoices Every 30 Days"
- Slide 2: "Why hourly billing caps your income at 40 hours/week."
- Slide 3: "The 3 deliverables clients will gladly pay $3k/mo for on repeat."
- Slides 4-6: "Step-by-step breakdown of the retainer contract."
- Slide 7: "Save this cheat sheet for your next proposal."`,
  },
  {
    slug: "faceless-channel-content-engine-soc20",
    title: "Faceless Channel Automation Engine",
    description:
      "Generate complete faceless video workflows for TikTok and YouTube Shorts, including Midjourney/Flux image prompts, ElevenLabs voiceover scripts, and dynamic subtitle guides.",
    tags: ["social", "faceless", "automation", "youtube", "tiktok", "ai-video"],
    model: "chatgpt",
    body: `Act as a creative director for high-growth faceless social media channels (history, luxury, finance, philosophy, tech breakdowns).

Your task is to produce a turnkey faceless video package that requires zero on-camera presence, complete with audio narration, image generation prompts for Midjourney/Flux, and caption pacing.

INPUTS:
- Channel Niche: [e.g. Ancient Roman history, Stoic philosophy, Dark luxury aesthetics, Tech breakthroughs]
- Video Theme / Title: [What is the central focus?]
- Target Duration: [30-60 seconds]
- Desired Aesthetic: [e.g. Hyper-realistic cinematic film, Moody vintage documentary, Sleek minimalist 3D]

DELIVERABLES:
1. Complete Voiceover Script (130-150 words): Formatted with pronunciation guides and emotional tone tags (e.g. [Dramatic Pause], [Whisper], [Urgent]).
2. Visual Asset Prompts: 5-7 individual image generation prompts (for Flux or Midjourney) matching each scene beat, including camera angle, lighting, and aspect ratio (--ar 9:16).
3. Text Overlay / Dynamic Subtitle Guide: Specific keywords to highlight in bold/color for high viewer retention.
4. Audio & Soundscape Recommendation: Suggested ambient background track and SFX cue points (e.g. Thunder rumble, Whoosh, Clock ticking).

OUTPUT FORMAT:
Sequential scene-by-scene script table detailing Timecode | Voiceover | Image Generation Prompt | Subtitle Highlight.`,
    example_output: `[SCENE 1: TIMECODE 0:00 - 0:08]
- Voiceover: "[Low, resonant tone] In 44 BC, Julius Caesar was warned by a seer to beware the Ides of March. He ignored it. [Dramatic pause] Within 24 hours, the Roman Republic changed forever."
- Image Prompt (Flux / Midjourney): "Cinematic wide angle shot of Julius Caesar walking into the Roman Senate, atmospheric golden volumetric light streaming through marble pillars, moody shadows, hyper-realistic ancient Rome, 35mm film photography, 8k resolution --ar 9:16"
- Subtitle Emphasis: "BEWARE" (Gold), "44 BC" (Bold white).
- Sound Effect: Distant low drum hit + ambient stone hall reverb.`,
  },
  {
    slug: "engagement-reply-scripts-soc26",
    title: "Viral Comment & DM Conversation Loop",
    description:
      "Convert video viewers into engaged followers and buyers using algorithm-optimized comment reply scripts and automated DM outreach templates.",
    tags: ["social", "engagement", "comments", "growth", "conversion"],
    model: "chatgpt",
    body: `Act as a social media community manager and viral conversion copywriter.

Your task is to craft high-engagement comment reply formulas and direct message (DM) conversation scripts that double comment section velocity, boost post algorithmic favor, and convert casual viewers into loyal followers and leads.

INPUTS:
- Business / Channel Topic: [What is your account about?]
- Lead Magnet / Link: [What resource or offer are you sharing in DMs?]
- Typical Comment Types: [e.g. Skeptics, Enthusiasts, Questions, "Where did you get that?"]

FRAMEWORK & SCRIPTS TO PRODUCE:
1. The Curiosity Pin: The author's first comment designed to provoke friendly debate and get 50+ replies.
2. Fast Reply Frameworks (5 variations):
   - The Friendly Objection Neutralizer (addresses skeptics with grace and social proof)
   - The Value Add-on (gives an extra tip that wasn't in the video)
   - The Conversation Continuator (ends with a micro-question to trigger another reply)
   - The DM Bridge (naturally transitions public question into private chat)
3. Automated DM Welcome Sequence (3 messages):
   - Message 1: Instant delivery of promised resource without friction.
   - Message 2: Conversational qualification question (discovering their #1 hurdle).
   - Message 3: Low-pressure invitation to take the next step.

OUTPUT FORMAT:
Copy-ready reply templates with fill-in-the-blank brackets.`,
    example_output: `[THE CURIOSITY PIN (PIN AS FIRST COMMENT)]
"Most creators disagree with point #3. If you had to pick between posting daily or posting 2x per week with high production, which one grew your account faster? 👇"

[REPLY TEMPLATE: THE CONVERSATION CONTINUATOR]
"Appreciate you watching, [NAME]! Most people struggle with that exact part. Have you tried doing [QUICK ALTERNATIVE], or is your main bottleneck currently [COMMON PROBLEM]?"

[THE 3-STEP DM WELCOME SEQUENCE]
- Message 1 (Immediate): "Here is the exact [NAME OF RESOURCE] you requested: [LINK]. No email gate or signup required—just save a copy to your drive."
- Message 2 (Sent 2 hours later): "Quick question: what made you look into [TOPIC] this week? Are you building something from scratch or scaling an existing channel?"
- Message 3 (Follow-up): "Makes total sense. If you ever want me to take a quick look at your profile and give you 2 tweaks to boost your CTR, let me know!"`,
  },
];

async function deploy() {
  console.log(
    `Starting deployment of ${PROMPTS.length} professional social media prompts...`,
  );

  for (const p of PROMPTS) {
    try {
      console.log(`Updating ${p.slug}...`);
      const res = await fetch(
        `https://iwmljuoplkqyhdygajpi.supabase.co/functions/v1/data-api/prompts/${p.slug}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.AGENT_API_KEY!,
          },
          body: JSON.stringify({
            title: p.title,
            description: p.description,
            body: p.body,
            example_output: p.example_output,
            tags: p.tags,
            model: p.model,
            is_free: true,
            status: "approved",
          }),
        },
      );

      if (!res.ok) {
        console.error(
          `Failed to update ${p.slug}: status ${res.status}`,
          await res.text(),
        );
      } else {
        const json = await res.json();
        console.log(`✓ Successfully updated ${p.slug} (${json.prompt?.title})`);
      }
    } catch (err) {
      console.error(`Error updating ${p.slug}:`, err);
    }
  }

  console.log("Deployment complete.");
}

deploy();
