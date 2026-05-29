// Build script: reads apps/*/meta.yaml and generates api/src/apps.ts and apps/manifest.json
// Run after editing any app template metadata: bun scripts/build-registry.js

import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const APPS_DIR = new URL("../apps", import.meta.url).pathname;
const API_SRC = new URL("../api/src/apps.ts", import.meta.url).pathname;
const MANIFEST = new URL("../apps/manifest.json", import.meta.url).pathname;

function stripQuotes(val) {
  val = val.trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

function parseMeta(content, id) {
  const lines = content.split("\n");
  const meta = { id, required_env_vars: [], depends_on: [], warnings: [] };
  let currentEnv = null;
  let inEnvVars = false;
  let inDependsOn = false;
  let inWarnings = false;

  function exitSections() {
    if (currentEnv) {
      meta.required_env_vars.push(currentEnv);
      currentEnv = null;
    }
    inEnvVars = false;
    inDependsOn = false;
    inWarnings = false;
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed === "required_env_vars:") {
      exitSections();
      inEnvVars = true;
    } else if (trimmed === "depends_on:") {
      exitSections();
      inDependsOn = true;
    } else if (trimmed === "warnings:") {
      exitSections();
      inWarnings = true;
    } else if (!inEnvVars && !inDependsOn && !inWarnings && trimmed.startsWith("name:")) {
      meta.name = stripQuotes(trimmed.slice(5).trim());
    } else if (!inEnvVars && !inDependsOn && !inWarnings && trimmed.startsWith("description:")) {
      meta.description = stripQuotes(trimmed.slice(12).trim());
    } else if (!inEnvVars && !inDependsOn && !inWarnings && trimmed.startsWith("category:")) {
      meta.category = stripQuotes(trimmed.slice(9).trim());
    } else if (!inEnvVars && !inDependsOn && !inWarnings && trimmed.startsWith("icon:")) {
      meta.icon = stripQuotes(trimmed.slice(5).trim());
    } else if (inEnvVars && trimmed.startsWith("- name:")) {
      if (currentEnv) meta.required_env_vars.push(currentEnv);
      currentEnv = { name: stripQuotes(trimmed.slice(7).trim()) };
    } else if (inEnvVars && trimmed.startsWith("description:")) {
      if (currentEnv) currentEnv.description = stripQuotes(trimmed.slice(12).trim());
    } else if (inEnvVars && trimmed.startsWith("default:")) {
      if (currentEnv) currentEnv.default = stripQuotes(trimmed.slice(8).trim());
    } else if (inDependsOn && trimmed.startsWith("- ")) {
      meta.depends_on.push(stripQuotes(trimmed.slice(2).trim()));
    } else if (inWarnings && trimmed.startsWith("- ")) {
      meta.warnings.push(stripQuotes(trimmed.slice(2).trim()));
    } else if (trimmed === "" && currentEnv) {
      meta.required_env_vars.push(currentEnv);
      currentEnv = null;
    } else if (trimmed !== "" && !trimmed.startsWith("-") && !trimmed.startsWith("name:") && !trimmed.startsWith("description:") && !trimmed.startsWith("default:") && !trimmed.startsWith("category:") && !trimmed.startsWith("icon:")) {
      // Unknown field at root level — exit all list sections
      exitSections();
    }
  }
  if (currentEnv) meta.required_env_vars.push(currentEnv);

  // Remove empty arrays to keep output clean
  if (meta.depends_on.length === 0) delete meta.depends_on;
  if (meta.warnings.length === 0) delete meta.warnings;

  return meta;
}

function generateAppsTs(metas) {
  const entries = metas.map((m) => {
    const envVars = m.required_env_vars.map((v) =>
      `        { name: "${v.name}", description: "${v.description}", default: "${v.default}" }`
    ).join(",\n");

    const dependsOn = m.depends_on
      ? `      depends_on: [${m.depends_on.map((d) => `"${d}"`).join(", ")}],\n`
      : "";
    const warnings = m.warnings
      ? `      warnings: [${m.warnings.map((w) => `"${w}"`).join(", ")}],\n`
      : "";

    return `  {
    id: "${m.id}",
    meta: {
      name: "${m.name}",
      description: "${m.description}",
      category: "${m.category}",
      icon: "${m.icon}",
${dependsOn}${warnings}      required_env_vars: [
${envVars}
      ],
    },
  },`;
  }).join("\n");

  return `import type { AppMeta } from "./generator";

export const APPS: { id: string; meta: AppMeta }[] = [
${entries}
];
`;
}

function generateManifest(metas) {
  const manifest = metas.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    category: m.category,
    icon: m.icon,
  }));
  return JSON.stringify(manifest, null, 2) + "\n";
}

function main() {
  const entries = readdirSync(APPS_DIR)
    .filter((name) => {
      const path = join(APPS_DIR, name);
      return statSync(path).isDirectory() && !name.startsWith("_") && !name.startsWith(".");
    })
    .sort();

  const metas = [];
  for (const id of entries) {
    const metaPath = join(APPS_DIR, id, "meta.yaml");
    try {
      const content = readFileSync(metaPath, "utf-8");
      metas.push(parseMeta(content, id));
    } catch (err) {
      console.error(`Failed to parse ${metaPath}:`, err);
      process.exit(1);
    }
  }

  writeFileSync(API_SRC, generateAppsTs(metas));
  writeFileSync(MANIFEST, generateManifest(metas));

  console.log(`✅ Generated ${API_SRC} with ${metas.length} apps`);
  console.log(`✅ Generated ${MANIFEST} with ${metas.length} apps`);
}

main();
