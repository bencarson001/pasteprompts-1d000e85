import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Use anon key for read-only SSR data

// Using anon key for public data is okay because these are public prompts
const supabase = SUPABASE_URL && SUPABASE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Trust proxy for reverse proxy environments (Cloud Run, Cloudflare, NGINX)
  app.set("trust proxy", true);

  // Enforce HTTPS in production and set modern web security / HSTS headers
  app.use((req, res, next) => {
    const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
    const host = req.headers.host || "";

    // If HTTP in production environment, redirect 301 to HTTPS
    if (
      process.env.NODE_ENV === "production" &&
      !isHttps &&
      host &&
      !host.includes("localhost") &&
      !host.includes("127.0.0.1")
    ) {
      return res.redirect(301, `https://${host}${req.originalUrl || req.url}`);
    }

    // Set HSTS and security headers
    if (process.env.NODE_ENV === "production" || isHttps) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self' https: data: blob: 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagmanager.com https://www.google-analytics.com https://adservice.google.com https://tpc.googlesyndication.com; img-src 'self' https: data: blob:; style-src 'self' https: 'unsafe-inline'; font-src 'self' https: data:; connect-src 'self' https: wss:; frame-src 'self' https:;"
    );
    next();
  });

  // JSON parser for API requests
  app.use(express.json());

  // In-memory view deduplication cache: `${ip}_${handle}` -> timestamp
  const profileViewsCache = new Map<string, number>();

  // Deduplicated profile view API
  app.post("/api/profile/view", (req, res) => {
    try {
      const { handle, viewerId } = req.body || {};
      if (!handle) {
        return res.status(400).json({ error: "Handle required" });
      }
      const clientIp = req.ip || req.headers["x-forwarded-for"] || "anonymous";
      const cacheKey = `${clientIp}_${handle}`;
      const lastViewTime = profileViewsCache.get(cacheKey) || 0;
      const now = Date.now();

      // Only count once every 30 minutes per IP/handle
      if (now - lastViewTime > 30 * 60 * 1000) {
        profileViewsCache.set(cacheKey, now);
        // Clean old keys if map exceeds 10,000 items
        if (profileViewsCache.size > 10000) {
          const expirationCutoff = now - 60 * 60 * 1000;
          for (const [k, v] of profileViewsCache.entries()) {
            if (v < expirationCutoff) profileViewsCache.delete(k);
          }
        }
      }
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Server-side profile endpoint with strict data redaction for Guests
  app.get("/api/profile/:handle", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).json({ error: "Database unconfigured" });
      }
      const handle = req.params.handle;
      const viewerTier = (req.query.viewer_tier as string) || "guest";

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, handle, display_name, bio, avatar_url, banner_url, website_url, twitter_handle, total_sales, is_creator, created_at")
        .eq("handle", handle)
        .maybeSingle();

      if (error || !profile) {
        return res.status(404).json({ error: "Profile not found" });
      }

      // Guest tier receives ONLY redacted non-sensitive preview data
      if (viewerTier === "guest") {
        return res.json({
          id: profile.id,
          handle: profile.handle,
          display_name: profile.display_name,
          bio: profile.bio ? profile.bio.slice(0, 90) + "..." : null,
          avatar_url: profile.avatar_url,
          is_creator: profile.is_creator,
          created_at: profile.created_at,
          is_restricted: true,
        });
      }

      // Free or paid member
      return res.json({
        ...profile,
        banner_url: profile.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        total_sales: viewerTier === "free" ? undefined : profile.total_sales,
        is_restricted: false,
      });
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve the sitemap dynamically
  app.get("/sitemap.xml", async (req, res) => {
    try {
      if (!supabase) {
        return res.status(500).send("Supabase not configured");
      }
      
      const { data: prompts } = await supabase
        .from("prompts")
        .select("slug, updated_at")
        .eq("status", "approved")
        .order("updated_at", { ascending: false });

      const { data: categories } = await supabase
        .from("categories")
        .select("slug");

      const baseUrl = "https://pasteprompts.co.uk";
      
      let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      
      // Static core routes
      const staticRoutes = [
        { path: "", priority: "1.0", freq: "daily" },
        { path: "/browse", priority: "0.9", freq: "daily" },
        { path: "/browse/free", priority: "0.9", freq: "daily" },
        { path: "/prompts/chatgpt-prompts", priority: "0.9", freq: "weekly" },
        { path: "/prompts/claude-prompts", priority: "0.9", freq: "weekly" },
        { path: "/prompts/gemini-prompts", priority: "0.9", freq: "weekly" },
        { path: "/prompts/midjourney-prompts", priority: "0.9", freq: "weekly" },
        { path: "/prompts/dalle-prompts", priority: "0.9", freq: "weekly" },
        { path: "/prompts/sora-prompts", priority: "0.9", freq: "weekly" },
        { path: "/prompts/free-ai-prompts", priority: "0.9", freq: "weekly" },
        { path: "/guides", priority: "0.8", freq: "weekly" },
        { path: "/guides/how-to-write-effective-ai-prompts", priority: "0.8", freq: "weekly" },
        { path: "/guides/chatgpt-vs-claude-vs-gemini-prompting", priority: "0.8", freq: "weekly" },
        { path: "/guides/system-prompts-vs-user-prompts", priority: "0.8", freq: "weekly" },
        { path: "/guides/midjourney-v6-prompt-formula", priority: "0.8", freq: "weekly" },
        { path: "/guides/how-to-sell-ai-prompts-and-make-money", priority: "0.8", freq: "weekly" },
        { path: "/glossary", priority: "0.8", freq: "weekly" },
        { path: "/pro", priority: "0.7", freq: "monthly" },
        { path: "/about", priority: "0.7", freq: "monthly" },
        { path: "/trust", priority: "0.7", freq: "monthly" },
        { path: "/contact", priority: "0.7", freq: "monthly" },
        { path: "/privacy", priority: "0.6", freq: "monthly" },
        { path: "/terms", priority: "0.6", freq: "monthly" },
        { path: "/cookies", priority: "0.5", freq: "monthly" },
        { path: "/disclaimer", priority: "0.5", freq: "monthly" },
        { path: "/refunds", priority: "0.5", freq: "monthly" },
        { path: "/site-map", priority: "0.6", freq: "monthly" },
        { path: "/legal/terms", priority: "0.5", freq: "monthly" },
        { path: "/legal/privacy", priority: "0.5", freq: "monthly" },
        { path: "/legal/refunds", priority: "0.5", freq: "monthly" },
        { path: "/legal/disclaimer", priority: "0.5", freq: "monthly" },
      ];
      for (const route of staticRoutes) {
        sitemap += `  <url>\n    <loc>${baseUrl}${route.path}</loc>\n    <changefreq>${route.freq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>\n`;
      }

      // Categories
      if (categories) {
        for (const cat of categories) {
          sitemap += `  <url>\n    <loc>${baseUrl}/category/${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
      }

      // Prompts
      if (prompts) {
        for (const prompt of prompts) {
          const lastmod = new Date(prompt.updated_at).toISOString();
          sitemap += `  <url>\n    <loc>${baseUrl}/prompt/${prompt.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
      }

      // Profiles (Creators)
      const { data: profiles } = await supabase
        .from("profiles")
        .select("handle, created_at")
        .eq("is_creator", true);

      if (profiles) {
        for (const profile of profiles) {
          const lastmod = profile.created_at ? new Date(profile.created_at).toISOString() : new Date().toISOString();
          sitemap += `  <url>\n    <loc>${baseUrl}/creators/${profile.handle}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
        }
      }
      
      sitemap += `</urlset>`;
      
      res.header("Content-Type", "application/xml");
      res.send(sitemap);
    } catch (e) {
      console.error("Error generating sitemap:", e);
      res.status(500).send("Error generating sitemap");
    }
  });

  let vite: import("vite").ViteDevServer | undefined;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false })); // don't serve index automatically
  }

  // Intercept all remaining GET routes to inject SEO metadata, falling back to serving index.html
  app.use(async (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return next();
    }
    try {
      let template = "";
      if (process.env.NODE_ENV !== "production") {
        template = await fs.readFile(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
      } else {
        template = await fs.readFile(path.resolve(process.cwd(), "dist/index.html"), "utf-8");
      }

      // Check if it's a prompt route (either /prompt/:slug or /prompt/:category/:slug)
      const promptMatch = req.path.match(/^\/prompt\/(?:([^/]+)\/)?([^/]+)\/?$/);
      const profileMatch = req.path.match(/^\/(?:profile|creators)\/([^/]+)\/?$/);
      
      if (promptMatch && supabase) {
        const slug = promptMatch[2];
        const { data: prompt } = await supabase
          .from("prompts")
          .select("title, description, social_image_url")
          .eq("slug", slug)
          .single();

        if (prompt) {
          const title = `${prompt.title} | Paste Prompts`;
          const desc = prompt.description || `Get the ${prompt.title} prompt on Paste Prompts.`;
          const image = prompt.social_image_url || "https://storage.googleapis.com/gpt-engineer-file-uploads/gVA6LFVAv1NR5HdixPMdl8cXxqp2/social-images/social-1781312540994-4621.webp";
          
          template = template
            .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
            .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${desc}"`)
            .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`)
            .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${desc}"`)
            .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${image}"`)
            .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
            .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${desc}"`)
            .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${image}"`);
        }
      } else if (profileMatch && supabase) {
        const handle = profileMatch[1];
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, handle, bio, avatar_url")
          .eq("handle", handle)
          .maybeSingle();

        if (profile) {
          const displayName = profile.display_name || `@${profile.handle}`;
          const title = `${displayName} — AI Prompt Creator | Paste Prompts`;
          const desc = profile.bio || `Explore top engineered AI prompts by ${displayName} on Paste Prompts.`;
          const image = profile.avatar_url || "https://storage.googleapis.com/gpt-engineer-file-uploads/gVA6LFVAv1NR5HdixPMdl8cXxqp2/social-images/social-1781312540994-4621.webp";

          template = template
            .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
            .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${desc}"`)
            .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${title}"`)
            .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${desc}"`)
            .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${image}"`)
            .replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${title}"`)
            .replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${desc}"`)
            .replace(/<meta name="twitter:image" content="[^"]*"/, `<meta name="twitter:image" content="${image}"`);
        }
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      console.error("Error serving HTML:", e);
      res.status(500).end(e instanceof Error ? e.message : String(e));
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
