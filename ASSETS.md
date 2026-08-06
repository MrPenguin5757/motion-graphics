# Where to put your brand assets

Drop your files into these folders and they're ready to use. Anything under
`public/` is served to the ad by Remotion via `staticFile('...')`.

```
public/
  logo/        ← your Curb logo(s):  logo.svg / logo.png / logo-white.png
  screens/     ← real app screenshots: jobs.png, invoice.png, route.png, paid.png ...
  fonts/       ← brand font files:   Brand-Bold.woff2, Brand-Regular.woff2 ...
brand/         ← the design bible + any style references (PDF, images, notes).
                 Reference only — not shipped in the video. Used to pull the
                 real colors, fonts, and spacing into src/brand.ts.
```

## Naming — anything is fine, but these are easy to wire up
- **Logo:** `public/logo/logo.svg` (preferred) or `logo.png`. A white/mono
  version (`logo-white.svg`) helps on dark scenes.
- **Screenshots:** name them by what they show — `screens/jobs.png`,
  `screens/route.png`, `screens/invoice.png`, `screens/paid.png`. Full-resolution
  phone screenshots (PNG) are ideal.
- **Fonts:** `.woff2` or `.ttf`. Include every weight you use (e.g. Regular,
  Bold, Black). Licensed fonts are fine — they stay in your private repo.

## After you add them
Tell me they're in, and I'll:
1. Read the design bible from `brand/` and pull the real colors + fonts.
2. Point `src/brand.ts` → `logoSrc`, fonts, and colors at your real assets.
3. Swap the stylized phone mockup for your real screenshots in a device frame.

## How to get the folder into the repo (pick one)
- **Git:** copy your folder's contents into the matching folders above, then
  `git add . && git commit -m "Add brand assets" && git push`.
- **GitHub web:** open the repo → into `public/screens` (etc.) → **Add file →
  Upload files** → drag them in → commit.
- **Google Drive:** share the folder and I can pull the files in directly.
