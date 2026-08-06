/**
 * Curb — brand + ad configuration
 * ---------------------------------
 * Values below come straight from the Curb Design System & Color Bible v1.0.
 * This is the ONE file to edit to tune the ad. The composition reads from it.
 *
 * Assets you drop into the repo (see ASSETS.md):
 *   public/logo/     -> logoSrc points here
 *   public/screens/  -> screenshots used in the phone frames
 *   public/fonts/    -> not needed; fonts load from Google Fonts at render time
 */

export const brand = {
  // From the Color Bible. Keys kept stable so the composition wires straight in.
  colors: {
    ink: '#1D1A16', // Asphalt — dark ground / dark text on light scenes
    ink2: '#26221C', // Asphalt Mid — device body / dark card surface
    coral: '#D75F1F', // Curb Orange — primary action / brand accent
    coralPress: '#BF5316', // pressed accent
    amber: '#F3A847', // Marigold — recurring / secondary accent
    paper: '#F4EFE4', // Sand — light ground
    concrete: '#FBF8F1', // card surface (light)
    mint: '#3C7A59', // Lawn — paid / success
    sky: '#2F6FB0', // Sky — en route / info
    muted: '#7A7264', // Gravel — secondary text / labels
  },

  // Curb's brand typefaces. In Remotion these load via @remotion/google-fonts.
  fonts: {
    display: "'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  },

  // Set to your logo once it's in public/logo (e.g. '/logo/curb-logo-standalone.png').
  // null = render the "CURB" text wordmark in brand type.
  logoSrc: null as string | null,

  // Voice: Direct · Field-ready · No subscription bullshit.
  copy: {
    kicker: 'Lawncare · detailing · pressure washing',
    hook: ['Running the day off', 'texts, notes', 'and memory?'],
    turn: ['One app runs', 'the whole job.'],
    wordmark: 'CURB',
    tagline: 'Field service, handled.',
    feature1Heading: 'Every job in one place',
    feature1Chip: 'Jobs, clients, routes & money — one app',
    feature2Heading: 'Get paid, skip the busywork',
    feature2Chips: [
      'PDF estimates & invoices in seconds',
      "Always know who's paid",
      'No monthly subscription',
    ],
    ctaLine1: 'Get',
    ctaLine2: 'Curb',
    ctaSub: 'Run the whole operation from your pocket. Free on iOS & Android — no subscription.',
  },
} as const;

// Timeline in seconds; converted to frames at 30fps by the composition.
export const timeline = {
  fps: 30,
  scenes: [
    { name: 'hook', dur: 3.0 },
    { name: 'turn', dur: 1.9 },
    { name: 'logo', dur: 2.4 },
    { name: 'feature1', dur: 2.6 },
    { name: 'feature2', dur: 2.8 },
    { name: 'cta', dur: 3.0 },
  ],
} as const;

export const totalSeconds = timeline.scenes.reduce((a, s) => a + s.dur, 0);
