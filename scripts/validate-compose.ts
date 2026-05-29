#!/usr/bin/env bun
// Validate a docker-compose.yml file for structural correctness
// Usage: bun scripts/validate-compose.ts <path-to-compose.yaml>
// Pipe usage: bun scripts/dry-run.js jellyfin immich 2>/dev/null | bun scripts/validate-compose.ts /dev/stdin

import { readFileSync } from "fs";

const inputPath = process.argv[2] || "/dev/stdin";
const compose = readFileSync(inputPath, "utf-8");
const lines = compose.split("\n");

const issues: string[] = [];
const warnings: string[] = [];
let pass = true;

function ok(msg: string) { console.log(`  ✅ ${msg}`); }
function fail(msg: string) { issues.push(msg); console.log(`  ❌ ${msg}`); pass = false; }
function warn(msg: string) { warnings.push(msg); console.log(`  ⚠️  ${msg}`); }

console.log("\n═══════════════════════════════════════════════════════════");
console.log("  TSDeck Compose Structural Validator");
console.log("═══════════════════════════════════════════════════════════\n");

// ─── 1. Top-level key counts ──────────────────────────────────────────────────
const servicesCount = lines.filter(l => /^services:\s*$/.test(l)).length;
const volumesCount = lines.filter(l => /^volumes:\s*$/.test(l)).length;

servicesCount === 1 ? ok("Exactly 1 'services:' block") : fail(`Expected 1 'services:' key, found ${servicesCount}`);
volumesCount === 1 ? ok("Exactly 1 'volumes:' block") : fail(`Expected 1 'volumes:' key, found ${volumesCount}`);

// ─── 2. No top-level key leakage inside services block ───────────────────────
let inServicesSection = false;
const leaks: string[] = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (/^services:\s*$/.test(line)) { inServicesSection = true; continue; }
  if (/^volumes:\s*$/.test(line)) { inServicesSection = false; continue; }
  if (inServicesSection && line.trim().length > 0 && !line.startsWith(" ") && !line.startsWith("#")) {
    leaks.push(`line ${i+1}: "${line}"`);
  }
}
leaks.length === 0
  ? ok("No top-level key leakage between services/volumes")
  : fail(`Key leaks in services block: ${leaks.join(", ")}`);

// ─── 3. Parse service names (only within the services: block) ─────────────────
const serviceNames: string[] = [];
let inSvcSection = false;
for (const line of lines) {
  if (/^services:\s*$/.test(line)) { inSvcSection = true; continue; }
  if (/^volumes:\s*$/.test(line)) { inSvcSection = false; continue; }
  if (inSvcSection && /^  [a-z][\w-]*:\s*$/.test(line)) {
    serviceNames.push(line.trim().replace(":", ""));
  }
}

// Parse volume names (only within the volumes: block)
const volumeNames: string[] = [];
let inVolSection = false;
for (const line of lines) {
  if (/^volumes:\s*$/.test(line)) { inVolSection = true; continue; }
  if (inVolSection && /^  [a-z][\w-]*:/.test(line)) {
    volumeNames.push(line.trim().replace(/:.*$/, ""));
  }
}

ok(`Services: ${serviceNames.length} (incl. tsdproxy)`);
console.log(`     ${serviceNames.join(", ")}`);
ok(`Named volumes declared: ${volumeNames.length}`);
console.log(`     ${volumeNames.join(", ")}\n`);

// ─── 4. All named volume references are declared ──────────────────────────────
const referencedVolumes: string[] = [];
// Match named volume mounts: "  - volname:/some/path"
const volRefRe = /^\s+- ([\w-]+):\/\S+/gm;
let m: RegExpExecArray | null;
while ((m = volRefRe.exec(compose)) !== null) {
  referencedVolumes.push(m[1]);
}
const volumeSet = new Set(volumeNames);
const undeclaredVols = [...new Set(referencedVolumes)].filter(v => !volumeSet.has(v));
undeclaredVols.length === 0
  ? ok(`All ${[...new Set(referencedVolumes)].length} named volume references are declared`)
  : fail(`Volume references without declaration: ${undeclaredVols.join(", ")}`);

// ─── 5. TSDProxy labels on user-facing services ───────────────────────────────
// Sub-services that are internal infra (db, cache, agent, etc.) don't need tsdproxy labels
const subServicePatterns = [
  /-db$/, /-database$/, /-redis$/, /-broker$/, /-agent$/, /^ferretdb$/,
  /-machine-learning$/, /-periphery$/, /komodo-periphery/,
];
const tsdproxyRequired = serviceNames.filter(
  s => s !== "tsdproxy" && !subServicePatterns.some(p => p.test(s))
);

// Build per-service content blocks (only in services section)
const serviceBlocks: Record<string, string> = {};
let currentSvc: string | null = null;
let inSvcBlock = false;
for (const line of lines) {
  if (/^services:\s*$/.test(line)) { inSvcBlock = true; continue; }
  if (/^volumes:\s*$/.test(line)) { inSvcBlock = false; currentSvc = null; continue; }
  if (!inSvcBlock) continue;
  const svcMatch = line.match(/^  ([a-z][\w-]*):\s*$/);
  if (svcMatch) { currentSvc = svcMatch[1]; serviceBlocks[currentSvc] = ""; }
  if (currentSvc) serviceBlocks[currentSvc] += line + "\n";
}

