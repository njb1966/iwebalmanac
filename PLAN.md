# PLAN.md — Independent Web Almanac

## Project Summary

Build **Independent Web Almanac** at **iwebalmanac.net**.

This is a self-hosted editorial publication about human-scale technology, digital ownership, intentional infrastructure, independent publishing, protocol literacy, and the preservation of a human web.

The project must feel like an independent publication, not a SaaS product, not a personal diary, not a homelab dump, and not a social media account.

## Core Mission

> The web should remain a human place: owned by individuals, built with intention, and enhanced by technology rather than dominated by platforms, algorithms, or synthetic engagement.

## Guiding Principles

- No ads.
- No analytics.
- No third-party JavaScript.
- No tracking pixels.
- No external font calls.
- No social media widgets.
- No engagement bait.
- No algorithm-chasing design.
- No unnecessary client-side JavaScript.
- No Docker.
- Prefer simple, inspectable, durable tools.
- Prefer static publishing wherever possible.
- Use modern technology intentionally, especially AI, as a tool that helps humans retain agency rather than replacing human judgment.

## Target Server

- Provider: DigitalOcean
- OS: Debian 13
- Deployment model: native services, no Docker
- Reverse proxy/web server: Caddy
- Static site generator: Eleventy
- Publishing/federation substrate: WriteFreely, installed natively
- Database: SQLite unless strong reason emerges otherwise
- Gemini server: Agate or another simple static Gemini server, installed natively
- Site is the only project on this droplet

## Primary Domain

- Canonical web domain: `https://iwebalmanac.net`
- Publication name: `Independent Web Almanac`

## Proposed Subdomains

Use the fewest subdomains necessary.

Recommended initial structure:

- `iwebalmanac.net` — Eleventy front site, canonical homepage
- `notes.iwebalmanac.net` — WriteFreely instance and ActivityPub publishing
- `gemini.iwebalmanac.net` — Gemini capsule
- Optional future:
  - `feeds.iwebalmanac.net` — only if feed complexity grows
  - `lab.iwebalmanac.net` — only if protocol experiments need separation

Avoid creating extra subdomains unless they serve a real purpose.

## DNS Requirements

Create DNS records after droplet IP is known.

Required:

```dns
A     iwebalmanac.net           <droplet_ipv4>
A     www.iwebalmanac.net       <droplet_ipv4>
A     notes.iwebalmanac.net     <droplet_ipv4>
A     gemini.iwebalmanac.net    <droplet_ipv4>
AAAA  iwebalmanac.net           <droplet_ipv6_if_enabled>
AAAA  www.iwebalmanac.net       <droplet_ipv6_if_enabled>
AAAA  notes.iwebalmanac.net     <droplet_ipv6_if_enabled>
AAAA  gemini.iwebalmanac.net    <droplet_ipv6_if_enabled>
```

Optional but recommended:

```dns
CAA   iwebalmanac.net 0 issue "letsencrypt.org"
```

If email is eventually used, add SPF, DKIM, and DMARC later. Do not configure email during v1 unless needed.

## Server Users and Directory Layout

Create a dedicated deployment user:

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

Create service users where appropriate:

```bash
sudo useradd --system --home /opt/writefreely --shell /usr/sbin/nologin writefreely
sudo useradd --system --home /srv/gemini --shell /usr/sbin/nologin gemini
```

Recommended directories:

```text
/var/www/iwebalmanac.net/           # Eleventy built static site
/opt/iwebalmanac-site/              # Eleventy source repository
/opt/writefreely/                   # WriteFreely binary, config, db, keys
/srv/gemini/iwebalmanac.net/        # Gemini capsule content
/etc/caddy/Caddyfile                # Caddy config
/etc/systemd/system/writefreely.service
/etc/systemd/system/agate.service
/var/backups/iwebalmanac/           # local backup staging
```

## Package Installation

Install base packages:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y \
  curl wget git ufw fail2ban unzip tar build-essential \
  sqlite3 ca-certificates gnupg lsb-release \
  nodejs npm \
  golang \
  rsync
