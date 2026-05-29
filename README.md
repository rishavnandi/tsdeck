# TSDeck

**Ninite for Homelabbers**

Pick your self-hosted apps from a catalog, get a one-line `curl` command, and run it on your server. Docker is installed if missing, your apps are exposed on your Tailscale network with automatic HTTPS via TSDProxy, and your data persists across re-runs.

## How it works

1. **Browse** the app catalog at [tsdeck-api.rishavnandi.workers.dev](https://tsdeck-api.rishavnandi.workers.dev)
2. **Select** the apps you want
3. **Copy** the generated `curl` command
4. **Run** it on your Linux server
5. **Access** your apps at `https://app-name.your-tailnet.ts.net`

The webapp never stores your credentials or connects to your servers. All secrets are prompted at runtime on your own hardware.

## Architecture

```
User browser:
  ┌─────────────┐     POST /generate      ┌──────────────┐
  │   Frontend  │ ──────────────────────► │  Hono Worker │
  │(Cloudflare  │                         │(Cloudflare    │
  │   Pages)    │ ◄──── slug + url ────── │   Workers)    │
  └─────────────┘                         └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ Cloudflare KV│
                                          │  (15-min TTL)│
                                          └──────────────┘

User server:
  curl -fsSL https://tsdeck-api.rishavnandi.workers.dev/s/abc123 | bash
       │
       ▼
  ┌──────────────┐
  │ Bootstrap    │──► Install Docker (if missing)
  │ Script       │──► Prompt for Tailscale Auth Key
  │              │──► Prompt for app env vars
  │              │──► Fetch compose templates from GitHub
  │              │──► Assemble docker-compose.yml
  │              │──► Start containers (incl. TSDProxy)
  └──────────────┘
```

## Project Structure

```
tsdeck/
├── apps/                    # App templates (compose.yaml + meta.yaml)
│   ├── jellyfin/
│   ├── immich/
│   ├── sonarr/
│   ├── radarr/
│   ├── prowlarr/
│   ├── bazarr/
│   ├── qbittorrent/
│   ├── vaultwarden/
│   ├── portainer/
│   └── jellyseerr/
├── frontend/               # Static HTML/JS site (Cloudflare Pages)
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── api/                    # Hono API (Cloudflare Workers)
│   ├── src/
│   │   ├── index.ts        # API routes
│   │   ├── generator.ts    # Bash script generator
│   │   └── apps.ts         # App metadata
│   ├── test/
│   ├── wrangler.toml
│   └── package.json
├── scripts/
│   └── validate-apps.js    # CI check for app templates
└── package.json
```

## Development

### Prerequisites

- [Bun](https://bun.sh)

### Setup

```bash
# Install dependencies
cd api && bun install

# Run API locally
bun run dev

# Run tests
bun test

# Validate app templates
bun run validate-apps
```

### Deploy

TSDeck uses Cloudflare Workers **Static Assets** — the frontend and API are deployed together as a single Worker.

```bash
cd api && bunx wrangler deploy
```

Deployed at `https://tsdeck-api.rishavnandi.workers.dev`

- `https://tsdeck-api.rishavnandi.workers.dev/` — Frontend (catalog UI)
- `https://tsdeck-api.rishavnandi.workers.dev/apps` — API (app catalog JSON)
- `https://tsdeck-api.rishavnandi.workers.dev/generate` — API (generate slug)
- `https://tsdeck-api.rishavnandi.workers.dev/s/:slug` — API (serve bootstrap script)

## Contributing Apps

1. Create `apps/<app-id>/compose.yaml` and `apps/<app-id>/meta.yaml`
2. Follow the schema in `apps/README.md`
3. Add the app to `apps/manifest.json` and `api/src/apps.ts`
4. Run `bun run validate-apps`
5. Open a pull request

## Security

- **Zero server-side secrets**: The webapp never collects Tailscale auth keys, passwords, or server credentials.
- **Ephemeral slugs**: Setup commands expire after 15 minutes.
- **Inspectable scripts**: Every generated script is plain bash. Read it before piping to `bash`.
- **Dry-run mode**: Set `DRY_RUN=1` before running the script to preview changes.

## License

WTFPL