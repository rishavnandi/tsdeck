import { describe, it, expect } from "vitest";
import { generateScript, collectUniqueEnvVars } from "../src/generator";
import { APPS } from "../src/apps";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const APPS_DIR = join(__dirname, "../../apps");

/**
 * extractServices / extractVolumes mirror the bash functions in the bootstrap
 * script, but implemented in TypeScript for local testing.
 */
function extractServices(composeContent: string): string {
  const lines = composeContent.split("\n");
  let inServices = false;
  const result: string[] = [];

  for (const line of lines) {
    if (/^services:\s*$/.test(line)) {
      inServices = true;
      continue;
    }
    if (inServices) {
      const trimmed = line.trimStart();
      if (trimmed && !trimmed.startsWith("#") && !/^\s/.test(line) && line.trim().length > 0) {
        break;
      }
      result.push(line);
    }
  }
  return result.join("\n");
}

function extractVolumes(composeContent: string): string {
  const lines = composeContent.split("\n");
  let inVolumes = false;
  const result: string[] = [];

  for (const line of lines) {
    if (/^volumes:\s*$/.test(line)) {
      inVolumes = true;
      continue;
    }
    if (inVolumes) {
      const trimmed = line.trimStart();
      if (trimmed && !trimmed.startsWith("#") && !/^\s/.test(line) && line.trim().length > 0) {
        break;
      }
      result.push(line);
    }
  }
  return result.join("\n");
}

/**
 * Assemble a unified docker-compose.yml from selected app IDs,
 * reading compose.yaml templates from disk.
 */
function assembleCompose(appIds: string[]): string {
  const parts: string[] = [];
  const volumeParts: string[] = [];

  // TSDProxy header (always present)
  parts.push("services:");
  parts.push("  tsdproxy:");
  parts.push("    image: almeidapaulopt/tsdproxy:latest");
  parts.push("    container_name: tsdproxy");
  parts.push("    environment:");
  parts.push("      - TSDPROXY_AUTHKEY=${TS_AUTHKEY}");
  parts.push("    volumes:");
  parts.push("      - /var/run/docker.sock:/var/run/docker.sock");
  parts.push("      - tsdproxy-data:/data");
  parts.push("    restart: always");
  parts.push("");

  volumeParts.push("volumes:");
  volumeParts.push("  tsdproxy-data:");

  for (const appId of appIds) {
    const composePath = join(APPS_DIR, appId, "compose.yaml");
    if (!existsSync(composePath)) {
      throw new Error(`Missing compose.yaml for app: ${appId}`);
    }
    const content = readFileSync(composePath, "utf-8");
    const services = extractServices(content);
    if (services.trim()) {
      parts.push(services);
      parts.push("");
    }

    const volumes = extractVolumes(content);
    if (volumes.trim()) {
      volumeParts.push(volumes);
    }
  }

  return parts.join("\n") + "\n" + volumeParts.join("\n") + "\n";
}

// ────────────────────────────────────────────────────────────────────
// Test suites
// ────────────────────────────────────────────────────────────────────