```

Important:

- Verify Node.js is 18 or newer for Eleventy.
- Verify Go version is sufficient for the current WriteFreely release.
- If Debian packages are too old, install Node.js from NodeSource or use `nvm` for the deploy user.
- Avoid global npm sprawl. Prefer project-local dependencies.

## Firewall

Enable only required ports:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 1965/tcp
sudo ufw enable
sudo ufw status verbose
```

Port meanings:

- 22 SSH
- 80 HTTP challenge/redirect
- 443 HTTPS
- 1965 Gemini

## Caddy Installation

Install Caddy using the official Debian package repository, not Docker.

After install:

```bash
sudo systemctl enable caddy
sudo systemctl start caddy
```

Caddy will manage HTTPS automatically.

## Caddyfile

Create `/etc/caddy/Caddyfile`.

Initial recommended config:

```caddyfile
{
	email admin@iwebalmanac.net
}

iwebalmanac.net {
	root * /var/www/iwebalmanac.net
	encode zstd gzip
	file_server

	header {
		# Privacy and security basics
		Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "geolocation=(), microphone=(), camera=(), interest-cohort=()"

		# Do not set an over-aggressive CSP until all local assets are confirmed.
		# Add Content-Security-Policy later after testing.
	}

	redir /notes https://notes.iwebalmanac.net{uri} permanent
}

www.iwebalmanac.net {
	redir https://iwebalmanac.net{uri} permanent
}

notes.iwebalmanac.net {
	encode zstd gzip

	reverse_proxy 127.0.0.1:8080

	header {
		Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
		Permissions-Policy "geolocation=(), microphone=(), camera=(), interest-cohort=()"
	}
}
```

Validate and reload:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Eleventy Front Site

### Role

The Eleventy site is the canonical front door and editorial frame.

It is not merely a landing page. It should establish the publication identity, organize durable content, and make feeds/federation easy to understand.

### Repository

Create the source repository:

```bash
sudo mkdir -p /opt/iwebalmanac-site
sudo chown -R deploy:deploy /opt/iwebalmanac-site
cd /opt/iwebalmanac-site
git init
npm init -y
npm install @11ty/eleventy
```

### Eleventy Goals

- Static HTML output.
- Minimal CSS.
- No required JavaScript.
- Local assets only.
- Semantic HTML.
- Accessible typography.
- Fast page loads.
- Useful RSS/Atom feeds.
- Sitemap.
- Robots.txt.
- Humans.txt.
- Well-known metadata where appropriate.

### Suggested Eleventy Structure

```text
/opt/iwebalmanac-site/
  package.json
  .eleventy.js
  src/
    _data/
      site.json
      navigation.json
    _includes/
      layouts/
        base.njk
        page.njk
        post.njk
      partials/
        header.njk
        footer.njk
        nav.njk
        feed-links.njk
    assets/
      css/
        main.css
      img/
    pages/
      mission.md
      about.md
      follow.md
      feeds.md
      protocols.md
      infrastructure.md
      discoveries.md
      notes.md
    essays/
      example-essay.md
    discoveries/
      example-discovery.md
    notes/
      example-note.md
    protocols/
      example-protocol.md
    index.njk
    robots.njk
    sitemap.njk
    humans.md
  dist/
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "eleventy",
    "serve": "eleventy --serve",
    "clean": "rm -rf dist",
    "deploy": "npm run clean && npm run build && rsync -av --delete dist/ /var/www/iwebalmanac.net/"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0"
  }
}
```

Adjust version after checking current package availability.

### Eleventy Config

`.eleventy.js` should:

- Use `src` as input.
- Use `dist` as output.
- Copy static assets.
- Add collections:
  - essays
  - notes
  - discoveries
  - protocols
  - infrastructure
- Generate clean permalinks.
- Avoid unnecessary plugins unless useful.

### Site Data

`src/_data/site.json`:

