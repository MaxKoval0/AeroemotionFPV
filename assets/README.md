# Media — drop-in guide

The site already runs with elegant placeholder visuals (animated gradients).
To switch them for your own footage, add files with these **exact names** —
no code changes needed, they'll be picked up automatically.

## Video (`assets/video/`)

| File | Used for | Aspect | Suggested length | Notes |
|---|---|---|---|---|
| `hero-bg.mp4` + `hero-poster.jpg` | Hero background (desktop + fallback) | 16:9 or wider, 1920×1080+ | 10–20s loop | Muted, no dialogue needed |
| `hero-bg-mobile.mp4` (optional) | Hero background on screens ≤768px | 9:16, 1080×1920 | 10–20s loop | Used automatically once present; falls back to `hero-bg.mp4` (cropped) if missing |
| `tier1.mp4` + `tier1-poster.jpg` | Laptop screen — Tier 01 Cinematic Flythrough | 16:9, 1920×1080 | 10–20s loop | A muted, web-optimised excerpt — not the full film (see below) |
| `tier2.mp4` + `tier2-poster.jpg` | Laptop screen — Tier 02 / 03 Motion Edition | 16:9, 1920×1080 | 10–20s loop | Ideally the version with your motion graphics baked in |
| `tier3-reel.mp4` + `tier3-reel-poster.jpg` | Phone screen — Tier 03 Social Pack | 9:16, 1080×1920 | 10–15s loop | A vertical Reels/TikTok cut |

General tips:
- Export as `.mp4` (H.264), muted, and keep each file under ~8MB so the page stays fast.
- Posters are `.jpg` frame grabs shown before the video loads — pick a strong first frame.
- All videos autoplay muted and loop; if a file is missing, the animated gradient placeholder is shown instead, so the site always looks finished.

### "Watch the full film" button (Tier 01 / 02)

The laptop mockup plays a short **silent** loop — that's intentional, it's
just ambient preview footage. To let visitors watch the actual 60–90s film
in full quality with sound, host it on YouTube or Vimeo (unlisted is fine)
and paste its **embed URL** into the `data-embed-url` attribute on the
matching tier's layer in [`index.html`](../index.html) (search for
`screen-media__layer`, around the Services section):

```html
<div class="screen-media__layer ... data-tier-media="1" data-embed-url="https://www.youtube-nocookie.com/embed/XXXXXXXXXXX?autoplay=1&rel=0">
```

- Leave it as `data-embed-url=""` to keep the button hidden for that tier (the default).
- Tier 01 and Tier 02 each have their own attribute, so each can link to a different film.
- Tier 03 (the phone reel) has no such button — those clips are already the final short-form deliverable.

## Images (`assets/images/`)

| File | Used for | Size |
|---|---|---|
| `favicon.svg` | Browser tab icon | already included (gold "A" monogram) — replace with your logo mark if you have one |
| `og-image.jpg` | Preview image for WhatsApp/social shares | 1200×630 |

## Things to personalise before launch

- **WhatsApp number** — set once in [`js/main.js`](../js/main.js), top of the file: `const WHATSAPP_NUMBER = '34600000000'`. This single value powers both the "Message us directly" button and the footer icon.
- **Lead form** ([`#leadForm`](../index.html)) — currently shows a "thank you" message on submit but doesn't send the data anywhere. Connect it to a form backend (e.g. Formspree, Web3Forms, Make.com) by setting the `<form>`'s `action`/`method` and adapting the submit handler in `js/main.js`.
- **Email address** — `hello@aeroemotion.es` appears in the footer; update to your real inbox.
- **Brand name** — "AEROEMOTION" appears in the title, meta tags, navbar logo (×2), hero copy, Instagram handle, WhatsApp message and footer (`index.html`). Update all occurrences if the name changes.
