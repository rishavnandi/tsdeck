import { describe, it, expect } from "vitest";
import app from "../src/index";

// Simple in-memory KV mock for unit tests
class MockKV {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string, _opts?: { expirationTtl?: number }): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

function createMockEnv() {
  return { TSDECK_KV: new MockKV() as unknown as KVNamespace };
}

describe("API", () => {
  it("GET / returns ok", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
    const json = await res.json() as { ok: boolean };
    expect(json.ok).toBe(true);
  });

  it("GET /apps returns catalog", async () => {
    const res = await app.request("/apps");
    expect(res.status).toBe(200);
    const json = await res.json() as Array<{ id: string; name: string }>;
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBeGreaterThan(0);
    expect(json[0]).toHaveProperty("id");
    expect(json[0]).toHaveProperty("name");
  });

  it("POST /generate rejects empty apps", async () => {
    const res = await app.request("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: [] }),
    }, createMockEnv());
    expect(res.status).toBe(400);
  });

  it("POST /generate rejects invalid apps", async () => {
    const res = await app.request("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: ["not-an-app"] }),
    }, createMockEnv());
    expect(res.status).toBe(400);
  });

  it("POST /generate returns slug and url", async () => {
    const res = await app.request("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: ["jellyfin"] }),
    }, createMockEnv());
    expect(res.status).toBe(200);
    const json = await res.json() as { slug: string; url: string };
    expect(json.slug).toBeDefined();
    expect(json.url).toContain("/s/");
    expect(json.slug.length).toBe(8);
  });

  it("GET /s/:slug returns script for valid slug", async () => {
    const env = createMockEnv();
    const genRes = await app.request("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: ["jellyfin"] }),
    }, env);
    const { slug } = await genRes.json() as { slug: string };

    const res = await app.request(`/s/${slug}`, {}, env);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/x-shellscript");
    const body = await res.text();
    expect(body).toContain("#!/usr/bin/env bash");
    expect(body).toContain("jellyfin");
  });

  it("GET /s/:slug returns 503 when KV is unavailable", async () => {
    const res = await app.request("/s/nonexistent");
    expect(res.status).toBe(503);
  });

  it("POST /generate returns 429 after too many requests", async () => {
    const env = createMockEnv();
    for (let i = 0; i < 10; i++) {
      const res = await app.request("/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apps: ["jellyfin"] }),
      }, env);
      expect(res.status).toBe(200);
    }
    const res = await app.request("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: ["jellyfin"] }),
    }, env);
    expect(res.status).toBe(429);
  });

  it("GET /apps includes depends_on and warnings", async () => {
    const res = await app.request("/apps");
    expect(res.status).toBe(200);
    const json = await res.json() as Array<{ id: string; depends_on?: string[]; warnings?: string[] }>;
    const bazarr = json.find((a) => a.id === "bazarr");
    expect(bazarr).toBeDefined();
    expect(bazarr!.depends_on).toContain("sonarr");
    expect(bazarr!.depends_on).toContain("radarr");

    const immich = json.find((a) => a.id === "immich");
    expect(immich).toBeDefined();
    expect(immich!.warnings).toBeDefined();
    expect(immich!.warnings!.length).toBeGreaterThan(0);
  });

  it("POST /generate returns dependency warnings for missing depends_on apps", async () => {
    const env = createMockEnv();
    const res = await app.request("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: ["bazarr"] }), // bazarr depends on sonarr + radarr
    }, env);
    expect(res.status).toBe(200);
    const json = await res.json() as { slug: string; url: string; warnings: string[] };
    expect(json.warnings).toBeDefined();
    expect(json.warnings.length).toBeGreaterThan(0);
    expect(json.warnings.some((w) => w.includes("Sonarr") || w.includes("Radarr"))).toBe(true);
  });

  it("POST /generate returns app warnings when selected", async () => {
    const env = createMockEnv();
    const res = await app.request("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apps: ["immich"] }),
    }, env);
    expect(res.status).toBe(200);
    const json = await res.json() as { slug: string; url: string; warnings: string[] };
    expect(json.warnings).toBeDefined();
    expect(json.warnings.some((w) => w.includes("4GB RAM"))).toBe(true);
  });
});
