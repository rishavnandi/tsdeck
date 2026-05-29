import { describe, it, expect } from "vitest";
import { generateScript, collectUniqueEnvVars } from "../src/generator";
import { APPS } from "../src/apps";

describe("generateScript", () => {
  it("produces a bash script for a single app", () => {
    const jellyfin = APPS.find((a: { id: string }) => a.id === "jellyfin")!;
    const script = generateScript([jellyfin]);

    expect(script).toContain("#!/usr/bin/env bash");
    expect(script).toContain("jellyfin");
    expect(script).toContain("TS_AUTHKEY");
    expect(script).toContain("docker compose up -d --remove-orphans");
    expect(script).toContain("tsdproxy");
  });

  it("produces a bash script for multiple apps", () => {
    const apps = APPS.filter((a: { id: string }) => ["sonarr", "radarr", "prowlarr"].includes(a.id));
    const script = generateScript(apps);

    expect(script).toContain("sonarr");
    expect(script).toContain("radarr");
    expect(script).toContain("prowlarr");
    expect(script).toContain("fetch_template");
  });

  it("includes env var prompts for apps that require them", () => {
    const vaultwarden = APPS.find((a: { id: string }) => a.id === "vaultwarden")!;
    const script = generateScript([vaultwarden]);

    expect(script).toContain("VAULTWARDEN_SIGNUPS_ALLOWED");
    expect(script).toContain("VAULTWARDEN_ADMIN_TOKEN");
    expect(script).toContain("prompt_required");
  });

  it("marks password-like fields as secret prompts", () => {
    const vaultwarden = APPS.find((a: { id: string }) => a.id === "vaultwarden")!;
    const script = generateScript([vaultwarden]);

    // VAULTWARDEN_ADMIN_TOKEN should be prompted with hidden input
    expect(script).toContain('prompt_required "VAULTWARDEN_ADMIN_TOKEN"');
    const passwordLine = script.split("\n").find((l: string) => l.includes("VAULTWARDEN_ADMIN_TOKEN"));
    expect(passwordLine).toContain('"1"');
  });

  it("includes dry-run guard calls", () => {
    const script = generateScript([APPS[0]]);
    expect(script).toContain("DRY_RUN");
  });

  it("deduplicates env vars across apps", () => {
    const mockApps = [
      {
        id: "app-a",
        meta: {
          name: "App A",
          description: "",
          category: "test",
          icon: "",
          required_env_vars: [
            { name: "SHARED_VAR", description: "Shared", default: "" },
            { name: "UNIQUE_A", description: "Unique A", default: "" },
          ],
        },
      },
      {
        id: "app-b",
        meta: {
          name: "App B",
          description: "",
          category: "test",
          icon: "",
          required_env_vars: [
            { name: "SHARED_VAR", description: "Shared", default: "" },
            { name: "UNIQUE_B", description: "Unique B", default: "" },
          ],
        },
      },
    ];

    const vars = collectUniqueEnvVars(mockApps as any);
    const names = vars.map((v) => v.var.name);
    expect(names).toEqual(["SHARED_VAR", "UNIQUE_A", "UNIQUE_B"]);
  });

  it("includes service extraction helpers for multi-service apps like immich", () => {
    const immich = APPS.find((a: { id: string }) => a.id === "immich")!;
    const script = generateScript([immich]);
    expect(script).toContain("extract_services");
    expect(script).toContain("extract_volumes");
  });
});