```json
{
  "name": "Independent Web Almanac",
  "domain": "iwebalmanac.net",
  "url": "https://iwebalmanac.net",
  "description": "A human-first publication about independent infrastructure, intentional technology, and the web as a place people can still own.",
  "mission": "The web should remain a human place: owned by individuals, built with intention, and enhanced by technology rather than dominated by platforms, algorithms, or synthetic engagement.",
  "author": "Independent Web Almanac",
  "language": "en",
  "fediverse": "https://notes.iwebalmanac.net",
  "gemini": "gemini://gemini.iwebalmanac.net"
}
```

## Front Site Information Architecture

### Home

Purpose:

- Explain the publication in one screen.
- Show the mission.
- Link to primary sections.
- Show latest essays/discoveries/notes.
- Make following easy.

Homepage should include:

- Publication name.
- Mission statement.
- Short “what this is” paragraph.
- Latest essay.
- Latest discovery.
- Latest note.
- Follow links:
  - RSS
  - WriteFreely / ActivityPub
  - Gemini

### Mission

Expanded manifesto, but restrained.

Include:

- Human web thesis.
- Ownership and stewardship.
- Technology stance.
- AI stance: neither hype nor rejection; intentional use.
- Anti-platform and anti-synthetic-engagement stance.
- Publishing principles.

Avoid:

- Political party language.
- Culture war language.
- Nostalgia-only framing.
- Angry manifesto voice.

### Essays

Longform writing.

Topics:

- Independent infrastructure.
- Human web commentary.
- Intentional technology.
- Protocol literacy.
- Digital ownership.
- Practical AI as a human-serving tool.

### Notes

Short-form posts, but the front site may link primarily to WriteFreely for notes.

Two options:

1. Keep notes only in WriteFreely and link to `notes.iwebalmanac.net`.
2. Mirror selected notes into Eleventy for canonical archive.

For v1, use option 1 unless mirroring is easy.

### Discoveries

Editorially framed curation.

Not link dumps.

Each discovery post should answer:

- What is it?
- Why does it matter?
- How does it fit the human/independent web?
- Who might use it?

### Infrastructure

Practical build notes and architecture decisions.

Do not include routine maintenance logs unless there is a useful lesson.

### Protocols

Dedicated section for:

- ActivityPub
- RSS/Atom
- Gemini
- Webmention
- Email
- Static publishing
- Search
- Federation patterns

### About

This should explain the editorial perspective, not become a personal autobiography.

Use language like:

> Independent Web Almanac is written from the perspective of an experienced internet native with an infrastructure mindset.

Avoid making this “Nick’s tech stuff.”

### Follow

Must be clear and practical.

Include:

- Website: `https://iwebalmanac.net`
- ActivityPub / WriteFreely: `https://notes.iwebalmanac.net`
- RSS feed URLs
- Gemini capsule: `gemini://gemini.iwebalmanac.net`
- Explain how to follow from Mastodon once WriteFreely federation is confirmed.

### Feeds

List all available feeds.

Minimum:

- Main site feed
- Essays feed
- Discoveries feed
- WriteFreely feed

## Editorial Pillars

### 1. Independent Infrastructure

Editorial test:

> Does this teach ownership, design, resilience, or intentional systems?

Include:

- self-hosting architecture
- federation
- static publishing
- RSS
- Gemini
- ActivityPub
- digital identity
- protocol design
- search independence

Reject:

- routine package update logs
- configuration dumps without interpretation
- homelab diary entries with no broader lesson

### 2. Human Web Commentary

Purpose:

Keep the mission alive.

Include:

- platform incentives
- algorithmic mediation
- synthetic engagement
- online identity
- community architecture
- ad-tech
- surveillance
- forum decline
- publishing culture

Reject:

- culture war bait
- doomposting
- nostalgia with no argument

### 3. Practical Technology, Human-Serving

Include only technology that helps people retain agency.

Include:

