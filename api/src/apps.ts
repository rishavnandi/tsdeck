import type { AppMeta } from "./generator";

export const APPS: { id: string; meta: AppMeta }[] = [
  {
    id: "actual-budget",
    meta: {
      name: "Actual Budget",
      description: "Actual Budget is a privacy-first, self-hosted personal finance manager and budgeting tool that uses a zero-based budgeting system. It offers multi-device synchronization, bank syncing capabilities, and secure local-first data storage.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/actual-budget.png",
      warnings: ["Requires configured HTTPS to enable secure web-based access and client-side encryption."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "adguardhome",
    meta: {
      name: "Adguardhome",
      description: "AdGuard Home is a network-wide software utility for blocking ads and tracking, acting as a DNS server that redirects tracking domains to a black hole. It provides comprehensive control over all devices on your local network without requiring client-side configuration.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/adguard-home.png",
      warnings: ["AdGuard Home acts as a DNS server; ensure port 53 is not in use by other services (like systemd-resolved) on the host.", "Improper configuration of DNS upstream servers can result in local network-wide loss of internet connectivity."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "adguardhome-sync",
    meta: {
      name: "AdGuard Home Sync",
      description: "AdGuard Home Sync is a lightweight synchronization tool that replicates configuration, filters, client settings, and query logs across multiple AdGuard Home instances.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/adguard-home-sync.png",
      depends_on: ["adguardhome"],
      warnings: ["Requires credentials and API endpoints for both the origin and replica AdGuard Home instances to synchronize settings."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "ADGUARDHOME_ORIGIN_URL", description: "The URL of the primary AdGuard Home instance (origin)", default: "http://adguardhome:80" },
        { name: "ADGUARDHOME_ORIGIN_USERNAME", description: "Username for the primary AdGuard Home instance", default: "admin" },
        { name: "ADGUARDHOME_ORIGIN_PASSWORD", description: "Password for the primary AdGuard Home instance", default: "change-me-please" },
        { name: "ADGUARDHOME_REPLICA_URL", description: "The URL of the destination AdGuard Home instance (replica)", default: "http://192.168.1.100:80" },
        { name: "ADGUARDHOME_REPLICA_USERNAME", description: "Username for the replica AdGuard Home instance", default: "admin" },
        { name: "ADGUARDHOME_REPLICA_PASSWORD", description: "Password for the replica AdGuard Home instance", default: "change-me-please" },
        { name: "ADGUARDHOME_SYNC_CRON", description: "Cron schedule expression for synchronization frequency", default: "*/5 * * * *" }
      ],
    },
  },
  {
    id: "affine",
    meta: {
      name: "Affine",
      description: "AFFiNE is a next-generation collaborative knowledge base and workspace that merges note-taking, document editing, and whiteboarding into a single, unified local-first tool.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/affine.png",
      warnings: ["Requires a PostgreSQL database and a Redis server, which are automatically deployed as part of this stack.", "Large-scale document indexing and heavy media assets might require moderate CPU and memory."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the containers", default: "Europe/Amsterdam" },
        { name: "AFFINE_SERVER_EXTERNAL_URL", description: "External URL of the AFFiNE server (e.g. https://affine.<tailnet-name>.ts.net)", default: "https://affine.tailnet.ts.net" }
      ],
    },
  },
  {
    id: "anchor",
    meta: {
      name: "Anchor",
      description: "Anchor is an offline-first note-taking application designed for speed, privacy, and seamless synchronization across web and mobile devices.",
      category: "bookmarks",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/anchor.png",
      warnings: ["Supports standard file storage; ensure note volumes are backed up to prevent data loss."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "arcane",
    meta: {
      name: "Arcane",
      description: "Arcane is an open-source, self-hosted Docker container and Compose stack manager featuring a modern web interface to control containers, images, volumes, and networks.",
      category: "remote-access",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/arcane.png",
      warnings: ["Requires access to the host's Docker socket (`/var/run/docker.sock`), granting it full administrative access to manage containers on the host."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "APP_URL", description: "External URL of the Arcane application (e.g. https://arcane.<tailnet-name>.ts.net)", default: "https://arcane.tailnet.ts.net" },
        { name: "ARCANE_ENCRYPTION_KEY", description: "Secret key for encrypting stored data (generate with openssl rand -hex 32)", default: "" },
        { name: "ARCANE_JWT_SECRET", description: "Secret key for signing JWT authentication tokens (generate with openssl rand -hex 32)", default: "" }
      ],
    },
  },
  {
    id: "audiobookshelf",
    meta: {
      name: "Audiobookshelf",
      description: "Audiobookshelf is a self-hosted media server designed specifically for audiobooks and podcasts. It features multi-user support, playback state syncing across devices, active author/narrator metadata scraping, and a built-in podcast host.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/audiobookshelf.png",
      warnings: ["Initial metadata scanning and indexing can be CPU-intensive depending on the size of your audiobook library."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "bazarr",
    meta: {
      name: "Bazarr",
      description: "Bazarr is a companion application to Sonarr and Radarr that automates the downloading and management of subtitles in multiple languages. It scans your media libraries, fetches matching subtitles from various providers, and saves them directly alongside your video files.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/bazarr.png",
      depends_on: ["sonarr", "radarr"],
      warnings: ["Bazarr requires access to the same physical media directories as Sonarr and Radarr to successfully match and write subtitle files.", "Ensure you configure appropriate API rate limits or delay rules to prevent being banned by third-party subtitle providers."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "bentopdf",
    meta: {
      name: "BentoPDF",
      description: "BentoPDF is an open-source, self-hosted web application for viewing, organizing, and managing your PDF documents in a clean and minimal interface.",
      category: "utilities",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/bentopdf.png",
      warnings: ["Keep your document volumes securely backed up to prevent accidental data loss."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "beszel",
    meta: {
      name: "Beszel",
      description: "Beszel is a lightweight, self-hosted server resource monitoring hub and agent that provides real-time CPU, memory, disk, network, and GPU utilization metrics with historical charts and alerts.",
      category: "monitoring",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/beszel.png",
      warnings: ["The Beszel Agent requires access to the host's Docker socket and proc system directory to monitor hardware metrics and container resource usage."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the containers", default: "Europe/Amsterdam" },
        { name: "BESZEL_AGENT_KEY", description: "The public SSH key generated in the Beszel Hub settings, used to secure the agent connection", default: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..." }
      ],
    },
  },
  {
    id: "blinko",
    meta: {
      name: "Blinko",
      description: "Blinko is an open-source, self-hosted personal note-taking tool designed for quick capture and organization. It allows you to rapidly log thoughts, links, and snippets with absolute privacy, complete with full markdown support and simple search capabilities.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/note-mark.png",
      warnings: ["Ensure that your Postgres database password is kept secure and not shared."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "bookbounty",
    meta: {
      name: "BookBounty",
      description: "BookBounty is a self-hosted e-book downloader, automatic searcher, and sync companion for Readarr. It allows you to automatically query and scrape books from diverse providers and feeds them straight to your library.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/calibre.png",
      depends_on: ["readarr"],
      warnings: ["Requires integration with a running Readarr instance and its API key for automatic collection scraping."],
      required_env_vars: [
        { name: "READARR_API_KEY", description: "API Key retrieved from your Readarr General Settings", default: "change-me-please" },
        { name: "DATA_DIR", description: "Parent directory where books are stored (matched with Readarr path)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "booklore",
    meta: {
      name: "Booklore",
      description: "Booklore is a self-hosted book collection tracker and reading progress manager. It allows you to organize your digital library, log reading sessions, and visualize your reading habits with detailed statistics and goals.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/calibre.png",
      warnings: ["Contains an embedded MariaDB service; ensure no other service on the docker network conflicts with the container name 'booklore-db'."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "caddy",
    meta: {
      name: "Caddy",
      description: "Caddy is a powerful, enterprise-grade open-source web server with automatic HTTPS, reverse proxy capabilities, and a robust plugin ecosystem.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/caddy.png",
      warnings: ["You must configure a Caddyfile in the container volumes to define routing and proxy rules."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "changedetection",
    meta: {
      name: "Changedetection",
      description: "Changedetection is a self-hosted website monitoring tool that detects visual and structural changes in web pages. It features configurable scheduling, detailed diff visualizations, and comprehensive notification integrations.",
      category: "monitoring",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/changedetection.png",
      warnings: ["Performing frequent browser-based checks (especially with Playwright or WebDriver) can consume significant RAM and CPU resources."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "clipcascade",
    meta: {
      name: "ClipCascade",
      description: "ClipCascade is a self-hosted, open-source clipboard manager that synchronizes and organizes your clipboard history securely across all your devices.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/code.png",
      warnings: ["Clipboard history may contain sensitive information like passwords; ensure your Tailscale ACLs are properly configured."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "code-server",
    meta: {
      name: "Code-server",
      description: "Code-server is VS Code running on a remote server, accessible directly through any web browser, enabling you to code on any device with a consistent development environment.",
      category: "development",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/code-server.png",
      warnings: ["Mounts the host's workspaces or configuration. Securing the password is critical to protect your system from unauthorized command execution."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "CODE_SERVER_PASSWORD", description: "Password to access the web-based VS Code environment", default: "change-me-please" }
      ],
    },
  },
  {
    id: "coder",
    meta: {
      name: "Coder",
      description: "Coder is an open-source platform that provisions self-hosted developer workspaces on your own infrastructure. It automates workspace creation via Terraform, allowing developers to code securely from anywhere using their preferred IDEs.",
      category: "development",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/coder.png",
      warnings: ["Mounts the host's /var/run/docker.sock, which grants containerized workspaces full root access to the host Docker daemon.", "Requires a valid public HTTPS or Tailscale URL configured in CODER_ACCESS_URL for workspaces to successfully connect back to the Coder controller."],
      required_env_vars: [
        { name: "CODER_ACCESS_URL", description: "External URL to access Coder (e.g. https://coder.your-tailnet.ts.net)", default: "http://localhost:7080" }
      ],
    },
  },
  {
    id: "configarr",
    meta: {
      name: "Configarr",
      description: "Configarr is a declarative configuration management tool designed to manage and synchronize settings for Sonarr and Radarr using YAML files.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/configarr.png",
      depends_on: ["sonarr", "radarr"],
      warnings: ["Requires Sonarr and Radarr API access to synchronize and manage configurations."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "convertx",
    meta: {
      name: "ConvertX",
      description: "ConvertX is a self-hosted, user-friendly media conversion tool designed to convert and optimize media files using hardware acceleration.",
      category: "utilities",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/convertx.png",
      warnings: ["Media conversion can be extremely CPU and GPU intensive. Monitor your server's resource utilization during batch conversion processes."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "copyparty",
    meta: {
      name: "Copyparty",
      description: "Copyparty is a fast and lightweight self-hosted file server supporting drag-and-drop uploads, media streaming, WebDAV, directory browsing, and user authentication.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/copyparty.png",
      warnings: ["Copyparty does not have default authentication enabled in this basic compose. Secure your data by configuring `/cfg/copyparty.conf` or setting appropriate access controls."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "cyberchef",
    meta: {
      name: "Cyberchef",
      description: "CyberChef is an intuitive web app for carrying out all manner of 'cyber' operations within a web browser, including encoding, encryption, compression, and data analysis. Known as the 'Cyber Swiss Army Knife', it allows you to build complex pipelines to manipulate data easily.",
      category: "utilities",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/cyberchef.png",
      warnings: ["CyberChef runs entirely inside the client's browser, so operations with extremely large datasets may freeze or crash your web browser tab."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "dashdot",
    meta: {
      name: "Dashdot",
      description: "Dashdot is a modern, highly customizable, and glassmorphic system monitoring dashboard designed for homelabs. It visualizes real-time OS, CPU, storage, RAM, and network statistics using a beautiful interface.",
      category: "monitoring",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/dashdot.png",
      warnings: ["Requires a privileged container execution to access host-level system metrics.", "Mounts the host root filesystem in read-only mode to retrieve accurate disk space usage."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "ddns-updater",
    meta: {
      name: "DDNS Updater",
      description: "DDNS Updater is a lightweight, universal daemon to update dynamic DNS A and/or AAAA records periodically for multiple DNS providers, featuring a web UI.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/ddns-updater.png",
      warnings: ["Requires dynamic DNS records configuration in `/updater/data/config.json` to work properly."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "dockhand",
    meta: {
      name: "Dockhand",
      description: "Dockhand is a modern, lightweight Docker management UI focused on real-time container operations, live logs, and simple Docker Compose stack orchestration.",
      category: "infrastructure",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/dockhand.png",
      warnings: ["Requires access to the host's Docker socket (`/var/run/docker.sock`), granting it full administrative access to manage containers on the host."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "docmost",
    meta: {
      name: "Docmost",
      description: "Docmost is an open-source, collaborative wiki and documentation software designed for teams. It features real-time collaborative editing, hierarchical page organization, a rich-text block editor, and granular permissions management.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/docmost.png",
      warnings: ["Docmost requires separate database and Redis cache containers; ensure no naming or port conflicts exist with other Postgres or Redis containers on the network."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "donetick",
    meta: {
      name: "Donetick",
      description: "Donetick is a simple, lightweight, self-hosted task and checklist manager designed to organize tasks efficiently while keeping your data fully private.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/donetick.png",
      warnings: ["Keep the sqlite database volume backed up to avoid losing your task history."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "dozzle",
    meta: {
      name: "Dozzle",
      description: "Dozzle is a lightweight, simple web-based application that provides real-time log viewing for Docker containers. It runs in the background, monitors all active containers on your host, and streams their logs directly to a modern, searchable web interface.",
      category: "infrastructure",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/dozzle.png",
      warnings: ["Requires read-only access to /var/run/docker.sock, which grants Dozzle visibility into container metadata and logs across your entire Docker host."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "dumbdo",
    meta: {
      name: "DumbDo",
      description: "DumbDo is a self-hosted, minimalistic, and distraction-free task management tool designed to keep your to-do lists simple and incredibly fast.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/todoist.png",
      warnings: ["You can optionally set a PIN by adding a `DUMBDO_PIN` environment variable to secure access to your notes."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "duplicati",
    meta: {
      name: "Duplicati",
      description: "Duplicati is a free, open-source backup client that securely stores encrypted, incremental, compressed backups on local storage, cloud storage services, and remote file servers.",
      category: "backup",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/duplicati.png",
      warnings: ["Access to the host file system should be restricted to directories containing the specific data you intend to back up."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data you want to backup", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "eigenfocus",
    meta: {
      name: "Eigenfocus",
      description: "Eigenfocus is a self-hosted, privacy-focused task and project management tool that helps individuals and teams stay organized with structured, minimalist workflows.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/camera-ui.png",
      warnings: ["Keep the data volume securely backed up to prevent any loss of project or task history."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "excalidraw",
    meta: {
      name: "Excalidraw",
      description: "Excalidraw is a virtual collaborative whiteboard tool for sketching hand-drawn-like diagrams. It provides a simple, highly responsive canvas supporting real-time collaboration, shape styling, and secure local file exporting.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/excalidraw.png",
      warnings: ["To enable real-time collaboration with other users, ensure the application is configured with a proper HTTPS domain."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "filebrowser",
    meta: {
      name: "File Browser",
      description: "File Browser is a lightweight, self-hosted web-based file manager that provides a clean interface for managing, uploading, downloading, and sharing files on your server. It features custom user accounts with varying permissions, text/image editors, and shell execution capabilities.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/filebrowser.png",
      warnings: ["Warning: This application has full access to the configured host directory (${DATA_DIR}). Ensure you restrict access and secure your authentication credentials to prevent unauthorized file manipulation."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "flaresolverr",
    meta: {
      name: "Flaresolverr",
      description: "FlareSolverr is a proxy server designed to bypass Cloudflare and DDoS-Guard protection mechanisms for scraping web content. It runs a headless browser instance in the background to solve Javascript challenges and return the raw HTML of target sites.",
      category: "downloads",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/flaresolverr.png",
      warnings: ["FlareSolverr spawns headless Chrome instances to solve challenges, which can be highly CPU and RAM intensive under heavy request loads.", "Due to changing Cloudflare protections, FlareSolverr may occasionally require manual updates or experience temporary solver failures."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "flatnotes",
    meta: {
      name: "Flatnotes",
      description: "Flatnotes is a self-hosted, minimalist note-taking web application that saves your notes directly as Markdown files, offering full-text search and a clean editor.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/flatnotes.png",
      warnings: ["Remember to change your default `FLATNOTES_PASSWORD` and set a strong `FLATNOTES_SECRET_KEY`."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "FLATNOTES_AUTH_TYPE", description: "Authentication type (e.g. password, none)", default: "password" },
        { name: "FLATNOTES_USERNAME", description: "Admin username for login", default: "user" },
        { name: "FLATNOTES_PASSWORD", description: "Admin password for login", default: "securepassword123" }
      ],
    },
  },
  {
    id: "forgejo",
    meta: {
      name: "Forgejo",
      description: "Forgejo is a self-hosted, lightweight software development platform for hosting Git repositories. Forked from Gitea, it includes source code hosting, code review, issues, pull requests, package registries, and integrated CI/CD actions.",
      category: "development",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/forgejo.png",
      warnings: ["By default, Forgejo uses an embedded SQLite database which is suitable for small teams but may require migration to Postgres or MariaDB for larger installations."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "formbricks",
    meta: {
      name: "Formbricks",
      description: "Formbricks is a privacy-first, open-source survey and feedback management suite. It allows product and marketing teams to easily create in-app, link, and email surveys to capture user insights without vendor lock-in.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/formbricks.png",
      warnings: ["Requires separate database and Redis containers; ensure no naming or port conflicts exist on your docker network.", "You must configure the WEBAPP_URL environment variable to match your public HTTPS domain for emails and links to work correctly."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "WEBAPP_URL", description: "Publicly accessible URL of the Formbricks instance", default: "http://localhost:3000" }
      ],
    },
  },
  {
    id: "fossflow",
    meta: {
      name: "FossFLOW",
      description: "FossFLOW is an open-source, self-hosted, lightweight flowchart and diagram creation tool built with privacy and simplicity in mind.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/diagrams-net.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "PUBLIC_URL", description: "Public domain or URL where FossFLOW is hosted", default: "http://localhost:3000" }
      ],
    },
  },
  {
    id: "frigate",
    meta: {
      name: "Frigate",
      description: "Frigate is an open-source, local NVR (Network Video Recorder) with real-time AI object detection. It is designed to run locally, processing camera streams in real-time to detect people, vehicles, and other custom objects with minimal latency.",
      category: "automation",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/frigate.png",
      depends_on: ["home-assistant"],
      warnings: ["Frigate requires significant CPU resources and is highly optimized for Google Coral TPUs or hardware-accelerated video decoding (GPU).", "Requires a privileged container execution to access hardware acceleration drivers (GPU/TPU) and host devices.", "Relies on a /dev/shm size of 512MB (configured automatically) to handle high-resolution video streams in shared memory."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "FRIGATE_RTSP_PASSWORD", description: "Secure RTSP password for camera streams", default: "generate-a-secure-rtsp-password" }
      ],
    },
  },
  {
    id: "ghost",
    meta: {
      name: "Ghost",
      description: "Ghost is a powerful self-hosted publishing platform and content management system designed for professional creators, bloggers, and journalists. It features a rich editor, robust member subscription/newsletter management, and native search engine optimization.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/ghost.png",
      warnings: ["Ghost requires an external database container; ensure no port or container name conflicts exist with the 'ghost-db' service.", "You must configure the 'url' environment variable or site settings with your public HTTPS domain for emails and links to work correctly."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "gitea",
    meta: {
      name: "Gitea",
      description: "Gitea is a painless, self-hosted Git service that is extremely fast, lightweight, and easy to deploy. It provides comprehensive collaborative features including repository management, issue tracking, pull requests, and built-in package registries.",
      category: "development",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/gitea.png",
      warnings: ["By default, Gitea uses an embedded SQLite database which is ideal for lightweight setups, but should be migrated to PostgreSQL or MySQL for high-concurrency environments."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "gitsave",
    meta: {
      name: "GitSave",
      description: "GitSave is an open-source, self-hosted developer tool designed to securely back up Git repositories from various platforms (GitHub, GitLab, Gitea) to local folders or remote destinations.",
      category: "development",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/git.png",
      warnings: ["Requires generating unique secure keys for JWT authentication and backups encryption; please supply these keys to ensure data safety."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DISABLE_AUTH", description: "Disable web login and interface authentication (set to true or false)", default: "false" }
      ],
    },
  },
  {
    id: "glance",
    meta: {
      name: "Glance",
      description: "Glance is a beautiful, highly-customizable self-hosted home dashboard that consolidates RSS feeds, system metrics, calendars, weather forecasts, and quick links in one place.",
      category: "dashboards",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/glance.png",
      warnings: ["Requires setting up a 'glance.yml' configuration file in the glance-data volume for the dashboard to display custom widgets."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "gokapi",
    meta: {
      name: "Gokapi",
      description: "Gokapi is a lightweight, secure self-hosted file-sharing service. It allows users to upload files and generate shareable download links that automatically expire after a set time or download limit.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/filebrowser.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "gotify",
    meta: {
      name: "Gotify",
      description: "Gotify is a simple, lightweight self-hosted notification server that allows you to send and receive push messages in real-time via WebSockets or a REST API.",
      category: "communication",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/gotify.png",
      warnings: ["Changing GOTIFY_DEFAULTUSER_PASS only takes effect during the initial startup of the container."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "GOTIFY_DEFAULTUSER_PASS", description: "Default password for the admin account (only used on first run)", default: "admin" }
      ],
    },
  },
  {
    id: "grampsweb",
    meta: {
      name: "Gramps Web",
      description: "Gramps Web is a collaborative, self-hosted web application for genealogy. It allows multiple users to view, edit, and collaborate on a shared family tree using a responsive and modern web interface.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/gramps-web.png",
      warnings: ["Gramps Web relies on a companion Celery worker and Redis broker (both included) to run long-running tasks like imports, reports, and search indexing."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "GRAMPSWEB_TREE", description: "Name of the family tree to create/use on initial setup", default: "Gramps Web" }
      ],
    },
  },
  {
    id: "guacamole",
    meta: {
      name: "Guacamole",
      description: "Apache Guacamole is a clientless remote desktop gateway that supports standard protocols like VNC, RDP, and SSH, allowing you to access your desktops and servers from anywhere using a web browser.",
      category: "remote-access",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/guacamole.png",
      warnings: ["Secure your Guacamole instance with a strong administrator password upon first login to prevent unauthorized remote access to your internal network."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "haptic",
    meta: {
      name: "Haptic",
      description: "Haptic is a modern, responsive, self-hosted web music player client designed to stream from Subsonic-compatible music servers like Navidrome, Airsonic, or Gonic.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/haptic.png",
      depends_on: ["navidrome"],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "heimdall",
    meta: {
      name: "Heimdall",
      description: "Heimdall is an elegant and lightweight application dashboard that allows you to easily organize and access all your self-hosted services and bookmarks in one place.",
      category: "dashboards",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/heimdall.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "hemmelig",
    meta: {
      name: "Hemmelig",
      description: "Hemmelig is a self-hosted secure secret sharing web application that allows users to encrypt and transmit sensitive data (passwords, notes, keys) that automatically self-destruct once read.",
      category: "security",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/hemmelig.png",
      warnings: ["Requires setting up a secure BETTER_AUTH_SECRET (at least 32 characters) for cryptographic operations and authentication security."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "BETTER_AUTH_URL", description: "Publicly accessible URL for auth endpoints", default: "http://localhost:3000" },
        { name: "HEMMELIG_BASE_URL", description: "Publicly accessible base URL of your Hemmelig instance", default: "http://localhost:3000" }
      ],
    },
  },
  {
    id: "homarr",
    meta: {
      name: "Homarr",
      description: "Homarr is a sleek, modern self-hosted application dashboard designed to organize and manage your entire homelab or self-hosted stack in a beautifully customizable single portal.",
      category: "dashboards",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/homarr.png",
      warnings: ["If you mount the host Docker socket (/var/run/docker.sock) to enable Homarr's Docker integration, be aware that this container receives elevated privileges over your Docker host."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "HOMARR_SECRET_KEY", description: "64-character hex key used to encrypt stored API credentials (generate with openssl rand -hex 32)", default: "" }
      ],
    },
  },
  {
    id: "home-assistant",
    meta: {
      name: "Home Assistant",
      description: "Home Assistant is a robust self-hosted home automation platform that prioritizes local control and privacy. It acts as a central hub that integrates tens of thousands of smart home devices, allowing you to create complex automations and custom dashboards.",
      category: "automation",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/home-assistant.png",
      warnings: ["Requires a privileged container execution to access host USB devices (e.g., Zigbee/Z-Wave dongles) and system hardware drivers.", "Must be run in host network mode or have proper network routing configured to reliably discover local smart devices via mDNS/UPnP."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "homebox",
    meta: {
      name: "Homebox",
      description: "Homebox is a lightweight, self-hosted inventory and asset management system designed for tracking household items. It allows you to organize physical belongings, document warranties, track serial numbers, and manage locations through a clean, intuitive web interface.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/homebox.png",
      warnings: ["SQLite database is stored in the local volume; ensure regular backups of homebox-data to prevent asset record loss."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "homepage",
    meta: {
      name: "Homepage",
      description: "Homepage is a highly customizable, modern, and aesthetically pleasing application dashboard and start page that integrates with Docker and various self-hosted services. It provides real-time service status, system resource monitoring, and direct widgets for popular home lab tools.",
      category: "dashboards",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/homepage.png",
      warnings: ["Mounting the Docker socket (/var/run/docker.sock) read-only allows Homepage to monitor container states, but exposes Docker daemon access to the container."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "hytale",
    meta: {
      name: "Hytale Server",
      description: "Hytale Server is a self-hosted server deployment for the upcoming sandbox adventure game Hytale, allowing players to host their own custom servers and multiplayer games.",
      category: "gaming",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/hytale.png",
      warnings: ["This server uses UDP port 5520 to allow incoming game connections from players.", "Requires mounting the host's /etc/machine-id file into the container in read-only mode for licensing/hardware signature purposes."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "PROD", description: "Flag to run server in production mode (true or false)", default: "false" },
        { name: "DEBUG", description: "Enable verbose debug logging in the Hytale game server logs (true or false)", default: "false" }
      ],
    },
  },
  {
    id: "immich",
    meta: {
      name: "Immich",
      description: "Immich is a high-performance, self-hosted photo and video backup and management solution. It features AI-powered facial recognition, object detection, automatic backups via mobile apps, and metadata search, acting as a complete alternative to Google Photos.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/immich.png",
      warnings: ["Immich requires at least 4GB RAM and significant CPU for machine learning.", "Video transcoding and machine learning processes are highly resource-intensive; configuring hardware acceleration (GPU) is recommended for optimal performance."],
      required_env_vars: [
        { name: "IMMICH_VERSION", description: "Immich version tag", default: "release" },
        { name: "IMMICH_UPLOAD_DIR", description: "Host directory for photo/video uploads", default: "/opt/tsdeck/immich/upload" }
      ],
    },
  },
  {
    id: "isley",
    meta: {
      name: "Isley",
      description: "Isley is an open-source, self-hosted web-based comic reader and media library organizer designed for digital comic enthusiasts.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/booklore.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "it-tools",
    meta: {
      name: "It Tools",
      description: "IT Tools is a comprehensive collection of handy, web-based utilities and tools curated specifically for developers and IT professionals. It features a wide variety of tools including encoders/decoders, formatters, generators, and converters in a highly responsive user interface.",
      category: "utilities",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/it-tools.png",
      warnings: ["IT Tools is a static client-side web application with very minimal system resource requirements."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "jellyfin",
    meta: {
      name: "Jellyfin",
      description: "Jellyfin is a free, open-source, self-hosted media system that lets you stream and manage your movies, TV shows, music, and photos. It offers full privacy control with no tracking, no premium subscription model, and has apps across major platforms.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/jellyfin.png",
      warnings: ["Hardware transcoding requires passing GPU devices or hardware acceleration drivers to the container.", "Video transcoding is highly resource-intensive and can cause heavy CPU utilization if hardware acceleration is not configured."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "jellyseerr",
    meta: {
      name: "Jellyseerr",
      description: "Jellyseerr is a self-hosted request management and media discovery tool designed for Jellyfin and Emby media servers. It integrates with Sonarr and Radarr to automate TV show and movie downloads, providing a clean dashboard for users to request content.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/jellyseerr.png",
      depends_on: ["jellyfin", "sonarr", "radarr"],
      warnings: ["Requires integration with a running Jellyfin (or Emby) media server and optionally Sonarr/Radarr for request automation."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "kaneo",
    meta: {
      name: "Kaneo",
      description: "Kaneo is a sleek, modern self-hosted Kanban project management platform that helps teams visualize workflows, track tasks, and collaborate without third-party vendor dependencies.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/taskcafe.png",
      warnings: ["Requires separate database, frontend, backend, and proxy containers (included); ensure no naming conflicts exist.", "You must configure KANEO_API_URL and KANEO_CLIENT_URL environment variables to point to your public HTTPS domain for secure client-server communication."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "KANEO_API_URL", description: "Public HTTPS API URL of the Kaneo instance", default: "http://localhost:1337/api" },
        { name: "KANEO_CLIENT_URL", description: "Public HTTPS client URL of the Kaneo instance", default: "http://localhost:5173" }
      ],
    },
  },
  {
    id: "karakeep",
    meta: {
      name: "Karakeep",
      description: "Karakeep is a modern, self-hosted bookmarking and read-it-later application featuring full-text search, automated page archival, screenshot capturing, and AI-assisted search integrations.",
      category: "bookmarks",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/karakeep.png",
      warnings: ["Requires companion Meilisearch and Alpine Chrome containers (included) for full-text search indexing and webpage snapshot capabilities.", "You must generate unique secure values for NEXTAUTH_SECRET and MEILI_MASTER_KEY to secure user sessions and internal search queries.", "Running automated Chrome archiving jobs and Meilisearch full-text indexing can be memory and CPU intensive."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "NEXTAUTH_URL", description: "Publicly accessible HTTPS URL of the Karakeep instance", default: "http://localhost:3000" }
      ],
    },
  },
  {
    id: "kavita",
    meta: {
      name: "Kavita",
      description: "Kavita is a fast, feature-rich, and cross-platform digital library server designed for manga, community comics, and books. It provides a built-in interactive web reader, rich metadata scanning, user management, and supports a wide variety of document and image archive formats.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/kavita.png",
      warnings: ["Library scans can be highly CPU and I/O intensive during initial indexing of large comic or book collections."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "komodo",
    meta: {
      name: "Komodo",
      description: "Komodo is a lightning-fast, self-hosted container management and deployment tool that lets you manage Docker containers, stacks, and deployments across multiple servers.",
      category: "infrastructure",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/komodo.png",
      warnings: ["Requires a secure passkey and JWT secret for authentication. Mounts the host's /var/run/docker.sock to manage containers across your server."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the containers", default: "Europe/Amsterdam" },
        { name: "KOMODO_PASSKEY", description: "Secret passkey used to authenticate periphery agents and admin CLI commands", default: "" },
        { name: "KOMODO_JWT_SECRET", description: "Secret key for signing user authentication tokens (generate with openssl rand -hex 32)", default: "" }
      ],
    },
  },
  {
    id: "kopia",
    meta: {
      name: "Kopia",
      description: "Kopia is a fast, secure, open-source backup tool that creates encrypted, deduplicated, and compressed snapshots of your files and directories to various cloud and local storage locations.",
      category: "backup",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/kopia.png",
      warnings: ["Requires a secure master repository password. Protecting this password is critical because it encrypts and decrypts all of your backups."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "KOPIA_USERNAME", description: "Username for the Kopia server web interface", default: "admin" },
        { name: "KOPIA_PASSWORD", description: "Password for the Kopia server web interface and repository", default: "change-me-please" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data you want to backup", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "languagetool",
    meta: {
      name: "LanguageTool",
      description: "LanguageTool is an open-source grammar, style, and spell checker that helps users write clean, professional text across multiple languages with complete privacy.",
      category: "ai",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/libretranslate.png",
      warnings: ["LanguageTool can be resource-intensive, requiring at least 1-2 GB of RAM depending on active language models."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "librum",
    meta: {
      name: "Librum",
      description: "Librum is a self-hosted server for the Librum e-book reader client. It manages all your books, synchronization data, reader preferences, and reading progress across all of your personal devices.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/librum.png",
      warnings: ["Make sure to choose strong passwords for the database connections and your administrator account.", "The DB password and root password environment variables are required to secure the SQL database."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "LIBRUM_ADMIN_EMAIL", description: "Administrator email address for the first login", default: "admin@example.com" },
        { name: "LIBRUM_ADMIN_PASSWORD", description: "Administrator password for the first login", default: "changethisadminpassword" }
      ],
    },
  },
  {
    id: "linkding",
    meta: {
      name: "Linkding",
      description: "Linkding is a minimalist, fast, and self-hosted bookmark manager designed to be clean, fast, and easy to set up. It features tag-based organization, automatic title and description metadata retrieval, a built-in search engine, and integration extensions for popular browsers.",
      category: "bookmarks",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/linkding.png",
      warnings: ["Database and bookmarks are stored locally; ensure regular backups of the linkding-data volume to avoid losing saved links."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "lube-logger",
    meta: {
      name: "LubeLogger",
      description: "LubeLogger is a self-hosted vehicle management platform that tracks fuel efficiency, maintenance history, parts replacement, and overall vehicle expenses.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/lubelogger.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "LUBELOGGER_MOTD", description: "Message of the day shown on the dashboard login screen", default: "My Car" },
        { name: "LUBELOGGER_DOMAIN", description: "The custom domain name configured for LubeLogger (e.g. lubelogger.local)", default: "undefined" }
      ],
    },
  },
  {
    id: "mattermost",
    meta: {
      name: "Mattermost",
      description: "Mattermost is a secure, self-hosted collaboration and messaging platform designed for technical and operational teams that serves as an alternative to Slack.",
      category: "communication",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/mattermost.png",
      warnings: ["Requires a companion PostgreSQL database, which is fully configured and included in this stack."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DOMAIN", description: "Public domain or hostname of the service (e.g. mattermost.example.com)", default: "undefined" }
      ],
    },
  },
  {
    id: "mealie",
    meta: {
      name: "Mealie",
      description: "Mealie is a fully-featured, self-hosted recipe manager and meal planner with a beautiful user interface. It allows you to easily import recipes from websites by URL, customize meal plans, generate shopping lists, and share recipes with family members.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/mealie.png",
      warnings: ["By default, sign-up is disabled via ALLOW_SIGNUP: false; modify this environment variable if you need to create additional user accounts."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "memos",
    meta: {
      name: "Memos",
      description: "Memos is an open-source, self-hosted memo hub and note-taking application designed to capture thoughts, tasks, and bookmarks instantly. It supports markdown formatting, tags, sharing, and provides a lightweight, clean social-network-style feed of your personal notes.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/memos.png",
      warnings: ["Data is stored in a local SQLite database within the memos-data volume; ensure regular backups of this volume to prevent data loss."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "metube",
    meta: {
      name: "Metube",
      description: "MeTube is a web-based GUI wrapper for yt-dlp, allowing you to easily download videos and audio from YouTube and dozens of other websites. It features a simple queue system, custom download directory mapping, and supports downloading playlists, channels, or individual videos.",
      category: "downloads",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/metube.png",
      warnings: ["Downloading high-resolution videos or large playlists is highly CPU and disk-write intensive and may temporarily slow down host performance."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "minecraft",
    meta: {
      name: "Minecraft Server",
      description: "Minecraft Server is a self-hosted server for the popular sandbox game, allowing players to connect and build together in a private multiplayer world.",
      category: "gaming",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/minecraft.png",
      warnings: ["Requires significant CPU and RAM (minimum 2-4 GB depending on player count and mods). Needs TCP port 25565 exposed for game client connections."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "SERVER_TYPE", description: "Minecraft server type (VANILLA, PAPER, FABRIC, etc.)", default: "VANILLA" },
        { name: "MINECRAFT_VERSION", description: "Minecraft server version (e.g. LATEST or 1.21.4)", default: "LATEST" },
        { name: "DIFFICULTY", description: "Game difficulty level (peaceful, easy, normal, hard)", default: "normal" },
        { name: "MAX_PLAYERS", description: "Max number of concurrent players allowed", default: "10" },
        { name: "MOTD", description: "Message of the day shown in the server list", default: "A Minecraft Server on Tailscale" },
        { name: "MEMORY", description: "JVM memory allocation (e.g. 2G)", default: "2G" }
      ],
    },
  },
  {
    id: "miniflux",
    meta: {
      name: "Miniflux",
      description: "Miniflux is a minimalist, open-source, and fast self-hosted RSS reader designed to be simple, efficient, and clean.",
      category: "bookmarks",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/miniflux.png",
      warnings: ["Requires a companion PostgreSQL database, which is fully configured and included in this stack."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "ADMIN_USERNAME", description: "Miniflux administrator username", default: "admin" },
        { name: "ADMIN_PASSWORD", description: "Miniflux administrator password", default: "undefined" },
        { name: "TAILNET_NAME", description: "Your Tailscale network name (e.g. tailnet-name.ts.net)", default: "undefined" }
      ],
    },
  },
  {
    id: "miniqr",
    meta: {
      name: "MiniQR",
      description: "MiniQR is a lightweight, clean self-hosted QR code generator that helps users quickly create customizable QR codes with complete privacy.",
      category: "utilities",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/code.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "n8n",
    meta: {
      name: "n8n",
      description: "n8n is an extendable workflow automation tool that enables you to connect various APIs, databases, and SaaS tools without writing code. It features a powerful node-based visual designer, robust error-handling, and self-hostable execution for secure data integrations.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/n8n.png",
      warnings: ["Running complex workflow automations with high execution frequency or processing large payloads can consume significant memory and disk storage."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container and workflows", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "nanote",
    meta: {
      name: "Nanote",
      description: "Nanote is an ultra-minimalistic, distraction-free, self-hosted note-taking app that prioritizes markdown editing, speed, and privacy.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/flatnotes.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "navidrome",
    meta: {
      name: "Navidrome",
      description: "Navidrome is a modern, lightweight, and highly efficient self-hosted music server and streamer that is compatible with Subsonic and Airsonic clients. It allows you to access and stream your personal music collection from any device, with support for major audio formats, transcoding, and rich metadata scanning.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/navidrome.png",
      warnings: ["Scanning large music libraries during initial setup may cause transient high CPU and disk utilization."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "nessus",
    meta: {
      name: "Nessus",
      description: "Nessus is a comprehensive, self-hosted vulnerability scanner that provides deep network assessments, configuration audits, and security analysis.",
      category: "monitoring",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tenable.png",
      warnings: ["Vulnerability scanning is highly resource-intensive and may trigger intrusion detection systems or firewalls on target networks."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "netbox",
    meta: {
      name: "NetBox",
      description: "NetBox is a premium, open-source infrastructure resource management (IRM) platform that combines IP address management (IPAM) and data center infrastructure management (DCIM) tools.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/netbox.png",
      warnings: ["NetBox requires multiple database and caching services (PostgreSQL, Valkey/Redis) which are fully orchestrated in this stack."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "next-explorer",
    meta: {
      name: "Next Explorer",
      description: "Next Explorer is a web-based, modern, and beautiful file manager that allows you to easily browse, manage, and share files from your host system with Tailscale users.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/nextexplorer.png",
      warnings: ["Requires host directory mapping to access the local files you wish to explore."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "ACCESS_PATH", description: "The absolute path on the host system to share/browse, e.g., /home/user/files", default: "undefined" }
      ],
    },
  },
  {
    id: "nextcloud",
    meta: {
      name: "Nextcloud",
      description: "Nextcloud is a comprehensive self-hosted productivity platform that serves as a secure alternative to commercial cloud storage. It offers file sharing, collaborative document editing, calendars, contacts, and email clients, all fully integrated and hosted on your private server.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/nextcloud.png",
      warnings: ["Nextcloud defaults to using SQLite which is not recommended for production. It is highly recommended to configure it to use an external relational database (like PostgreSQL or MariaDB) for better performance and reliability."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "nodered",
    meta: {
      name: "Nodered",
      description: "Node-RED is a powerful flow-based programming tool for wiring together hardware devices, APIs, and online services. It provides a browser-based flow editor that makes it easy to integrate smart home devices and design complex automation logic using a wide range of pre-built nodes.",
      category: "automation",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/node-red.png",
      warnings: ["Ensure Docker network routing allows Node-RED to access local subnet IPs if integrating with physical local smart home devices.", "Node-RED allows arbitrary JavaScript execution in flow nodes; secure your Node-RED instance access carefully to prevent unauthorized control."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "ntfy",
    meta: {
      name: "Ntfy",
      description: "Ntfy is a simple, HTTP-based publish-subscribe notification service that allows you to send push notifications to your phone or desktop via scripts, curl requests, or custom webhooks. It is highly lightweight, privacy-focused, and has native apps for Android and iOS.",
      category: "communication",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/ntfy.png",
      warnings: ["By default, anyone who knows your topic name can read or send notifications unless you explicitly configure access control lists (ACLs) in the ntfy configuration file.", "To receive push notifications on iOS devices using the official ntfy app, a public HTTPS endpoint or integration with the official upstream server is required due to Apple APNS limitations."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "ollama",
    meta: {
      name: "Ollama",
      description: "Ollama is a lightweight, extensible framework for building and running large language models (LLMs) locally on your own hardware. It allows you to easily download, run, and interact with open-source models like Llama, Mistral, and Gemma via a robust local API.",
      category: "ai",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/ollama.png",
      warnings: ["Ollama is resource-intensive and requires substantial CPU or GPU resources for model inference.", "To run inference with GPU acceleration, you must install the NVIDIA Container Toolkit on your host and pass GPU devices to the container."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "open-webui",
    meta: {
      name: "Open Webui",
      description: "Open WebUI is a user-friendly, feature-rich self-hosted web interface designed for local large language models. It integrates seamlessly with Ollama and OpenAI-compatible APIs, offering support for multi-modal interactions, retrieval-augmented generation (RAG), and agent creation.",
      category: "ai",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/open-webui.png",
      depends_on: ["ollama"],
      warnings: ["Requires a running Ollama instance to perform AI model inference.", "By default, the first user registered becomes the administrator, who can then manage access for subsequent users."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "paperless",
    meta: {
      name: "Paperless",
      description: "Paperless-ngx is a document management system that transforms your physical documents into a searchable digital archive. It features OCR powered by Tesseract, automated tagging and classification, full-text search, and multi-user support.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/paperless-ngx.png",
      warnings: ["OCR and document consumption are CPU-intensive and can cause heavy load spikes during processing."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "PAPERLESS_ADMIN_USER", description: "Username for your Paperless admin account", default: "admin" },
        { name: "PAPERLESS_ADMIN_PASSWORD", description: "Password for your Paperless admin account", default: "" }
      ],
    },
  },
  {
    id: "picard",
    meta: {
      name: "MusicBrainz Picard",
      description: "MusicBrainz Picard is a cross-platform music tagger written in Python that helps organize your digital music collection by identifying and writing audio tags.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/musicbrainz-picard.png",
      warnings: ["Requires persistent volume mapping for both configuration settings and your music library."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "pihole",
    meta: {
      name: "Pihole",
      description: "Pi-hole is a network-wide ad blocker that acts as a private DNS server to intercept and block ads and tracking domains for all devices on your local network.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/pi-hole.png",
      warnings: ["Requires port 53 to be available on the host, which may conflict with existing DNS stub listeners (like systemd-resolved)."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "pingvin-share",
    meta: {
      name: "Pingvin Share",
      description: "Pingvin Share is a self-hosted file sharing platform that allows you to easily upload and share files with customizable link expiration times, password protection, and download limits.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/pingvin-share.png",
      warnings: ["Ensure you have sufficient disk space on the host volume to store uploaded files and handle large file transfers."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "plex",
    meta: {
      name: "Plex",
      description: "Plex is a powerful media server platform that organizes your personal video, music, and photo libraries, streaming them seamlessly to any device with rich metadata.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/plex.png",
      warnings: ["Hardware transcoding requires passing GPU devices or hardware acceleration drivers to the container."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "PLEX_CLAIM", description: "Plex claim token to automatically associate the server with your Plex account (obtain from plex.tv/claim)", default: "" }
      ],
    },
  },
  {
    id: "pocket-id",
    meta: {
      name: "Pocket ID",
      description: "Pocket ID is a simple, lightweight self-hosted OIDC/OAuth2 identity provider that allows you to easily manage users and authenticate services across your homelab.",
      category: "security",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/pocket-id.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "APP_URL", description: "Public URL of Pocket-ID, e.g. https://pocket-id.your-domain.ts.net", default: "undefined" },
        { name: "ENCRYPTION_KEY", description: "Encryption key for secure OIDC credentials storage (e.g. a secure base64 string)", default: "undefined" }
      ],
    },
  },
  {
    id: "portainer",
    meta: {
      name: "Portainer",
      description: "Portainer is a lightweight, web-based container management interface that simplifies the deployment, monitoring, and administration of Docker containers, volumes, and networks.",
      category: "infrastructure",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/portainer.png",
      warnings: ["Exposing the Docker socket (/var/run/docker.sock) grants Portainer root-level privileges over the host system; ensure access is strictly secured."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "portracker",
    meta: {
      name: "Portracker",
      description: "Portracker is a modern, simple self-hosted dashboard that tracks active open ports and network socket usage across your host system and running containers.",
      category: "infrastructure",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/portracker.png",
      warnings: ["Requires access to the host's Docker socket and database paths to accurately discover and monitor running service ports."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "posterizarr",
    meta: {
      name: "Posterizarr",
      description: "Posterizarr is an automated utility that generates customized overlay posters for Plex, Emby, or Jellyfin media libraries based on user configuration.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/posterizarr.png",
      depends_on: ["plex"],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "prowlarr",
    meta: {
      name: "Prowlarr",
      description: "Prowlarr is an indexer manager and proxy built on the popular Arr .NET stack, integrating seamlessly with your download clients and automation tools to track torrent and Usenet indexers.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/prowlarr.png",
      warnings: ["Ensure indexer requests are secured or proxied to prevent ISP notifications or IP exposure if downloading copyrighted material."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "qbittorrent",
    meta: {
      name: "qBittorrent",
      description: "qBittorrent is a lightweight, open-source BitTorrent client with a built-in web UI, support for search plugins, sequential downloading, and detailed torrent creation controls.",
      category: "downloads",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/qbittorrent.png",
      warnings: ["Requires significant disk space and write I/O. Use of an external VPN or proxy is highly recommended to protect your public IP when downloading torrents."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "radarr",
    meta: {
      name: "Radarr",
      description: "Radarr is a movie collection manager and PVR that automates the downloading of films via torrents and Usenet, organizing your library and matching high-quality metadata.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/radarr.png",
      warnings: ["Requires a download client (like qBittorrent) and indexers (via Prowlarr) configured to automate media fetching. Ensure the mapped media directory has correct write permissions."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "readarr",
    meta: {
      name: "Readarr",
      description: "Readarr is an ebook and audiobook collection manager for Usenet and BitTorrent users. It monitors multiple RSS feeds for new books and integrates with download clients and indexers to fully automate downloading, parsing, and renaming.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/readarr.png",
      depends_on: ["prowlarr", "qbittorrent"],
      warnings: ["Readarr is in active development (develop branch). Ensure you keep regular backups of your library and configuration.", "Requires a torrent or Usenet download client (e.g. qBittorrent) and indexer manager (e.g. Prowlarr) to automate downloads."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "recyclarr",
    meta: {
      name: "Recyclarr",
      description: "Recyclarr is a CLI tool that automates the synchronization of recommended TRaSH Guides configurations, quality profiles, and custom formats to your Sonarr and Radarr instances.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/recyclarr.png",
      depends_on: ["sonarr", "radarr"],
      warnings: ["Requires running and accessible Sonarr and Radarr instances to synchronize configurations and API keys."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "requestrr",
    meta: {
      name: "Requestrr",
      description: "Requestrr is a chatbot used to simplify writing and executing commands in Discord for requesting content from services like Sonarr, Radarr, and Jellyseerr. It features seamless automated requests, downloads, and interactive user confirmations directly via Discord.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/requestrr.png",
      depends_on: ["sonarr", "radarr", "seerr"],
      warnings: ["Requires a pre-configured Discord Bot Token to function. You will need to create a bot account on the Discord Developer Portal."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "resilio-sync",
    meta: {
      name: "Resilio Sync",
      description: "Resilio Sync is a fast, peer-to-peer file synchronization tool that uses the BitTorrent protocol to securely transfer files between devices without cloud storage.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/resiliosync.png",
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "rustdesk-server",
    meta: {
      name: "RustDesk Server",
      description: "RustDesk Server is a self-hosted remote desktop software solution that provides full control of your data with no configuration required. It acts as both an ID/rendezvous server and a relay server, enabling secure and fast connections between your devices.",
      category: "remote-access",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/rustdesk.png",
      warnings: ["Requires multiple host ports to be opened (21115-21119) on your firewall to allow external RustDesk clients to connect."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "scrutiny",
    meta: {
      name: "Scrutiny",
      description: "Scrutiny is a hard drive S.M.A.R.T. monitoring dashboard and historical database that tracks disk health and health check history across all your storage drives.",
      category: "monitoring",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/scrutiny.png",
      warnings: ["Requires the SYS_RAWIO capability and direct access to host disk devices (/dev and /run/udev) to poll S.M.A.R.T. metrics."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "searxng",
    meta: {
      name: "SearXNG",
      description: "SearXNG is a privacy-respecting, hackable metasearch engine that aggregates results from dozens of search engines without tracking or profiling you.",
      category: "ai",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/searxng.png",
      warnings: ["Requires a unique, randomly-generated SEARXNG_SECRET_KEY to start successfully. Session cookies will be signed using this key."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "SEARXNG_BASE_URL", description: "The base URL of your SearXNG instance (e.g. https://searxng.your-tailnet.ts.net/)", default: "http://localhost:8080/" }
      ],
    },
  },
  {
    id: "seerr",
    meta: {
      name: "Seerr",
      description: "Seerr is a request management and media discovery tool for the Plex ecosystem, allowing users to browse, discover, and request content with automated delivery integration.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/overseerr.png",
      depends_on: ["plex"],
      warnings: ["Requires a running Plex media server instance and integration with Sonarr/Radarr to process media requests."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "slink",
    meta: {
      name: "Slink",
      description: "Slink is a fast, self-hosted file and image sharing platform built with Symfony and SvelteKit. It offers full control over your media, featuring private link sharing, password protection, and direct integration with tools like ShareX.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/slink.png",
      warnings: ["Requires origin URL configuration to properly direct sharing links and secure uploads."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "SLINK_ORIGIN", description: "The primary public origin URL of your Slink instance", default: "http://localhost:3000" },
        { name: "SLINK_USER_APPROVAL_REQUIRED", description: "Set to true to require admin approval before new users can upload images", default: "true" },
        { name: "SLINK_STORAGE_PROVIDER", description: "Storage provider type (local or smb)", default: "local" }
      ],
    },
  },
  {
    id: "sonarr",
    meta: {
      name: "Sonarr",
      description: "Sonarr is a TV series collection manager and PVR that automates the downloading of episodes via torrents and Usenet, organizing your library and tracking missing episodes.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/sonarr.png",
      warnings: ["Requires a download client (like qBittorrent) and indexers (via Prowlarr) configured to automate media fetching. Ensure the mapped media directory has correct write permissions."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "speedtest-tracker",
    meta: {
      name: "Speedtest Tracker",
      description: "Speedtest Tracker is a self-hosted application that automatically runs periodic internet speed tests and visualizes the results over time with detailed charts and history.",
      category: "monitoring",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/speedtest-tracker.png",
      warnings: ["Running frequent speed tests can consume significant network bandwidth and may impact internet performance during tests."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "stirlingpdf",
    meta: {
      name: "Stirlingpdf",
      description: "Stirling PDF is a robust, self-hosted web-based PDF manipulation tool that allows you to merge, split, compress, convert, and secure PDF files entirely offline.",
      category: "utilities",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/stirling-pdf.png",
      warnings: ["Processing very large PDF files or running optical character recognition (OCR) can be highly CPU and memory intensive."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "stump",
    meta: {
      name: "Stump",
      description: "Stump is a fast, free, and open-source comic book server. It is built to serve digital comic libraries, ePUB books, and PDF files, featuring responsive web readers, robust library organization, and OPDS server support.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/stump.png",
      warnings: ["Make sure that your digital book and comic directories have read permissions granted to the container."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "subtrackr",
    meta: {
      name: "Subtrackr",
      description: "Subtrackr is a modern, self-hosted personal subscription tracking application that helps you monitor recurring expenses, upcoming renewals, and payment methods. It features a clean dashboard to visualize and organize all your subscriptions in a secure, local-first database.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/google-finance.png",
      warnings: ["Ensure the data volume is securely backed up to prevent losing your subscription tracking records."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "swingmx",
    meta: {
      name: "Swing Music",
      description: "Swing Music is a beautifully designed, self-hosted music streaming server that indexes your local audio files and serves them via a modern web interface. Paired with TSDProxy, you can securely access your personal music library from any of your devices on your Tailnet.",
      category: "media",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/swingmusic.png",
      warnings: ["Requires access to a local music directory on the host. Please ensure the SWINGMX_MUSIC_PATH environment variable is correctly configured to point to your music library."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "SWINGMX_MUSIC_PATH", description: "Absolute path to your local music directory on the host", default: "/path/to/music" }
      ],
    },
  },
  {
    id: "syncthing",
    meta: {
      name: "Syncthing",
      description: "Syncthing is a continuous, peer-to-peer decentralized file synchronization application. It replaces proprietary cloud sync and storage services with a secure, private, and encrypted direct file exchange.",
      category: "files",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/syncthing.png",
      warnings: ["Exposes port 22000 (TCP/UDP) and port 21027 (UDP) on the host for direct peer discovery and sync protocol connections."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Host directory for synchronized files and shared folders", default: "/opt/tsdeck/syncthing/data" }
      ],
    },
  },
  {
    id: "tailscale-app-connector-node",
    meta: {
      name: "Tailscale App Connector Node",
      description: "Tailscale App Connector Node is an infrastructure component that routes traffic to third-party SaaS applications through your local network. It allows you to enforce secure, identity-aware access controls on public SaaS resources by anchoring their traffic to a trusted node.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tailscale.png",
      warnings: ["Requires a valid Tailscale Auth Key (TS_AUTHKEY) to register the node with your Tailnet.", "Requires the NET_ADMIN capability and access to the host's TUN device (/dev/net/tun) to configure networking."],
      required_env_vars: [
        { name: "TS_AUTHKEY", description: "Tailscale Auth Key (tskey-auth-...) to authorize this node in your Tailnet", default: "tskey-auth-change-me" }
      ],
    },
  },
  {
    id: "tailscale-exit-node",
    meta: {
      name: "Tailscale Exit Node",
      description: "Tailscale Exit Node enables you to route all of your public internet traffic through a specific device on your Tailnet. This allows you to securely access the web when using untrusted networks (like public Wi-Fi) by routing and encrypting your traffic through your home or office connection.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tailscale.png",
      warnings: ["Requires a valid Tailscale Auth Key (TS_AUTHKEY) to register the node with your Tailnet.", "Requires the NET_ADMIN capability and access to the host's TUN device (/dev/net/tun) to configure networking.", "IP forwarding must be enabled on the host machine for exit node routing to work correctly."],
      required_env_vars: [
        { name: "TS_AUTHKEY", description: "Tailscale Auth Key (tskey-auth-...) to authorize this exit node in your Tailnet", default: "tskey-auth-change-me" }
      ],
    },
  },
  {
    id: "tailscale-subnet-router-node",
    meta: {
      name: "Tailscale Subnet Router Node",
      description: "Tailscale Subnet Router Node securely connects your entire physical local network to your Tailnet. It allows devices on your Tailnet to access resources in specified local subnets without needing to install Tailscale client software on each individual local device.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tailscale.png",
      warnings: ["Requires a valid Tailscale Auth Key (TS_AUTHKEY) to register the subnet router node.", "Requires the NET_ADMIN capability and access to the host's TUN device (/dev/net/tun) to configure networking.", "IP forwarding must be enabled on the host machine to route traffic to physical subnets."],
      required_env_vars: [
        { name: "TS_AUTHKEY", description: "Tailscale Auth Key (tskey-auth-...) to authorize this subnet router in your Tailnet", default: "tskey-auth-change-me" },
        { name: "SUBNET_ROUTES", description: "Comma-separated subnet routes to advertise (e.g., 192.168.1.0/24)", default: "192.168.1.0/24" }
      ],
    },
  },
  {
    id: "tandoor",
    meta: {
      name: "Tandoor Recipes",
      description: "Tandoor Recipes is an open-source, self-hosted recipe manager and meal planner that lets you organize recipes, plan weekly meals, and auto-generate shopping lists. It provides a highly functional, ad-free platform to manage your culinary lifestyle in total privacy.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tandoor-recipes.png",
      warnings: ["Requires a persistent database backup to prevent loss of your saved recipes and meal plans."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "tautulli",
    meta: {
      name: "Tautulli",
      description: "Tautulli is a monitoring and tracking web application for Plex Media Server that provides detailed playback statistics, watch history, and user activity insights.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tautulli.png",
      depends_on: ["plex"],
      warnings: ["Requires a running Plex media server instance and appropriate Plex credentials/API tokens to pull activity and history logs."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "technitium",
    meta: {
      name: "Technitium DNS Server",
      description: "Technitium DNS Server is an open-source self-hosted DNS server that can be used for self-hosting a local DNS server for privacy and security. It features a powerful web console with support for DNS-over-HTTPS, DNS-over-TLS, blocklists, and advanced caching.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/technitium.png",
      warnings: ["Requires port 53 (TCP/UDP) to be free on the host. You may need to disable local system resolvers (like systemd-resolved) to successfully start this service."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "TECHNITIUM_DNS_DOMAIN", description: "The primary domain name used by this DNS Server to identify itself", default: "dns-server.local" },
        { name: "TECHNITIUM_ADMIN_PASSWORD", description: "Web console administrator password", default: "admin" },
        { name: "TECHNITIUM_DNS_RECURSION", description: "Recursion options (Allow, Deny, AllowOnlyForPrivateNetworks, UseSpecifiedNetworkACL)", default: "Allow" },
        { name: "TECHNITIUM_DNS_FORWARDERS", description: "Comma-separated list of forwarder DNS addresses (e.g., 1.1.1.1, 8.8.8.8)", default: "1.1.1.1,8.8.8.8" }
      ],
    },
  },
  {
    id: "tinyauth",
    meta: {
      name: "TinyAuth",
      description: "TinyAuth is a lightweight forward authentication portal that integrates with reverse proxies like Traefik to provide simple, secure authentication for your self-hosted apps.",
      category: "security",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/tinyauth.png",
      warnings: ["Ensure TINYAUTH_USERS is configured with a secure bcrypt hash to restrict access, and TINYAUTH_APP_URL matches your Tailscale network address."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "TINYAUTH_APP_URL", description: "The external URL where TinyAuth is hosted (e.g. https://tinyauth.your-tailnet.ts.net)", default: "https://tinyauth.your-tailnet.ts.net" },
        { name: "TINYAUTH_USERS", description: "JSON array representing users and bcrypt-hashed passwords (use double quotes inside the string)", default: "[{\"username\":\"admin\",\"hash\":\"$$2a$$10$$XmFhL/uW1wJ.rYJ8H5aP/eXF9.xK4hNq3l4fPz2mK1i2o3p4q5s6t\"}]" }
      ],
    },
  },
  {
    id: "tracktor",
    meta: {
      name: "Tracktor",
      description: "Tracktor is an open-source, self-hosted vehicle management application built on SvelteKit and SQLite. It provides a simple, modern interface to track fuel consumption, vehicle maintenance logs, insurance details, and essential regulatory documents.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/transmission.png",
      warnings: ["Requires persistent data storage for the SQLite database. Ensure the data volume is securely backed up."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "TRACKTOR_DEMO_MODE", description: "Enable demo mode with mock data (true or false)", default: "false" },
        { name: "TRACKTOR_FORCE_DATA_SEED", description: "Force seed database with initial schema (true or false)", default: "false" },
        { name: "TRACKTOR_CORS_ORIGINS", description: "Comma-separated list of allowed CORS origins (* for all)", default: "*" }
      ],
    },
  },
  {
    id: "traefik",
    meta: {
      name: "Traefik",
      description: "Traefik is a modern HTTP reverse proxy and load balancer designed to deploy microservices with ease. It automatically discovers configurations from your Docker containers and manages routes, entrypoints, and SSL certificates dynamically.",
      category: "infrastructure",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/traefik.png",
      warnings: ["Requires ports 80 and 443 to be free on your host. If you have another web server running, it will conflict with this deployment.", "Requires read-only access to the Docker socket (/var/run/docker.sock) to dynamically discover container services."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "transmute",
    meta: {
      name: "Transmute",
      description: "Transmute is an open-source, self-hosted file conversion platform that supports converting images, video, audio, documents, and fonts locally. It prioritizes complete privacy and features an integrated REST API for seamless automation across your services.",
      category: "downloads",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/code.png",
      warnings: ["Conversion of large media files (such as 4K videos or heavy images) is highly CPU and RAM intensive; ensure your host system has sufficient resources allocated."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "unmanic",
    meta: {
      name: "Unmanic",
      description: "Unmanic is a simple post-processor for your media library. It monitors your library directories for new video files and automatically transcodes them using templates to optimize formats, remove unwanted audio/subtitle streams, and reduce overall library storage footprint.",
      category: "media-management",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/unmanic.png",
      warnings: ["High resource utilization: Transcoding video files is highly CPU and RAM intensive. It is recommended to deploy on transcoding-capable nodes.", "GPU acceleration configuration is recommended for hardware-accelerated transcoding (e.g. NVIDIA NVDEC/NVENC, Intel QuickSync)."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" },
        { name: "DATA_DIR", description: "Unified parent directory for all self-hosted data (enables instantaneous hardlinks)", default: "/opt/tsdeck/data" }
      ],
    },
  },
  {
    id: "uptime-kuma",
    meta: {
      name: "Uptime Kuma",
      description: "Uptime Kuma is a self-hosted monitoring tool that tracks the availability of websites, services, and containers in real-time, providing multi-channel alerts and customizable status pages.",
      category: "monitoring",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/uptime-kuma.png",
      warnings: ["Ensure host network or docker routing allows access to local IPs for internal network monitoring, and secure access as the container mounts /var/run/docker.sock."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "vaultwarden",
    meta: {
      name: "Vaultwarden",
      description: "Vaultwarden is an alternative, lightweight implementation of the Bitwarden secrets manager written in Rust, designed for self-hosting with minimal system resource consumption.",
      category: "security",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/vaultwarden.png",
      warnings: ["It is highly recommended to run Vaultwarden behind an HTTPS reverse proxy (such as TSDProxy/Tailscale) to enable modern browser cryptography features and secure passwords."],
      required_env_vars: [
        { name: "VAULTWARDEN_SIGNUPS_ALLOWED", description: "Allow new users to sign up", default: "false" },
        { name: "VAULTWARDEN_ADMIN_TOKEN", description: "Admin panel token (leave empty to disable)", default: "" }
      ],
    },
  },
  {
    id: "vikunja",
    meta: {
      name: "Vikunja",
      description: "Vikunja is a feature-rich, self-hosted todo and task management platform that allows you to organize tasks via lists, kanban boards, Gantt charts, and custom namespaces.",
      category: "productivity",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/vikunja.png",
      warnings: ["Ensure database and files volumes are backed up regularly to prevent data loss of tasks, projects, and file attachments."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "wallos",
    meta: {
      name: "Wallos",
      description: "Wallos is an open-source, self-hosted web application that simplifies subscription tracking and management. It provides a highly visual dashboard to track recurring payments, categorize subscriptions, monitor currency exchange rates, and view detailed spending statistics.",
      category: "home",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/wallos.png",
      warnings: ["Requires persistent data storage. Ensure your volumes are securely backed up to prevent losing your financial tracking records."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
  {
    id: "watchtower",
    meta: {
      name: "Watchtower",
      description: "Watchtower is a lightweight application that automates Docker container base image updates. It monitors active containers, detects new base image versions on registries, and cleanly restarts containers with new configurations.",
      category: "infrastructure",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/watchtower.png",
      warnings: ["Requires full read-write access to the host's Docker socket (/var/run/docker.sock) to orchestrate and update containers."],
      required_env_vars: [

      ],
    },
  },
  {
    id: "wireguard",
    meta: {
      name: "WireGuard",
      description: "WireGuard (via wg-easy) is an extremely simple, fast, and modern virtual private network (VPN) client and server. It provides a secure, encrypted tunnel to your home network, managed via a user-friendly web interface.",
      category: "networking",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/wireguard.png",
      warnings: ["Requires elevated system administration capabilities (NET_ADMIN) to modify network interfaces and configure routing.", "Exposes port 51820 (UDP) on the host for incoming WireGuard VPN client connections."],
      required_env_vars: [
        { name: "WG_PASSWORD", description: "Admin password to secure the wg-easy web management portal", default: "change-me-please" },
        { name: "WG_HOST", description: "Public IP address or DDNS domain name of your server for client connections", default: "192.168.1.100" }
      ],
    },
  },
  {
    id: "xwiki",
    meta: {
      name: "XWiki",
      description: "XWiki is an advanced, enterprise-grade open-source wiki platform that offers extensive customization, structured data handling, and app development capabilities. It enables teams to collaborate, share knowledge, and build powerful wiki-based applications in a highly scalable self-hosted environment.",
      category: "documents",
      icon: "https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/xwiki.png",
      warnings: ["XWiki is resource-intensive and requires a minimum of 2GB RAM to perform optimally under standard usage.", "Requires a dedicated MariaDB database container; ensure the database volume is securely backed up."],
      required_env_vars: [
        { name: "TZ", description: "Timezone for the container", default: "Europe/Amsterdam" }
      ],
    },
  },
];
