# Curb — Motion Graphics Ads

Motion-graphics ad for **Curb**, the app that helps small service businesses
(lawncare, auto detailing, pressure washing, etc.) run their whole operation from
a phone — jobs, clients, routes, PDF estimates & invoices, and who's-paid tracking.

Two ways to use what's here:

1. **`preview/curb-ad.html`** — a self-contained animated ad you can open in any
   browser. No install. Real Curb fonts are embedded. Great for reacting to copy,
   colors, and pacing, with a live **9:16 / 4:5 / 1:1** format toggle.
2. **Remotion project (`src/`)** — the same ad, built to render real `.mp4` files
   for TikTok / Reels / Stories, Instagram / Facebook feed, and square.

The ad arc: **hook** (sticky notes / group texts / your memory?) → **turn** (one
app runs the whole day) → **Meet Curb** (the logo draws itself as a route) →
**home screen** with counting numbers → **get-paid features** → **Curb vs the
competition** → **endcard** (price, App Store, getcurb.net).

---

## Render real videos

**Requirements:** [Node.js](https://nodejs.org) 18+ (ffmpeg is bundled by Remotion).

```bash
npm install          # first time only
npm run studio       # live Remotion preview in your browser
```

Render finished videos:

```bash
npm run render:9x16   # -> out/curb-9x16.mp4   (TikTok / Reels / Stories)
npm run render:4x5    # -> out/curb-4x5.mp4    (Instagram / Facebook feed)
npm run render:1x1    # -> out/curb-1x1.mp4    (square feed)
npm run render:all    # all three
```

## Rebuild the browser preview

`preview/curb-ad.html` is generated from `preview/curb-ad.src.html` with the
Bricolage + Hanken fonts inlined as data URIs (so it renders on-brand anywhere):

```bash
npm run build:preview   # writes preview/curb-ad.html from the .src.html + public/fonts
```

---

## Making it on-brand

Most edits live in **`src/brand.ts`** (read by both the Remotion render and,
after `npm run build:preview`, the browser preview):

| What | Where |
| --- | --- |
| Copy (hook, turn, features, CTA) | `brand.copy` |
| Colors | `brand.colors` (full palette also mirrored in `src/CurbAd.tsx`) |
| Comparison rows (Curb vs Jobber/HCP/Yardbook) | `CMP_ROWS` in `src/CurbAd.tsx` |
| Scene lengths / pacing | `SCENES` (frames) in `src/CurbAd.tsx` |
| Fonts | `public/fonts/*.woff2` (Bricolage + Hanken from @fontsource) |
| Logo mark | the exact SVG in `src/CurbAd.tsx` `<Mark>` (spec: `brand/Curb-Logo-Spec.pdf`) |

Brand reference: `brand/Curb-Logo-Spec.pdf` and the color/type rules from the
Curb Design Bible. Full product feature list: `docs/curb-features.md`.

---

## Structure

```
preview/
  curb-ad.src.html     # editable source of the browser preview
  curb-ad.html         # generated (fonts inlined) — the one you open/share
src/
  brand.ts             # colors, copy, timing config
  CurbAd.tsx           # the Remotion composition (7 scenes, transitions, logo draw)
  Root.tsx             # registers the 9:16 / 4:5 / 1:1 formats
  index.ts             # Remotion entry point
scripts/build-preview.mjs   # inlines fonts into the browser preview
public/fonts/          # Bricolage Grotesque + Hanken Grotesk (woff2)
brand/                 # Curb-Logo-Spec.pdf + brand assets
docs/curb-features.md  # full product feature list
remotion.config.ts
```