- local AI workflows
- Joplin/knowledge management
- self-hosted search
- privacy-respecting tools
- CLI utilities
- automation
- indie software

AI stance:

- AI is a tool.
- Use it deliberately.
- Prefer local or privacy-preserving workflows when practical.
- Do not treat generated output as a replacement for human judgment.
- Avoid AI hype cycles.
- Avoid AI moral panic.

### 4. Curated Discovery

Not linkspam.

Every curated item needs editorial framing.

Include:

- what it is
- why it matters
- who it is for
- how it relates to the mission

## Explicit Non-Goals

Do not build or include:

- ads
- analytics
- third-party trackers
- external comment widgets
- share buttons
- newsletter popups
- cookie banners unless technically required
- generic personal diary posts
- dating/relationship content
- music/guitar content unless directly related to independent tech/publishing
- culture war bait
- AI hype content
- anti-AI absolutism
- “creator economy” behavior
- engagement bait
- SEO sludge
- overdesigned dashboards
- dark cyberpunk/matrix visual clichés

## Visual Design Direction

Style should feel:

- editorial
- independent
- text-first
- durable
- calm but not generic
- practical
- human
- fast

Avoid:

- neon hacker aesthetic
- AI gradient blobs
- corporate SaaS layout
- fake newspaper cosplay
- overdone retro terminal theme
- excessive icons
- stock photography

Design priorities:

- excellent typography
- strong spacing
- readable measure
- clear navigation
- meaningful section descriptions
- good mobile rendering
- print-friendly article pages

Use:

- system font stack or locally hosted open font
- plain CSS
- no framework unless necessary
- CSS custom properties
- light/dark mode only if simple and CSS-only

Suggested palette:

- off-white background
- dark charcoal text
- muted blue/green accents
- warm gray borders

Do not use externally loaded Google Fonts.

## WriteFreely Native Install

### Role

WriteFreely provides:

- publishing substrate
- ActivityPub federation
- short notes/dispatches
- optional longform cross-posting
- RSS/Atom from the federated publication

### Install Approach

Install WriteFreely natively from official release or source.

Preferred:

- Use official release binary if available for current architecture.
- Use SQLite for simplicity.
- Run as `writefreely` system user.
- Bind to localhost only: `127.0.0.1:8080`.
- Let Caddy terminate TLS and reverse proxy.

### Directory

```bash
sudo mkdir -p /opt/writefreely
sudo chown -R writefreely:writefreely /opt/writefreely
```

### Build From Source Fallback

If no suitable binary is used:

```bash
cd /tmp
git clone https://github.com/writefreely/writefreely.git
cd writefreely
go build -v -tags='sqlite' ./cmd/writefreely/
```

Then copy binary and required assets to `/opt/writefreely`.

Follow the current WriteFreely docs for asset generation and config initialization.

### Configuration

Run initial config as writefreely user.

Expected values:

- Host: `https://notes.iwebalmanac.net`
- Port: `8080`
- Bind: `127.0.0.1`
- Database: SQLite
- Federation: enabled
- Single-user or closed-registration multi-user instance
- Site name: `Independent Web Almanac Notes`
- Public registration: disabled
- Admin user: create manually

The instance should not be an open public blogging host.

### systemd Unit

Create `/etc/systemd/system/writefreely.service`:

```ini
[Unit]
Description=WriteFreely
After=network.target

[Service]
Type=simple
User=writefreely
Group=writefreely
WorkingDirectory=/opt/writefreely
ExecStart=/opt/writefreely/writefreely
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=/opt/writefreely

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable writefreely
sudo systemctl start writefreely
sudo systemctl status writefreely
```

### Federation Checks

After DNS and HTTPS work:

- Confirm `https://notes.iwebalmanac.net` loads.
- Confirm admin login works.
- Confirm posts publish.
- Confirm RSS/Atom feed works.
- Confirm ActivityPub discovery from Mastodon or another fediverse instance.
- Confirm WebFinger if WriteFreely exposes it.
- Confirm profile can be followed.

