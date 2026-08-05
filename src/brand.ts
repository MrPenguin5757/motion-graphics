/**
 * Curb — brand + ad configuration
 * ---------------------------------
 * This is the ONE file to edit to make the ad on-brand.
 * Change colors, copy, and asset paths here; the composition reads from it.
 *
 * When you send the design bible + assets, we update:
 *   - colors        -> your real brand hex values
 *   - fonts         -> drop font files in /public/fonts and reference them
 *   - logoSrc       -> your real logo (PNG/SVG) in /public
 *   - screenshots   -> real app screenshots in /public/screens
 */

export const brand = {
  colors: {
    ink: '#0C0A14',
    ink2: '#151223',
    coral: '#FF5A3C', // primary accent — swap for Curb's brand color
    amber: '#FFB23E',
    paper: '#F7F3EC',
    mint: '#38E0B0',
    muted: '#8A83A6',
  },

  // System stack now; replace with your brand face once you send the font file.
  fonts: {
    display: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  },

  // null = use the built-in text wordmark "CURB". Set to '/logo.png' once provided.
  logoSrc: null as string | null,

  copy: {
    kicker: 'Lawncare · detailing · service pros',
    hook: ['Still running', 'your business off', 'sticky notes?'],
    turn: ['One app.', 'Whole operation.'],
    wordmark: 'CURB',
    tagline: 'Run your business from your phone',
    feature1Heading: 'Your whole day, sorted',
    feature1Chip: 'Jobs, clients & routes — all in one place',
    feature2Heading: 'Get paid, not buried',
    feature2Chips: [
      'PDF estimates & invoices in seconds',
      "See who's paid — and who hasn't",
      'Smart routes between every stop',
    ],
    ctaLine1: 'Get',
    ctaLine2: 'Curb',
    ctaSub: 'Run your whole operation from your pocket. Free on iOS & Android.',
  },
} as const;

// Timeline in seconds; the composition converts to frames at 30fps.
export const timeline = {
  fps: 30,
  scenes: [
    { name: 'hook', dur: 3.0 },
    { name: 'turn', dur: 1.9 },
    { name: 'logo', dur: 2.4 },
    { name: 'feature1', dur: 2.6 },
    { name: 'feature2', dur: 2.7 },
    { name: 'cta', dur: 3.0 },
  ],
} as const;

export const totalSeconds = timeline.scenes.reduce((a, s) => a + s.dur, 0);
