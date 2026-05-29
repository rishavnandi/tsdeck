import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const SCALETAIL_DIR = new URL("../scaletail/services", import.meta.url).pathname;
const APPS_DIR = new URL("../apps", import.meta.url).pathname;

const appsToImport = [
  "adguardhome",
  "pihole",
  "homepage",
  "dozzle",
  "plex",
  "audiobookshelf",
  "navidrome",
  "tautulli",
  "kavita",
  "metube",
  "recyclarr",
  "seerr",
  "home-assistant",
  "nodered",
  "memos",
  "excalidraw",
  "docmost",
  "booklore",
  "ghost",
  "mealie",
  "gitea",
  "forgejo",
  "it-tools",
  "cyberchef",
  "stirlingpdf",
  "uptime-kuma",
  "speedtest-tracker",
  "paperless",
  "vikunja",
  "pingvin-share",
  "frigate",
  "flaresolverr",
  "changedetection",
  "homebox",
  "ntfy",
  "ollama",
  "open-webui",
  "linkding",
  "coder",
  "actual-budget"
];

function sanitizeCompose(composeObj, appId) {
  if (!composeObj.services) return composeObj;

  // 1. Find and delete tailscale/traefik sidecar services entirely
  const servicesToDelete = [];
  for (const [serviceName, service] of Object.entries(composeObj.services)) {
    if (serviceName.includes("tailscale") || serviceName.includes("traefik") || serviceName.includes("proxy") && !serviceName.includes("haproxy")) {
      servicesToDelete.push(serviceName);
    } else if (service.image && (service.image.includes("tailscale") || service.image.includes("traefik"))) {
      servicesToDelete.push(serviceName);
    }
  }

  for (const s of servicesToDelete) {
    delete composeObj.services[s];
  }

  for (const [serviceName, service] of Object.entries(composeObj.services)) {
    // Standardize container_name
    if (!service.container_name) {
      service.container_name = serviceName;
    }

    // Process labels
    const labels = {};
    let isMainApp = false;
    
    if (!serviceName.includes("db") && !serviceName.includes("redis") && !serviceName.includes("mariadb") && !serviceName.includes("postgres") && !serviceName.includes("mysql") && !serviceName.includes("elasticsearch") && !serviceName.includes("opensearch")) {
      isMainApp = true;
    }

    if (service.labels) {
      const oldLabels = Array.isArray(service.labels) 
        ? service.labels 
        : Object.entries(service.labels).map(([k, v]) => `${k}=${v}`);
      
      for (const label of oldLabels) {
        let key, value;
        if (typeof label === "string" && label.includes("=")) {
          const split = label.split("=");
          key = split[0];
          value = split.slice(1).join("=");
        } else {
          continue;
        }

        // Remove traefik and tailscale labels
        if (!key.startsWith("traefik.") && !key.startsWith("tailscale.")) {
          labels[key] = value;
        }
      }
    }

    if (isMainApp) {
      labels["tsdproxy.enable"] = "true";
      labels["tsdproxy.name"] = appId;
    }

    if (Object.keys(labels).length > 0) {
      service.labels = labels;
    } else {
      delete service.labels;
    }

    // Clean up networks and network_mode
    delete service.networks;
    if (service.network_mode && (service.network_mode.includes("tailscale") || service.network_mode.includes("traefik") || service.network_mode.includes("service:"))) {
      delete service.network_mode;
    }
  }
  
  delete composeObj.networks;

  return composeObj;
}

function generateMeta(appId, composeObj) {
  const meta = {
    name: appId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: `Self-hosted ${appId}`,
    category: "other",
    icon: `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${appId}.png`,
    required_env_vars: []
  };

  // Basic env var detection from compose
  if (composeObj.services) {
    for (const service of Object.values(composeObj.services)) {
      if (service.environment) {
        let envs = Array.isArray(service.environment) ? service.environment : Object.keys(service.environment);
        for (const e of envs) {
          let envName = typeof e === "string" ? e.split("=")[0] : e;
          if (envName === "TZ" && !meta.required_env_vars.find(v => v.name === "TZ")) {
            meta.required_env_vars.push({ name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" });
          }
        }
      }
    }
  }

  return meta;
}

for (const appId of appsToImport) {
  const sourcePath = join(SCALETAIL_DIR, appId, "compose.yaml");
  const fallbackSourcePath = join(SCALETAIL_DIR, appId, "docker-compose.yml");
  const composeYmlPath = join(SCALETAIL_DIR, appId, "compose.yml");
  
  let targetSource = existsSync(sourcePath) ? sourcePath : 
                     (existsSync(fallbackSourcePath) ? fallbackSourcePath : 
                     (existsSync(composeYmlPath) ? composeYmlPath : null));

  if (!targetSource) {
    console.warn(`Skipping ${appId} - no compose file found in scaletail.`);
    continue;
  }

  const destDir = join(APPS_DIR, appId);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  try {
    const content = readFileSync(targetSource, "utf-8");
    const parsed = yaml.load(content);
    
    const sanitized = sanitizeCompose(parsed, appId);
    const composeYaml = yaml.dump(sanitized, { lineWidth: -1, noRefs: true });
    writeFileSync(join(destDir, "compose.yaml"), composeYaml);

    // Only write meta.yaml if it doesn't exist to prevent overwriting manual curations
    if (!existsSync(join(destDir, "meta.yaml"))) {
      const meta = generateMeta(appId, sanitized);
      const metaYaml = yaml.dump(meta, { lineWidth: -1 });
      writeFileSync(join(destDir, "meta.yaml"), metaYaml);
    }

    console.log(`✅ Imported ${appId}`);
  } catch (err) {
    console.error(`❌ Failed to import ${appId}:`, err.message);
  }
}