Document the final ActivityPub handle in `src/pages/follow.md`.

Potential handles:

- `@editor@notes.iwebalmanac.net`
- `@almanac@notes.iwebalmanac.net`

Prefer `@editor` if supported, because it feels editorial and human.

## Gemini Capsule

### Role

Gemini is a secondary mirror/archive, not the primary publication surface.

It should reinforce the small web ethos without fragmenting attention.

### Server

Use Agate unless there is a strong reason not to.

Agate is simple and serves static Gemini files.

### Directory

```bash
sudo mkdir -p /srv/gemini/iwebalmanac.net
sudo chown -R gemini:gemini /srv/gemini
```

### Initial Capsule Files

```text
/srv/gemini/iwebalmanac.net/
  index.gmi
  mission.gmi
  essays/
  discoveries/
  protocols/
  notes/
```

### Gemini Content Policy

Do not attempt to mirror everything at first.

Start with:

- mission
- about
- selected essays
- selected discoveries
- protocol experiments

### Agate systemd Unit

Exact Agate path may vary. If installed at `/usr/local/bin/agate`, create `/etc/systemd/system/agate.service`:

```ini
[Unit]
Description=Agate Gemini Server
After=network.target

[Service]
Type=simple
User=gemini
Group=gemini
ExecStart=/usr/local/bin/agate \
  --content /srv/gemini/iwebalmanac.net \
  --hostname gemini.iwebalmanac.net \
  --addr [::]:1965 \
  --addr 0.0.0.0:1965
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ProtectHome=true
ReadWritePaths=/srv/gemini

[Install]
WantedBy=multi-user.target
```

Enable:

```bash
sudo systemctl daemon-reload
sudo systemctl enable agate
sudo systemctl start agate
sudo systemctl status agate
```

## Git-Based Deployment

### Repository Strategy

Use one Git repository for the Eleventy site.

Optional future repositories:

- `iwebalmanac-gemini`
- `iwebalmanac-writefreely-theme`

For v1, keep it simple.

### Deployment Flow

Preferred simple deployment:

1. Edit locally or on server.
2. Commit changes.
3. Build Eleventy.
4. Rsync `dist/` to `/var/www/iwebalmanac.net`.

Command:

```bash
cd /opt/iwebalmanac-site
git pull
npm install
npm run deploy
```

Set ownership:

```bash
sudo chown -R caddy:caddy /var/www/iwebalmanac.net
```

Or allow deploy user to write to `/var/www/iwebalmanac.net` and Caddy to read.

### Permissions

Recommended:

```bash
sudo mkdir -p /var/www/iwebalmanac.net
sudo chown -R deploy:www-data /var/www/iwebalmanac.net
sudo chmod -R 755 /var/www/iwebalmanac.net
```

Adjust depending on Debian/Caddy user.

## Feeds

Eleventy must generate RSS or Atom.

Required:

- Main feed
- Essays feed
- Discoveries feed

Nice to have:

- Protocols feed
- Notes feed if notes are mirrored

Each feed should include:

- title
- canonical URL
- publication date
- updated date if available
- excerpt
- full content if practical

Do not use third-party feed services.

## robots.txt

Generate:

```txt
User-agent: *
Allow: /

Sitemap: https://iwebalmanac.net/sitemap.xml
```

Optional later:

Block aggressive AI crawlers only if desired. Do not overfit this in v1.

## humans.txt

Create `/humans.txt` or `/humans/`.

Example:

```txt
Independent Web Almanac

A human-first publication about independent infrastructure,
intentional technology, and the web as a place people can still own.

No ads. No analytics. No third-party JavaScript.
```

## Sitemap

Generate `/sitemap.xml` from Eleventy.

Include all canonical public pages.

## WebFinger and ActivityPub Sanity

Important:

WriteFreely on `notes.iwebalmanac.net` will likely handle its own WebFinger and ActivityPub endpoints for that subdomain.

Do not manually proxy or rewrite ActivityPub endpoints unless necessary.

