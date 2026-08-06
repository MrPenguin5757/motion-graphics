// Builds preview/curb-ad.html from preview/curb-ad.src.html by inlining the
// Bricolage Grotesque + Hanken Grotesk woff2 fonts as data URIs, so the preview
// renders in Curb's real typefaces with no external font requests.
//
//   node scripts/build-preview.mjs
//
// Fonts live in public/fonts (from @fontsource). If they're missing, run:
//   npm i @fontsource-variable/bricolage-grotesque @fontsource/hanken-grotesk
// and copy the latin woff2 files into public/fonts with the names below.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = join(root, 'public', 'fonts');
const dataUri = (file) =>
  'data:font/woff2;base64,' + readFileSync(join(fontsDir, file)).toString('base64');

let html = readFileSync(join(root, 'preview', 'curb-ad.src.html'), 'utf8');
html = html
  .replace('FONT_BRICOLAGE', dataUri('bricolage-grotesque-latin-wght-normal.woff2'))
  .replace('FONT_HANKEN_400', dataUri('hanken-grotesk-latin-400-normal.woff2'))
  .replace('FONT_HANKEN_500', dataUri('hanken-grotesk-latin-500-normal.woff2'))
  .replace('FONT_HANKEN_700', dataUri('hanken-grotesk-latin-700-normal.woff2'));

writeFileSync(join(root, 'preview', 'curb-ad.html'), html);
console.log('Built preview/curb-ad.html with embedded Bricolage + Hanken fonts.');
