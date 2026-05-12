# iwebalmanac.net — Admin & Content Guide

## Server access

```bash
ssh contabo4        # nick@147.93.129.235, port 22, ed25519 key
```

Site source lives at `/opt/iwebalmanac-site/` on contabo4.

---

## Publishing content

### Adding an essay

Create `src/essays/your-slug.md`:

```markdown
---
layout: layouts/base.njk
title: Your Essay Title
description: One sentence summary shown in listings.
date: 2026-05-12
---

Body content here in Markdown.
```

### Adding a discovery post

Create `src/discoveries/your-slug.md`:

```markdown
---
layout: layouts/base.njk
title: Name of the Thing You're Recommending
description: Why it matters. One or two sentences.
date: 2026-05-12
url: https://example.com
---

Editorial framing goes here. Not a link dump — explain why it belongs on the human web.
```

### Adding a protocol piece

Create `src/protocols/your-slug.md` — same frontmatter pattern as essays.

### Adding a short note

Create `src/notes/your-slug.md` — same frontmatter pattern.

---

## Deploying changes

### Option A — Edit on the server, deploy in place

```bash
ssh contabo4
cd /opt/iwebalmanac-site
# edit files with nano/vim
npm run deploy      # builds and rsyncs dist/ → /var/www/iwebalmanac.net/
```

### Option B — Deploy from local machine

```bash
./deploy.sh
```

This SSHes into contabo4, runs the Eleventy build there, and rsyncs to the web root. Requires contabo4 in `~/.ssh/config`.

---

## WriteFreely (notes.iwebalmanac.net)

### Log in

Visit https://notes.iwebalmanac.net/login — username `editor`.

### Admin panel

https://notes.iwebalmanac.net/admin

### Restart service

```bash
ssh contabo4 "sudo systemctl restart writefreely"
```

### Check logs

```bash
ssh contabo4 "journalctl -u writefreely -n 50 --no-pager"
```

### Config file

`/opt/writefreely/config.ini` on contabo4.

### Database

SQLite at `/opt/writefreely/writefreely.db`. Back up before any manual edits.

---

## Gemini capsule (gemini://gemini.iwebalmanac.net)

Content lives at `/srv/gemini/iwebalmanac.net/` on contabo4.

```bash
ssh contabo4
sudo -u gemini nano /srv/gemini/iwebalmanac.net/index.gmi
sudo systemctl restart agate
```

### Add a new Gemini page

Create `/srv/gemini/iwebalmanac.net/yourpage.gmi` as the `gemini` user:

```bash
ssh contabo4 "sudo -u gemini tee /srv/gemini/iwebalmanac.net/yourpage.gmi" << 'EOF'
# Page Title

Content here.

=> / Home
EOF
```

### Check Agate logs

```bash
ssh contabo4 "journalctl -u agate -n 30 --no-pager"
```

---

## Caddy (web server / TLS)

### Config file

`/etc/caddy/Caddyfile` on contabo4.

### Reload after config changes

```bash
ssh contabo4 "sudo systemctl reload caddy"
```

### Check TLS cert status

```bash
ssh contabo4 "journalctl -u caddy -n 30 --no-pager"
```

### Add a new subdomain

Edit `/etc/caddy/Caddyfile`, add a new block, then reload:

```caddyfile
newsubdomain.iwebalmanac.net {
    root * /var/www/newsubdomain
    file_server
}
```

---

## Backups

Backups run daily at 3am (server time) and push to `debian-mac` at `/mnt/storage/backups/iwebalmanac/`.

### Run a manual backup

```bash
ssh contabo4 "sudo /usr/local/bin/iwebalmanac-backup"
```

### Verify backups arrived on debian-mac

```bash
ssh debian-mac "ls -lh /mnt/storage/backups/iwebalmanac/"
```

### What gets backed up

- `/opt/iwebalmanac-site/` — Eleventy source
- `/opt/writefreely/` — WriteFreely binary, config, and SQLite database
- `/srv/gemini/` — Gemini capsule content
- `/etc/caddy/Caddyfile`
- systemd unit files for writefreely and agate

Retention: 7 days of daily archives on debian-mac.

---

## Service management

```bash
# Status of all three services
ssh contabo4 "systemctl is-active caddy writefreely agate"

# Restart individual services
ssh contabo4 "sudo systemctl restart caddy"
ssh contabo4 "sudo systemctl restart writefreely"
ssh contabo4 "sudo systemctl restart agate"

# View logs
ssh contabo4 "journalctl -u caddy -n 50 --no-pager"
ssh contabo4 "journalctl -u writefreely -n 50 --no-pager"
ssh contabo4 "journalctl -u agate -n 30 --no-pager"
```

---

## Adding webrings

When you join a webring, add the badge(s) to the sidebar partial:

Edit `/opt/iwebalmanac-site/src/_includes/partials/sidebar.njk` — find the `sidebar-webrings` section and replace the placeholder:

```html
<section class="sidebar-section sidebar-webrings">
  <h3>Webrings</h3>
  <div class="badge-row">
    <a href="https://webring.example.com/prev"><img src="/assets/img/webring-badge.gif" width="88" height="31" alt="Webring Name"></a>
  </div>
</section>
```

Put badge images in `/opt/iwebalmanac-site/src/assets/img/` — self-host them, don't link externally.

Then deploy:

```bash
ssh contabo4 "cd /opt/iwebalmanac-site && npm run deploy"
```

---

## Updating the sidebar

Edit `/opt/iwebalmanac-site/src/_includes/partials/sidebar.njk` and deploy.

---

## Updating site metadata

Edit `/opt/iwebalmanac-site/src/_data/site.json` — site name, description, fediverse handle, Gemini URL.

---

## Git workflow

The repo is at https://github.com/njb1966/iwebalmanac.

After editing files locally:

```bash
cd /media/nick/Seagate_4TB/projects/web/websites/iwebalmanac.net
git add -p
git commit -m "your message"
git push origin main
```

To sync server changes back to the local repo before committing:

```bash
rsync -av --exclude='node_modules' --exclude='dist' --exclude='.git' \
  contabo4:/opt/iwebalmanac-site/ \
  /media/nick/Seagate_4TB/projects/web/websites/iwebalmanac.net/
```