After setup, test:

```bash
curl https://notes.iwebalmanac.net/.well-known/webfinger?resource=acct:editor@notes.iwebalmanac.net
```

Adjust account name based on actual WriteFreely user/collection.

If you want `@editor@iwebalmanac.net` instead of `@editor@notes.iwebalmanac.net`, that requires additional WebFinger delegation/reverse proxy routing and should be treated as a later enhancement, not v1.

## Security Baseline

### SSH

- Disable password login after SSH key verified.
- Disable root SSH login.
- Use `ufw`.
- Enable `fail2ban`.

Edit `/etc/ssh/sshd_config`:

```text
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Restart SSH carefully:

```bash
sudo systemctl restart ssh
```

Keep a second session open while testing.

### Automatic Updates

Install unattended upgrades:

```bash
sudo apt install -y unattended-upgrades apt-listchanges
sudo dpkg-reconfigure unattended-upgrades
```

### Backups

Back up:

- `/opt/iwebalmanac-site`
- `/opt/writefreely`
- `/srv/gemini`
- `/etc/caddy/Caddyfile`
- systemd units

Minimum backup script:

```bash
#!/usr/bin/env bash
set -euo pipefail

DEST="/var/backups/iwebalmanac/$(date +%F)"
mkdir -p "$DEST"

rsync -a /opt/iwebalmanac-site/ "$DEST/iwebalmanac-site/"
rsync -a /opt/writefreely/ "$DEST/writefreely/"
rsync -a /srv/gemini/ "$DEST/gemini/"
cp /etc/caddy/Caddyfile "$DEST/Caddyfile"
cp /etc/systemd/system/writefreely.service "$DEST/writefreely.service" || true
cp /etc/systemd/system/agate.service "$DEST/agate.service" || true

tar -czf "$DEST.tar.gz" -C "$(dirname "$DEST")" "$(basename "$DEST")"
rm -rf "$DEST"
```

Later, push encrypted backups offsite.

## Initial Content Seed

Do not launch with empty sections.

Minimum launch content:

### Required Pages

- Home
- Mission
- About
- Follow
- Feeds
- Essays
- Discoveries
- Infrastructure
- Protocols

### Required Content

- 1 mission essay
- 1 infrastructure essay
- 1 human web commentary essay
- 2 discovery posts
- 3 short WriteFreely notes
- 1 protocol experiment or protocol explainer

### Suggested Launch Essays

1. `Why the Web Should Remain a Human Place`
2. `Independent Infrastructure Is Not Nostalgia`
3. `Using AI Without Surrendering Human Judgment`

### Suggested Discovery Posts

1. `What Makes a Useful Small Web Project Worth Following`
2. `A Short List of Human-Scale Publishing Tools`

### Suggested Protocol Piece

1. `Why RSS Still Belongs in the Publishing Stack`

## Homepage Draft Copy

Use this as initial homepage copy:

```markdown
# Independent Web Almanac

The web should remain a human place: owned by individuals, built with intention, and enhanced by technology rather than dominated by platforms, algorithms, or synthetic engagement.

Independent Web Almanac is a self-hosted publication about human-scale technology, independent infrastructure, protocol literacy, digital ownership, and deliberate use of modern tools.

This is not a platform, a content farm, a homelab diary, or another feed chasing attention. It is a place for essays, notes, discoveries, and experiments about keeping the web useful, personal, and owned by the people who build and inhabit it.
```

## Mission Page Draft Copy

Use this as starter copy:

```markdown
# Mission

The web should remain a human place: owned by individuals, built with intention, and enhanced by technology rather than dominated by platforms, algorithms, or synthetic engagement.

Independent Web Almanac exists for people who still believe publishing on the internet can be personal, durable, useful, and independent.

Modern technology is not the enemy. Neither is automation. Neither is AI. The problem begins when tools stop serving people and start replacing judgment, ownership, authorship, and community with extraction, automation, and performance.

