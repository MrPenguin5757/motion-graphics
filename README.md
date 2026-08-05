# Curb — Motion Graphics Ads

Motion-graphics ad templates for **Curb**, the app that helps small service
businesses (lawncare, auto detailing, etc.) run their whole operation from a
phone — jobs, clients, routes, PDF estimates & invoices, and paid/unpaid tracking.

Two ways to use what's here:

1. **`preview/curb-ad.html`** — a self-contained animated ad you can open in any
   browser. No install. Great for quickly reacting to copy, colors, and pacing.
   Has a live **9:16 / 4:5 / 1:1** format toggle.
2. **Remotion project (`src/`)** — the same ad built to render real `.mp4` files
   for TikTok / Reels / Stories, Instagram / Facebook feed, and square.

---

## Quick start (render real videos)

**Requirements:** [Node.js](https://nodejs.org) 18+ (ffmpeg is bundled by Remotion).

```bash
npm install          # first time only
npm run studio       # opens the live preview studio in your browser
```

Render finished videos:

```bash
npm run render:9x16   # -> out/curb-9x16.mp4   (TikTok / Reels / Stories)
npm run render:4x5    # -> out/curb-4x5.mp4    (Instagram / Facebook feed)
npm run render:1x1    # -> out/curb-1x1.mp4    (square feed)
npm run render:all    # all three
```

---

## Making it on-brand

Everything you'd change lives in **`src/brand.ts`**:

| What | Where |
| --- | --- |
| Colors | `brand.colors` — swap `coral` for Curb's real accent, etc. |
| Copy (hook, features, CTA) | `brand.copy` |
| Logo | drop a file in `public/` and set `brand.logoSrc = '/logo.png'` |
| Fonts | add font files, reference them, update `brand.fonts` |
| Real app screenshots | add to `public/screens`, wire into the Phone component |
| Timing / scene lengths | `timeline.scenes` |

Send the design bible + logos + screenshots and these get filled in with the real thing.

---

## Structure

```
preview/curb-ad.html   # browser preview (no install)
src/
  brand.ts             # ← edit this: colors, copy, assets, timing
  CurbAd.tsx           # the ad composition (all 6 scenes)
  Root.tsx             # registers the 9:16 / 4:5 / 1:1 formats
  index.ts             # Remotion entry point
remotion.config.ts
```

The ad runs a real ad arc: hook → turn → logo reveal → in-app feature →
feature list → download CTA. All type is sized off a frame-relative unit so
every aspect ratio composes correctly.
