# Independent Web Almanac

Source repository for [iwebalmanac.net](https://iwebalmanac.net) — an independent editorial publication about human-scale technology, open protocols, and building a web worth owning.

## What this is

Independent Web Almanac is a self-hosted publication arguing and demonstrating that the web can remain human-owned, human-built, and human-governed. Content pillars:

- Independent infrastructure (self-hosting, federation, static publishing, RSS, Gemini, ActivityPub)
- Human web commentary (platform incentives, surveillance, synthetic engagement, forum culture)
- Practical technology that preserves human agency (local AI workflows, privacy tools, CLI utilities)
- Curated discovery — editorially framed links, not link dumps

## Stack

| Layer | Tool |
|---|---|
| Static site | [Eleventy 3.x](https://www.11ty.dev/) (Nunjucks/Markdown) |
| Web server | [Caddy](https://caddyserver.com/) (TLS auto-renewing) |
| Notes / ActivityPub | [WriteFreely](https://writefreely.org/) |
| Gemini capsule | [Agate](https://github.com/mbrubeck/agate) |
| Database | SQLite |
| OS | Debian 13 |

No Docker. No analytics. No third-party JavaScript. No external fonts.

## URLs

| URL | Service |
|---|---|
| https://iwebalmanac.net | Main site |
| https://www.iwebalmanac.net | Redirects to apex |
| https://notes.iwebalmanac.net | WriteFreely / ActivityPub |
| gemini://gemini.iwebalmanac.net | Gemini capsule |

## Repository layout

```
src/
  _data/          — site-wide data (site.json)
  _includes/
    layouts/      — base.njk page layout
    partials/     — sidebar.njk and other partials
  assets/css/     — main.css (no frameworks)
  essays/         — longform posts (.md)
  discoveries/    — curated links with editorial framing (.md)
  protocols/      — protocol literacy pieces (.md)
  notes/          — short-form notes (.md)
  infrastructure/ — self-hosting and infrastructure writing (.md)
  pages/          — static pages (about, mission, follow)
deploy.sh         — one-command deploy to production server
PLAN.md           — original deployment plan
HOWTO.md          — admin and content workflow guide
```

## Quick start

```bash
npm install
npm run build    # build to dist/
npm run serve    # local dev server
./deploy.sh      # push to production
```

## Server

Hosted on Contabo VPS (`contabo4`, 147.93.129.235). See `HOWTO.md` for all admin procedures.
