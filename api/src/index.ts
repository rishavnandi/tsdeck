import { Hono } from "hono";
import { generateScript } from "./generator";
import { APPS } from "./apps";

export interface Env {
  TSDECK_KV: KVNamespace;
}

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function checkRateLimit(kv: KVNamespace, key: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60_000; // 1 minute
  const maxRequests = 10;
  const windowKey = `ratelimit:${key}`;

  const stored = await kv.get(windowKey);
  let requests: number[] = stored ? JSON.parse(stored) : [];

  // Remove entries outside the current window
  requests = requests.filter((t) => now - t < windowMs);

  if (requests.length >= maxRequests) {
    return false;
  }

  requests.push(now);
  await kv.put(windowKey, JSON.stringify(requests), { expirationTtl: 60 });
  return true;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("*", async (c, next) => {
  c.header("Access-Control-Allow-Origin", "*");
  c.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type");
  if (c.req.method === "OPTIONS") {
    return c.body(null, 204);
  }
  await next();
});

// Health check
app.get("/", (c) => c.json({ ok: true, version: "1.0.0" }));

// App catalog
app.get("/apps", (c) => {
  return c.json(
    APPS.map((a) => ({
      id: a.id,
      name: a.meta.name,
      description: a.meta.description,
      category: a.meta.category,
      icon: a.meta.icon,
      depends_on: a.meta.depends_on,
      warnings: a.meta.warnings,
    }))
  );
});

// Generate slug
app.post("/generate", async (c) => {
  const clientIp = c.req.header("CF-Connecting-IP") || "unknown";
  const allowed = await checkRateLimit(c.env.TSDECK_KV, clientIp);
  if (!allowed) {
    return c.json({ error: "Rate limit exceeded. Please try again later." }, 429);
  }

  const body = await c.req.json<{ apps?: string[] }>();
  const appIds = body.apps || [];

  if (appIds.length === 0) {
    return c.json({ error: "No apps selected" }, 400);
  }

  const validIds = new Set(APPS.map((a) => a.id));
  const invalid = appIds.filter((id) => !validIds.has(id));
  if (invalid.length > 0) {
    return c.json({ error: `Invalid apps: ${invalid.join(", ")}` }, 400);
  }

  // Dependency and conflict checks
  const warnings: string[] = [];
  const selectedSet = new Set(appIds);
  for (const appId of appIds) {
    const app = APPS.find((a) => a.id === appId);
    if (!app) continue;
    if (app.meta.depends_on) {
      const missing = app.meta.depends_on.filter((d) => !selectedSet.has(d));
      if (missing.length > 0) {
        warnings.push(
          `${app.meta.name} works best with ${missing.map((m) => APPS.find((a) => a.id === m)?.meta.name || m).join(" and ")}.`
        );
      }
    }
    if (app.meta.warnings) {
      for (const w of app.meta.warnings) {
        warnings.push(`${app.meta.name}: ${w}`);
      }
    }
  }

  const slug = generateSlug();
  const data = JSON.stringify({ apps: appIds });
  await c.env.TSDECK_KV.put(slug, data, { expirationTtl: 900 }); // 15 minutes

  const url = `${new URL(c.req.url).origin}/s/${slug}`;
  return c.json({ slug, url, warnings });
});

// Serve script
app.get("/s/:slug", async (c) => {
  if (!c.env?.TSDECK_KV) {
    return c.text("KV storage not available", 503);
  }

  const slug = c.req.param("slug");
  const data = await c.env.TSDECK_KV.get(slug);

  if (!data) {
    return c.text("Slug expired or not found. Please regenerate at https://tsdeck.pages.dev", 404);
  }

  const { apps: appIds } = JSON.parse(data) as { apps: string[] };
  const selectedApps = APPS.filter((a) => appIds.includes(a.id));

  if (selectedApps.length === 0) {
    return c.text("No valid apps found for this slug.", 404);
  }

  const script = generateScript(selectedApps);
  return c.body(script, 200, { "Content-Type": "text/x-shellscript" });
});

export default app;