const missingTsdproxy = tsdproxyRequired.filter(
  s => !(serviceBlocks[s] || "").includes("tsdproxy.enable")
);
if (missingTsdproxy.length === 0) {
  ok(`All ${tsdproxyRequired.length} user-facing services have tsdproxy.enable label`);
} else {
  warn(`${missingTsdproxy.length} user-facing services missing tsdproxy.enable: ${missingTsdproxy.join(", ")}`);
}

// ─── 6. Hardcoded credentials check ─────────────────────────────────────────
// Flags values that look like real secrets (not ${VAR} references, not empty, not 'admin')
const hardcodedRe = /(?:SECRET_KEY|_PASSWORD|_TOKEN|_SECRET)\s*[=:]\s*(?!['"\s]*\$\{)(?!['"\s]*(?:admin|true|false|"")?(?:\s|$))['"]?([a-zA-Z0-9_!@#$%]{10,})/g;
const hardcoded: string[] = [];
let hm: RegExpExecArray | null;
while ((hm = hardcodedRe.exec(compose)) !== null) {
  hardcoded.push(hm[0].trim().substring(0, 80));
}
hardcoded.length === 0
  ? ok("No hardcoded credentials detected")
  : warn(`${hardcoded.length} potential hardcoded secret(s):\n     ${hardcoded.join("\n     ")}`);

// ─── 7. Env var reference inventory ──────────────────────────────────────────
const envVarRefs = [...compose.matchAll(/\$\{([A-Z_][A-Z0-9_]*)(?::-[^}]*)?\}/g)].map(m => m[1]);
const uniqueEnvVars = [...new Set(envVarRefs)].sort();
ok(`Env var references: ${uniqueEnvVars.length} unique — ${uniqueEnvVars.join(", ")}`);

// ─── 8. Duplicate container_name check ───────────────────────────────────────
const containerNames = [...compose.matchAll(/container_name:\s*(\S+)/g)].map(m => m[1]);
const nameSet = new Set<string>();
const duplicates: string[] = [];
for (const name of containerNames) {
  if (nameSet.has(name)) duplicates.push(name);
  nameSet.add(name);
}
duplicates.length === 0
  ? ok(`All ${containerNames.length} container_name values are unique`)
  : fail(`Duplicate container_names: ${duplicates.join(", ")}`);

// ─── 9. Privileged service audit ─────────────────────────────────────────────
const expectedPrivileged = new Set(["frigate", "home-assistant"]);
const privilegedSvcs = Object.entries(serviceBlocks)
  .filter(([, c]) => /privileged:\s*true/.test(c))
  .map(([s]) => s);
const unexpectedPrivileged = privilegedSvcs.filter(s => !expectedPrivileged.has(s));
if (unexpectedPrivileged.length > 0) {
  warn(`Unexpected privileged services: ${unexpectedPrivileged.join(", ")}`);
} else {
  ok(`Privileged services: [${privilegedSvcs.join(", ") || "none"}]${privilegedSvcs.length ? " (expected for frigate/home-assistant)" : ""}`);
}

// ─── 10. Health check coverage on dependency services ────────────────────────
const depServices = serviceNames.filter(s => subServicePatterns.some(p => p.test(s)));
const withHealth = depServices.filter(s => /healthcheck:/.test(serviceBlocks[s] || ""));
if (depServices.length > 0) {
  const coverage = Math.round(withHealth.length / depServices.length * 100);
  ok(`Healthcheck coverage on sub-services: ${withHealth.length}/${depServices.length} (${coverage}%) — ${withHealth.join(", ")}`);
  if (coverage < 100) {
    const missing = depServices.filter(s => !withHealth.includes(s));
    warn(`Sub-services without healthcheck: ${missing.join(", ")}`);
  }
}

// ─── 11. docker.sock mount audit ─────────────────────────────────────────────
const sockMounts = Object.entries(serviceBlocks)
  .filter(([, c]) => c.includes("/var/run/docker.sock"))
  .map(([s]) => s);
if (sockMounts.length > 0) {
  const roMounts = sockMounts.filter(s => /docker\.sock:.*:ro/.test(serviceBlocks[s]));
  const rwMounts = sockMounts.filter(s => !roMounts.includes(s));
  if (rwMounts.length > 0) {
    warn(`docker.sock mounted read-write on: ${rwMounts.join(", ")} — consider :ro where possible`);
  } else {
    ok(`All ${roMounts.length} docker.sock mounts are read-only`);
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("\n═══════════════════════════════════════════════════════════");
if (issues.length === 0) {
  console.log(`  🎉 PASS — No structural issues. ${warnings.length} warning(s).`);
} else {
  console.log(`  💥 FAIL — ${issues.length} issue(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log("═══════════════════════════════════════════════════════════\n");
