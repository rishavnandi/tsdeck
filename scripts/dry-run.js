#!/usr/bin/env bun
// Dry-run compose preview: assembles the full docker-compose.yml for selected apps
// Usage:
//   bun scripts/dry-run.js                          # all apps
//   bun scripts/dry-run.js jellyfin sonarr radarr    # specific apps
//   bun scripts/dry-run.js --category media          # all apps in a category
//   bun scripts/dry-run.js --list                    # list all apps and categories

import { readdirSync, readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

const APPS_DIR = new URL("../apps", import.meta.url).pathname;
const MANIFEST_PATH = join(APPS_DIR, "manifest.json");

function loadManifest() {
  return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8"));
}

function extractServices(content) {
  const lines = content.split("\n");
  let inServices = false;
  const result = [];
  for (const line of lines) {
    if (/^services:\s*$/.test(line)) { inServices = true; continue; }
    if (inServices) {
      const trimmed = line.trimStart();
      if (trimmed && !trimmed.startsWith("#") && !/^\s/.test(line) && line.trim().length > 0) break;
      result.push(line);
    }
  }
  return result.join("\n");
}

function extractVolumes(content) {
  const lines = content.split("\n");
  let inVolumes = false;
  const result = [];
  for (const line of lines) {
    if (/^volumes:\s*$/.test(line)) { inVolumes = true; continue; }
    if (inVolumes) {
      const trimmed = line.trimStart();
      if (trimmed && !trimmed.startsWith("#") && !/^\s/.test(line) && line.trim().length > 0) break;
      result.push(line);
    }
  }
  return result.join("\n");
}

function assembleCompose(appIds) {
  const parts = [];
  const volumeParts = [];

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
      console.error(`❌ Missing compose.yaml for: ${appId}`);
      process.exit(1);
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

function main() {
  const args = process.argv.slice(2);
  const manifest = loadManifest();

  // --list: show all apps grouped by category
  if (args.includes("--list")) {
    const byCategory = {};
    for (const app of manifest) {
      if (!byCategory[app.category]) byCategory[app.category] = [];
      byCategory[app.category].push(app);
    }
    for (const [cat, apps] of Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`\n📂 ${cat} (${apps.length})`);
      for (const app of apps.sort((a, b) => a.name.localeCompare(b.name))) {
        console.log(`   ${app.id.padEnd(30)} ${app.name}`);
      }
    }
    console.log(`\n📊 Total: ${manifest.length} apps across ${Object.keys(byCategory).length} categories`);
    return;
  }

  // --category <name>: select all apps in a category
  const catIdx = args.indexOf("--category");
  let selectedIds;
  if (catIdx !== -1 && args[catIdx + 1]) {
    const targetCat = args[catIdx + 1];
    selectedIds = manifest.filter((a) => a.category === targetCat).map((a) => a.id);
    if (selectedIds.length === 0) {
      console.error(`❌ No apps found in category: ${targetCat}`);
      console.error(`   Available: ${[...new Set(manifest.map((a) => a.category))].sort().join(", ")}`);
      process.exit(1);
    }
    console.error(`📂 Category "${targetCat}": ${selectedIds.length} apps`);
  } else if (args.length > 0) {
    // Specific app IDs
    selectedIds = args;
    const validIds = new Set(manifest.map((a) => a.id));
    const invalid = selectedIds.filter((id) => !validIds.has(id));
    if (invalid.length > 0) {
      console.error(`❌ Unknown apps: ${invalid.join(", ")}`);
      process.exit(1);
    }
  } else {
    // All apps
    selectedIds = manifest.map((a) => a.id);
    console.error(`📦 All ${selectedIds.length} apps selected`);
  }

  console.error(`🔧 Assembling docker-compose.yml for ${selectedIds.length} apps...\n`);
  const compose = assembleCompose(selectedIds);

  // Count services
  const serviceCount = compose.split("\n").filter((l) => /^  [a-z][\w-]*:/.test(l)).length;
  console.error(`✅ Generated ${serviceCount} services (including tsdproxy)\n`);

  // Output the compose to stdout
  console.log(compose);
}

main();
