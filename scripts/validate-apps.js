/**
 * Validates that all app templates in apps/ have the required structure.
 */

import { readdirSync, readFileSync, statSync, writeFileSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { tmpdir } from "os";

const APPS_DIR = new URL("../apps", import.meta.url).pathname;
const REQUIRED_FILES = ["compose.yaml", "meta.yaml"];

function parseMetaEnvVars(content) {
  const vars = [];
  const lines = content.split("\n");
  let inEnvVars = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "required_env_vars:") {
      inEnvVars = true;
    } else if (inEnvVars && trimmed.startsWith("- name:")) {
      vars.push(trimmed.slice(7).trim().replace(/["']/g, ""));
    } else if (!trimmed.startsWith("-") && trimmed !== "" && inEnvVars) {
      inEnvVars = false;
    }
  }
  return vars;
}

function validate() {
  const entries = readdirSync(APPS_DIR).filter((name) => {
    const path = join(APPS_DIR, name);
    return statSync(path).isDirectory() && !name.startsWith("_") && !name.startsWith(".");
  });

  let errors = 0;

  for (const appId of entries) {
    const appDir = join(APPS_DIR, appId);
    console.log(`Checking ${appId}...`);

    for (const file of REQUIRED_FILES) {
      const filePath = join(appDir, file);
      try {
        readFileSync(filePath, "utf-8");
      } catch {
        console.error(`  ❌ Missing ${file}`);
        errors++;
      }
    }

    // Basic YAML check for meta.yaml
    const metaPath = join(appDir, "meta.yaml");
    let metaContent = "";
    try {
      metaContent = readFileSync(metaPath, "utf-8");
      const requiredMetaFields = ["name:", "description:", "category:", "icon:"];
      for (const field of requiredMetaFields) {
        if (!metaContent.includes(field)) {
          console.error(`  ❌ meta.yaml missing field: ${field}`);
          errors++;
        }
      }
    } catch {
      // already counted above
    }

    // Check compose.yaml
    const composePath = join(appDir, "compose.yaml");
    let composeContent = "";
    try {
      composeContent = readFileSync(composePath, "utf-8");
      // Apps that legitimately should NOT have tsdproxy labels:
      // - Tailscale networking infra (exit-node, subnet-router, app-connector)
      // - Utility containers with no web UI (watchtower, recyclarr, configarr)
      // - Game servers using raw TCP/UDP (minecraft, hytale)
      const noTsdproxyApps = new Set([
        "tailscale-exit-node", "tailscale-subnet-router-node", "tailscale-app-connector-node",
        "watchtower", "recyclarr", "configarr",
        "minecraft", "hytale",
      ]);
      if (!noTsdproxyApps.has(appId)) {
        if (!composeContent.includes("tsdproxy.enable")) {
          console.error(`  ❌ compose.yaml missing tsdproxy.enable label`);
          errors++;
        }
        if (!composeContent.includes("tsdproxy.name")) {
          console.error(`  ❌ compose.yaml missing tsdproxy.name label`);
          errors++;
        }
      }

      // Ensure no Tailscale sidecar (we use TSDProxy instead)
      // Exception: tailscale-exit-node, tailscale-subnet-router-node, tailscale-app-connector-node
      // legitimately use the tailscale image as infrastructure
      const tailscaleInfraApps = new Set([
        "tailscale-exit-node", "tailscale-subnet-router-node", "tailscale-app-connector-node",
      ]);
      if (!tailscaleInfraApps.has(appId)) {
        if (composeContent.includes("tailscale/tailscale")) {
          console.error(`  ❌ compose.yaml contains Tailscale sidecar image (use TSDProxy labels instead)`);
          errors++;
        }
        if (composeContent.includes("network_mode: service:tailscale")) {
          console.error(`  ❌ compose.yaml contains Tailscale sidecar network mode (use TSDProxy labels instead)`);
          errors++;
        }
      }
    } catch {
      // already counted above
    }

    // Cross-check: meta.yaml env vars should appear as ${VAR} or ${VAR:-default} in compose.yaml
    if (metaContent && composeContent) {
      const metaVars = parseMetaEnvVars(metaContent);
      for (const varName of metaVars) {
        const placeholder = "${" + varName;
        if (!composeContent.includes(placeholder)) {
          console.error(`  ⚠️  meta.yaml env var ${varName} not found in compose.yaml as ${placeholder}`);
          // This is a warning, not an error, since some vars might be used indirectly
        }
      }
    }
  }

  // Bash extraction validation
  console.log("\nValidating bash extraction logic...");
  const tmpDir = mkdtempSync(join(tmpdir(), "tsdeck-validate-"));
  const extractScript = join(tmpDir, "extract.sh");
  writeFileSync(extractScript, `#!/usr/bin/env bash
set -euo pipefail
extract_services() {
  local file="\$1"
  local in_services=0
  while IFS= read -r line || [[ -n "\$line" ]]; do
    if [[ "\$line" =~ ^services:[[:space:]]*$ ]]; then
      in_services=1
      continue
    fi
    if [[ \$in_services -eq 1 ]]; then
      local trimmed="\${line#"\${line%%[![:space:]]*}"}"
      if [[ -n "\$trimmed" && ! "\$trimmed" =~ ^# && ! "\$line" =~ ^[[:space:]] ]]; then
        break
      fi
      echo "\$line"
    fi
  done < "\$file"
}
extract_volumes() {
  local file="\$1"
  local in_volumes=0
  while IFS= read -r line || [[ -n "\$line" ]]; do
    if [[ "\$line" =~ ^volumes:[[:space:]]*$ ]]; then
      in_volumes=1
      continue
    fi
    if [[ \$in_volumes -eq 1 ]]; then
      local trimmed="\${line#"\${line%%[![:space:]]*}"}"
      if [[ -n "\$trimmed" && ! "\$trimmed" =~ ^# && ! "\$line" =~ ^[[:space:]] ]]; then
        break
      fi
      echo "\$line"
    fi
  done < "\$file"
}
"\$@"
`, "utf-8");

  for (const appId of entries) {
    const composePath = join(APPS_DIR, appId, "compose.yaml");
    try {
      const services = execSync(`bash "${extractScript}" extract_services "${composePath}"`, { encoding: "utf-8" });
      if (!services.trim()) {
        console.error(`  ❌ ${appId}: extract_services produced empty output`);
        errors++;
        continue;
      }

      // Ensure top-level keys after services: are not included
      const topLevelKeys = services.split("\n").filter((l) => {
        const trimmed = l.trim();
        return trimmed && !trimmed.startsWith("#") && !l.startsWith(" ");
      });
      if (topLevelKeys.length > 0) {
        console.error(`  ❌ ${appId}: extract_services included top-level keys: ${topLevelKeys.join(", ")}`);
        errors++;
      }

      // Ensure extract_volumes works and doesn't overlap incorrectly
      const volumes = execSync(`bash "${extractScript}" extract_volumes "${composePath}"`, { encoding: "utf-8" });
      const composeText = readFileSync(composePath, "utf-8");
      const hasTopLevelVolumes = composeText.match(/^volumes:/m);
      if (hasTopLevelVolumes && !volumes.trim()) {
        console.error(`  ❌ ${appId}: extract_volumes produced empty output but compose has top-level volumes`);
        errors++;
      }
    } catch (e) {
      console.error(`  ❌ ${appId}: bash extraction failed: ${e.message}`);
      errors++;
    }
  }

  rmSync(tmpDir, { recursive: true, force: true });

  console.log();
  if (errors === 0) {
    console.log("✅ All app templates are valid.");
    process.exit(0);
  } else {
    console.error(`❌ ${errors} error(s) found.`);
    process.exit(1);
  }
}

validate();