This publication is written from an infrastructure-minded perspective. Protocols matter. Domains matter. Feeds matter. Portability matters. Small systems matter. The choices underneath a website shape the culture that grows on top of it.

The goal is not to recreate the past. The goal is to build and document better ways to live on the web now.
```

## Crawler and AI Policy

For v1, keep simple.

No analytics and no tracking matter more than performative crawler policy.

Optional `robots.txt` later may disallow known AI crawlers if desired, but do not let this become the centerpiece.

## Accessibility

Requirements:

- semantic headings
- proper landmarks
- keyboard navigable links
- visible focus styles
- sufficient contrast
- responsive layout
- no text embedded in images
- descriptive link text
- readable font sizes
- no motion effects unless user-controlled

## Performance

Requirements:

- static pages should be tiny
- no third-party JS
- no client framework
- images optimized locally
- CSS under control
- minimal requests
- no external fonts

## Testing Checklist

### Web

```bash
curl -I https://iwebalmanac.net
curl -I https://www.iwebalmanac.net
curl -I https://notes.iwebalmanac.net
curl -I https://iwebalmanac.net/robots.txt
curl -I https://iwebalmanac.net/sitemap.xml
```

Check:

- HTTPS works.
- `www` redirects.
- Static pages load.
- WriteFreely loads.
- No mixed content.
- No external network calls except first-party domains.

### Caddy

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl status caddy
journalctl -u caddy -n 100 --no-pager
```

### Eleventy

```bash
cd /opt/iwebalmanac-site
npm run build
```

### WriteFreely

```bash
sudo systemctl status writefreely
journalctl -u writefreely -n 100 --no-pager
```

### Gemini

```bash
sudo systemctl status agate
journalctl -u agate -n 100 --no-pager
```

Test with a Gemini client:

```text
gemini://gemini.iwebalmanac.net
```

## Done Criteria for v1

The project is v1 complete when:

- `https://iwebalmanac.net` serves the Eleventy front site.
- `https://www.iwebalmanac.net` redirects to apex.
- `https://notes.iwebalmanac.net` serves WriteFreely.
- WriteFreely can publish posts.
- ActivityPub follow works from at least one external fediverse instance.
- RSS/Atom feeds are discoverable.
- `robots.txt` exists.
- `sitemap.xml` exists.
- `humans.txt` exists.
- Gemini capsule is reachable at `gemini://gemini.iwebalmanac.net`.
- No analytics are installed.
- No third-party JS is loaded.
- No external fonts are loaded.
- Caddy, WriteFreely, and Agate run under systemd.
- Basic backups exist.
- Initial content seed is published.
- Follow page clearly explains how to follow by RSS, ActivityPub, and Gemini.

## Future Enhancements

Do not build these in v1 unless easy:

- Webmentions
- Micropub
- automatic Eleventy-to-Gemini conversion
- WriteFreely post mirroring into Eleventy
- search
- email newsletter
- custom WriteFreely theme
- `@editor@iwebalmanac.net` root-domain ActivityPub identity
- public submissions
- comments
- forum/community component

## Claude Code Instructions

When implementing:

1. Prefer simple, readable files over clever abstractions.
2. Do not add frameworks unless explicitly necessary.
3. Do not add analytics.
4. Do not add third-party scripts.
5. Do not use Docker.
6. Do not add Tailwind, React, Vue, or client-side build frameworks.
7. Use Eleventy, Markdown, Nunjucks, and plain CSS.
8. Keep the design editorial and text-first.
9. Keep all assets local.
10. Create clear README instructions.
11. Create deployment scripts that can be inspected and run manually.
12. Preserve the mission and editorial boundaries in generated copy.
13. Ask before introducing external services.
14. Keep v1 small enough to launch.

## References for Implementation

- Eleventy requires Node.js 18 or newer.
- Caddy should be installed using official Debian packages.
- WriteFreely can run as a static binary and supports SQLite.
- Agate is a simple Gemini server for static files.
