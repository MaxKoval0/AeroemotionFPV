# Media — drop-in guide

The site already runs with elegant placeholder visuals (animated gradients).
To switch them for your own footage, add files with these **exact names** —
no code changes needed, they'll be picked up automatically.

## Video (`assets/video/`)

| File | Used for | Aspect | Suggested length | Notes |
|---|---|---|---|---|
| `hero-bg.mp4` + `hero-poster.jpg` | Hero background | 16:9 or wider, 1920×1080+ | 10–20s loop | Muted, no dialogue needed |
| `tier1.mp4` + `tier1-poster.jpg` | Laptop screen — Tier 01 Cinematic Flythrough | 16:9, 1920×1080 | 10–20s loop | A highlight cut from the full 60–90s film |
| `tier2.mp4` + `tier2-poster.jpg` | Laptop screen — Tier 02 / 03 Motion Edition | 16:9, 1920×1080 | 10–20s loop | Ideally the version with your motion graphics baked in |
| `tier3-reel.mp4` + `tier3-reel-poster.jpg` | Phone screen — Tier 03 Social Pack | 9:16, 1080×1920 | 10–15s loop | A vertical Reels/TikTok cut |

General tips:
- Export as `.mp4` (H.264), muted, and keep each file under ~8MB so the page stays fast.
- Posters are `.jpg` frame grabs shown before the video loads — pick a strong first frame.
- All videos autoplay muted and loop; if a file is missing, the animated gradient placeholder is shown instead, so the site always looks finished.

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
