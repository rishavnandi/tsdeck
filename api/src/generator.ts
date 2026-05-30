export interface EnvVar {
  name: string;
  description: string;
  default: string;
}

export interface AppMeta {
  name: string;
  description: string;
  category: string;
  icon: string;
  required_env_vars: EnvVar[];
  depends_on?: string[];
  warnings?: string[];
}

export interface App {
  id: string;
  meta: AppMeta;
}

const BOOTSTRAP_TEMPLATE = `#!/usr/bin/env bash
set -euo pipefail

# TSDeck Bootstrap Script
# Generated for apps: __APP_LIST__

TSDECK_DIR="\${TSDECK_DIR:-/opt/tsdeck}"
REPO_URL="\${TSDECK_REPO:-https://raw.githubusercontent.com/rishavnandi/tsdeck/main}"
DRY_RUN="\${DRY_RUN:-0}"

# Colors
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

log_info() { echo -e "\${BLUE}[INFO]\${NC} \$1"; }
log_success() { echo -e "\${GREEN}[OK]\${NC} \$1"; }
log_warn() { echo -e "\${YELLOW}[WARN]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }

run_if_not_dry() {
  if [[ "\$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would execute: \$*"
  else
    "\$@"
  fi
}

# --- Docker Installation ---
install_docker() {
  log_info "Docker not found. Installing..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would execute: curl -fsSL https://get.docker.com | sh"
    return
  fi
  curl -fsSL https://get.docker.com | sh

  # Ensure Docker service is running (handles both systemd and sysvinit)
  if command -v systemctl &> /dev/null; then
    systemctl enable --now docker.service 2>/dev/null || true
  elif command -v service &> /dev/null; then
    service docker start 2>/dev/null || true
  fi

  # Add current user to docker group so docker commands work without sudo
  if getent group docker &> /dev/null; then
    usermod -aG docker "$(whoami)" 2>/dev/null || true
  fi

  log_success "Docker installed."
}

check_docker() {
  if ! command -v docker &> /dev/null; then
    install_docker
  fi

  # Try docker info; if it fails because of permissions or daemon not ready, retry a few times.
  local attempts=0
  local max_attempts=10
  while ! docker info &> /dev/null; do
    attempts=$((attempts + 1))
    if [[ $attempts -ge $max_attempts ]]; then
      log_error "Docker daemon is not running or current user lacks Docker permissions."
      log_info "If Docker was just installed, you may need to log out and back in (or run 'newgrp docker') for group changes to take effect."
      exit 1
    fi
    log_info "Waiting for Docker daemon to be ready... ($attempts/$max_attempts)"
    sleep 2
  done

  log_success "Docker is ready."
}

# --- Environment Variable Prompting ---
prompt_required() {
  local var_name="\$1"
  local description="\$2"
  local default_val="\$3"
  local is_secret="\${4:-0}"
  local current_val="\${!var_name:-}"

  if [[ -n "\$current_val" ]]; then
    log_info "\$var_name is already set."
    return
  fi

  echo
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  \$description"
  echo "  Variable: \$var_name"
  if [[ -n "\$default_val" ]]; then
    echo "  Default: \$default_val"
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if [[ "\$is_secret" == "1" ]]; then
    read -rsp "Enter value (hidden): " input_val < /dev/tty
    echo
  else
    read -rp "Enter value: " input_val < /dev/tty
  fi

  if [[ -z "\$input_val" && -n "\$default_val" ]]; then
    input_val="\$default_val"
    log_info "Using default: \$default_val"
  fi

  export "\$var_name=\$input_val"
}

# --- Generated Questionnaire ---
__QUESTIONNAIRE__

# --- Compose Assembly ---
fetch_template() {
  local app="\$1"
  local url="\$REPO_URL/apps/\$app/compose.yaml"
  log_info "Fetching template for \$app..."
  curl -fsSL "\$url"
}

extract_services() {
  local file="\$1"
  local in_services=0
  while IFS= read -r line || [[ -n "\$line" ]]; do
    if [[ "\$line" =~ ^services:[[:space:]]*$ ]]; then
      in_services=1
      continue
    fi
    if [[ \$in_services -eq 1 ]]; then
      # Break only on non-empty, non-comment lines that are not indented
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

assemble_compose() {
  local apps=(__APP_ARRAY__)
  local compose_file="\$TSDECK_DIR/docker-compose.yml"
  local env_file="\$TSDECK_DIR/.env"

  if [[ "\$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would create TSDeck directory at \$TSDECK_DIR"
    log_info "[DRY-RUN] Would write environment file to \$env_file"
    log_info "[DRY-RUN] Would assemble docker-compose.yml at \$compose_file"
    return
  fi

  local tmpdir
  tmpdir="\$(mktemp -d)"
  trap "rm -rf \$tmpdir" EXIT

  log_info "Creating TSDeck directory at $TSDECK_DIR..."
  if ! mkdir -p "$TSDECK_DIR" 2>/dev/null; then
    log_warn "Permission denied for $TSDECK_DIR. Trying with sudo..."
    sudo mkdir -p "$TSDECK_DIR" || {
      log_error "Failed to create $TSDECK_DIR even with sudo."
      log_info "Try running the script with sudo, or set TSDECK_DIR to a writable path:"
      log_info "  export TSDECK_DIR=~/tsdeck && curl -fsSL ... | bash"
      exit 1
    }
    sudo chown "$(whoami):$(whoami)" "$TSDECK_DIR" 2>/dev/null || sudo chown "$(whoami):$(id -gn)" "$TSDECK_DIR" 2>/dev/null || true
  fi

  log_info "Writing environment file..."
  {
    echo "# TSDeck Environment"
    echo "TS_AUTHKEY=\$TS_AUTHKEY"
    __ENV_WRITES__
  } > "\$env_file"
  log_success ".env written."

  log_info "Assembling docker-compose.yml..."
  {
    echo "services:"
    echo "  tsdproxy:"
    echo "    image: almeidapaulopt/tsdproxy:latest"
    echo "    container_name: tsdproxy"
    echo "    ports:"
    echo "      - \"8080:8080\""
    echo "    environment:"
    echo "      - TSDPROXY_AUTHKEY=\$TS_AUTHKEY"
    echo "    extra_hosts:"
    echo "      - \"host.docker.internal:host-gateway\""
    echo "    volumes:"
    echo "      - /var/run/docker.sock:/var/run/docker.sock"
    echo "      - tsdproxy-data:/data"
    echo "      - ./config:/config"
    echo "    restart: always"
    echo ""

    for app in "\${apps[@]}"; do
      local template_file="\$tmpdir/\$app-compose.yaml"
      fetch_template "\$app" > "\$template_file"
      extract_services "\$template_file"
      echo ""
    done

    echo "volumes:"
    echo "  tsdproxy-data:"
    for app in "\${apps[@]}"; do
      local template_file="\$tmpdir/\$app-compose.yaml"
      extract_volumes "\$template_file"
    done
  } > "\$compose_file"
  log_success "docker-compose.yml written."
}

start_containers() {
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would start containers: docker compose up -d --remove-orphans --force-recreate"
    return
  fi
  log_info "Starting containers (forcing recreate to pick up label changes)..."
  if ! (cd "$TSDECK_DIR" && docker compose up -d --remove-orphans --force-recreate); then
    log_warn "docker compose failed. Trying with sudo..."
    (cd "$TSDECK_DIR" && sudo docker compose up -d --remove-orphans --force-recreate) || {
      log_error "Failed to start containers even with sudo."
      exit 1
    }
  fi
  log_success "Containers started."
}

main() {
  echo "========================================"
  echo "  TSDeck Bootstrap"
  echo "========================================"
  echo

  if [[ "\$DRY_RUN" == "1" ]]; then
    log_warn "DRY-RUN mode enabled. No changes will be made."
    echo
  fi

  check_docker

  prompt_required "TS_AUTHKEY" "Tailscale Auth Key (from https://login.tailscale.com/admin/settings/keys)" "" "1"

  run_questionnaire

  assemble_compose
  start_containers

  echo
  echo "========================================"
  echo "  TSDeck Setup Complete"
  echo "========================================"
  echo "Your apps will be available shortly at:"
  for app in __APP_ARRAY__; do
    echo "  https://\$app.<your-tailnet>.ts.net"
  done
  echo
  echo "Re-run this script to update your stack."
}

main "\$@"
`;

