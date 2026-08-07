// Builds every preview/*.src.html into preview/*.html by inlining the Bricolage
// Grotesque + Hanken Grotesk woff2 fonts as data URIs, so the previews render in
// Curb's real typefaces with no external font requests.
//
//   node scripts/build-preview.mjs
//
// Fonts live in public/fonts (from @fontsource). If they're missing, run:
//   npm i @fontsource-variable/bricolage-grotesque @fontsource/hanken-grotesk
// and copy the latin woff2 files into public/fonts with the names below.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const previewDir = join(root, 'preview');
const fontsDir = join(root, 'public', 'fonts');
const dataUri = (file) =>
  'data:font/woff2;base64,' + readFileSync(join(fontsDir, file)).toString('base64');

const FONTS = {
  FONT_BRICOLAGE: 'bricolage-grotesque-latin-wght-normal.woff2',
  FONT_HANKEN_400: 'hanken-grotesk-latin-400-normal.woff2',
  FONT_HANKEN_500: 'hanken-grotesk-latin-500-normal.woff2',
  FONT_HANKEN_700: 'hanken-grotesk-latin-700-normal.woff2',
};

const sources = readdirSync(previewDir).filter((f) => f.endsWith('.src.html'));
for (const src of sources) {
  let html = readFileSync(join(previewDir, src), 'utf8');
  for (const [token, file] of Object.entries(FONTS)) html = html.split(token).join(dataUri(file));
  const out = src.replace(/\.src\.html$/, '.html');
  writeFileSync(join(previewDir, out), html);
  console.log(`Built preview/${out} with embedded fonts.`);
}