describe("Dry-Run Compose Assembly", () => {
  it("assembles a single-app stack (jellyfin)", () => {
    const compose = assembleCompose(["jellyfin"]);

    expect(compose).toContain("services:");
    expect(compose).toContain("tsdproxy:");
    expect(compose).toContain("jellyfin:");
    expect(compose).toContain("volumes:");
    expect(compose).toContain("tsdproxy-data:");
    // Validate no duplicate services: key
    const servicesCount = (compose.match(/^services:/gm) || []).length;
    expect(servicesCount).toBe(1);
  });

  it("assembles a multi-app stack (sonarr + radarr + prowlarr + qbittorrent)", () => {
    const appIds = ["sonarr", "radarr", "prowlarr", "qbittorrent"];
    const compose = assembleCompose(appIds);

    for (const id of appIds) {
      expect(compose).toContain(`${id}:`);
    }
    expect(compose).toContain("tsdproxy:");

    const servicesCount = (compose.match(/^services:/gm) || []).length;
    expect(servicesCount).toBe(1);
  });

  it("assembles a complex multi-service app (immich)", () => {
    const compose = assembleCompose(["immich"]);

    // Immich has multiple services (server, machine-learning, postgres, redis)
    expect(compose).toContain("immich");
    expect(compose).toContain("tsdproxy:");
    expect(compose).toContain("volumes:");
  });

  it("assembles the full 133-app stack without errors", () => {
    const allIds = APPS.map((a) => a.id);
    expect(() => assembleCompose(allIds)).not.toThrow();

    const compose = assembleCompose(allIds);

    // Should have exactly one services: and one volumes: key
    const servicesCount = (compose.match(/^services:/gm) || []).length;
    const volumesCount = (compose.match(/^volumes:/gm) || []).length;
    expect(servicesCount).toBe(1);
    expect(volumesCount).toBe(1);

    // Should contain tsdproxy
    expect(compose).toContain("tsdproxy:");
    expect(compose).toContain("tsdproxy-data:");

    // Should have at least 134 indented service blocks (some apps have multiple services)
    // Count top-level service names (lines matching "  <name>:" but not deeper indentation)
    const serviceNames = compose
      .split("\n")
      .filter((line) => /^  [a-z][\w-]*:/.test(line))
      .map((line) => line.trim().replace(":", ""));
    // At least 133 apps + tsdproxy + extras like immich sub-services
    expect(serviceNames.length).toBeGreaterThanOrEqual(134);
  });

  it("does not leak top-level keys from individual templates into services block", () => {
    const allIds = APPS.map((a) => a.id);
    const compose = assembleCompose(allIds);

    // Between "services:" and "volumes:", there should be no un-indented lines
    // (except empty lines and comments)
    const lines = compose.split("\n");
    let inServices = false;
    for (const line of lines) {
      if (/^services:/.test(line)) {
        inServices = true;
        continue;
      }
      if (/^volumes:/.test(line)) {
        inServices = false;
        continue;
      }
      if (inServices && line.trim().length > 0 && !line.startsWith(" ") && !line.startsWith("#")) {
        throw new Error(`Leaked top-level key in services block: "${line}"`);
      }
    }
  });
});

describe("Dry-Run Script Generation", () => {
  it("generates a valid bash script for the full catalog", () => {
    const script = generateScript(APPS);

    expect(script).toContain("#!/usr/bin/env bash");
    expect(script).toContain("tsdproxy");
    expect(script).toContain("run_questionnaire");
    expect(script).toContain("assemble_compose");
    expect(script).toContain("DRY_RUN");

    // Should reference all 133 apps in the app array
    for (const app of APPS) {
      expect(script).toContain(`"${app.id}"`);
    }
  });

  it("generates valid questionnaire with all unique env vars", () => {
    const envVars = collectUniqueEnvVars(APPS);
    const script = generateScript(APPS);

    for (const { var: envVar } of envVars) {
      expect(script).toContain(`"${envVar.name}"`);
    }
  });
});

describe("Category Integrity", () => {
  const VALID_CATEGORIES = [
    "media", "media-management", "downloads", "documents", "bookmarks",
    "productivity", "home", "automation", "files", "ai", "communication",
    "development", "dashboards", "infrastructure", "monitoring", "networking",
    "security", "backup", "gaming", "remote-access", "utilities",
  ];

  it("every app has a valid category", () => {
    for (const app of APPS) {
      expect(
        VALID_CATEGORIES,
        `App "${app.id}" has invalid category "${app.meta.category}"`
      ).toContain(app.meta.category);
    }
  });

  it("apps are sorted alphabetically in the registry", () => {
    const ids = APPS.map((a) => a.id);
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it("no category is empty", () => {
    const catCounts = new Map<string, number>();
    for (const app of APPS) {
      catCounts.set(app.meta.category, (catCounts.get(app.meta.category) || 0) + 1);
    }
    for (const cat of VALID_CATEGORIES) {
      expect(
        catCounts.get(cat),
        `Category "${cat}" has no apps`
      ).toBeGreaterThan(0);
    }
  });
});