function generateQuestionnaire(apps: App[]): string {
  const uniqueVars = collectUniqueEnvVars(apps);
  const lines: string[] = [];
  lines.push("run_questionnaire() {");

  if (uniqueVars.length > 0) {
    lines.push(`  echo`);
    lines.push(`  echo "--- App Configuration ---"`);
    for (const { appName, var: envVar } of uniqueVars) {
      const isSecret = envVar.name.toLowerCase().includes("password") ||
                       envVar.name.toLowerCase().includes("token") ||
                       envVar.name.toLowerCase().includes("key") ||
                       envVar.name.toLowerCase().includes("secret");
      lines.push(`  prompt_required "${envVar.name}" "${envVar.description}" "${envVar.default}" "${isSecret ? "1" : "0"}"`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

function generateEnvWrites(apps: App[]): string {
  const uniqueVars = collectUniqueEnvVars(apps);
  const lines: string[] = [];
  for (const { var: envVar } of uniqueVars) {
    lines.push(`    echo "${envVar.name}=\$${envVar.name}"`);
  }
  return lines.join("\n");
}

export function collectUniqueEnvVars(apps: App[]): Array<{ appName: string; var: EnvVar }> {
  const seen = new Map<string, { appName: string; var: EnvVar }>();
  for (const app of apps) {
    for (const envVar of app.meta.required_env_vars) {
      if (!seen.has(envVar.name)) {
        seen.set(envVar.name, { appName: app.meta.name, var: envVar });
      }
    }
  }
  return Array.from(seen.values());
}

export function generateScript(apps: App[]): string {
  const appList = apps.map((a) => a.id).join(", ");
  const appArray = apps.map((a) => `"${a.id}"`).join(" ");
  const questionnaire = generateQuestionnaire(apps);
  const envWrites = generateEnvWrites(apps);

  return BOOTSTRAP_TEMPLATE
    .replace("__APP_LIST__", appList)
    .replaceAll("__APP_ARRAY__", appArray)
    .replace("__QUESTIONNAIRE__", questionnaire)
    .replace("__ENV_WRITES__", envWrites);
}
