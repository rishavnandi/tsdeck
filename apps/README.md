# FastLab App Templates

Each app lives in its own directory with:

- `compose.yaml` — Docker Compose service fragment
- `meta.yaml` — App metadata and required environment variables

## Schema

### `compose.yaml`

- Must be a valid Compose file with a `services:` block
- Must include `tsdproxy.enable: "true"` and `tsdproxy.name: "<app-id>"` labels on the main service
- Must use `$VAR` syntax for environment variable placeholders
- Must use named volumes or bind mounts for data persistence
- Must **not** include a Tailscale sidecar (TSDProxy handles exposure)
- Should include `restart: always`

### `meta.yaml`

```yaml
name: Human-readable Name
description: Short description
category: media | media-management | downloads | security | management | ...
icon: https://.../icon.png
required_env_vars:
  - name: VAR_NAME
    description: What this variable controls
    default: default-value
```

## Contributing

1. Create `apps/<app-id>/compose.yaml` and `apps/<app-id>/meta.yaml`
2. Add the app to `apps/manifest.json`
3. Open a pull request
