import React from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/fonts';

const BRIC = 'Bricolage Grotesque';
const HANK = 'Hanken Grotesk';
const fh = delayRender('tiproute-fonts');
Promise.all([
  loadFont({family: BRIC, url: staticFile('fonts/bricolage-grotesque-latin-wght-normal.woff2'), weight: '400 800'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-400-normal.woff2'), weight: '400'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-700-normal.woff2'), weight: '700'}),
]).then(() => continueRender(fh)).catch(() => continueRender(fh));

const C = {
  sand: '#F4EFE4', concrete: '#FBF8F1', pebble: '#ECE6D8', ink: '#211E1A',
  asphalt: '#1D1A16', asphalt2: '#26221C', curb: '#D75F1F', curbDk: '#E56A25',
  lawn: '#3C7A59', sky: '#2F6FB0', gravel: '#7A7264', gravelDk: '#BDB4A4', danger: '#C4362A',
};

export const FPS = 30;
export const DURATION = 432;
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// six real stops; "booked" is the order they called, "prox" groups by street
type Stop = {id: number; name: string; svc: string; addr: string; grp: 'A' | 'R' | 'M'};
const STOPS: Stop[] = [
  {id: 0, name: 'Marcus Webb', svc: 'Auto Detail', addr: '412 Ashwood Dr', grp: 'A'},
  {id: 1, name: 'The Hollises', svc: 'Window Wash', addr: '88 Ridgeline', grp: 'R'},
  {id: 2, name: 'Dana Pruitt', svc: 'Gutter Clean', addr: '401 Ashwood Dr', grp: 'A'},
  {id: 3, name: 'Reyna Ortiz', svc: 'Auto Detail', addr: '15 Marsh Rd', grp: 'M'},
  {id: 4, name: 'Jordan Vance', svc: 'Pressure Wash', addr: '92 Ridgeline', grp: 'R'},
  {id: 5, name: 'Tovah Klein', svc: 'Lawn Care', addr: '30 Marsh Rd', grp: 'M'},
];
const BOOKED = [0, 1, 2, 3, 4, 5];
const PROX = [0, 2, 1, 4, 3, 5];
const GRP_COLOR: Record<string, string> = {A: C.curb, R: C.sky, M: C.lawn};

const REORDER = 150;

const CAPTIONS: {t: string; a: number; b: number}[] = [
  {t: 'Six stops, in the order they called.', a: 26, b: 92},
  {t: 'Ashwood, cross town, back to Ashwood.', a: 96, b: 148},
  {t: 'Curb reorders them by what is closest.', a: 156, b: 220},
  {t: 'Same day. Way less crossing town.', a: 232, b: 300},
];

const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};

/* ---------- app pieces ---------- */
const Mark: React.FC<{size: number; bg?: boolean}> = ({size, bg = true}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.24, background: bg ? C.curb : 'transparent', display: 'grid', placeItems: 'center'}}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 56 56">
      <path d="M38 16 C30 16 22 20 22 26 L22 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M22 33 L39 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

const CaptionPill: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const active = CAPTIONS.find((c) => frame >= c.a && frame < c.b);
  if (!active) return null;
  const inS = spring({frame: frame - active.a, fps, config: {damping: 16, mass: 0.7}});
  const outS = interpolate(frame, [active.b - 8, active.b], [1, 0], CL);
  const o = Math.min(inS, 1) * outS;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 27 * u, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - Math.min(inS, 1)) * 22}px)`}}>
      <div style={{background: C.asphalt, color: C.sand, fontFamily: BRIC, fontWeight: 800, fontSize: 4.2 * u, letterSpacing: '-0.02em', padding: `${1.6 * u}px ${3 * u}px`, borderRadius: 3 * u, boxShadow: `0 ${1 * u}px ${3 * u}px rgba(0,0,0,.35)`, maxWidth: '88%', textAlign: 'center'}}>{active.t}</div>
    </div>
  );
};

const StopCard: React.FC<{u: number; stop: Stop; rowH: number}> = ({u, stop, rowH}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = BOOKED.indexOf(stop.id);
  const to = PROX.indexOf(stop.id);
  const drop = spring({frame: frame - (8 + from * 3), fps, config: {damping: 13, mass: 0.7}});
  const move = spring({frame: frame - (REORDER + to * 4), fps, config: {damping: 15, mass: 0.9}});
  const y = interpolate(move, [0, 1], [from * rowH, to * rowH]);
  const num = frame < REORDER + 12 ? from + 1 : to + 1;
  const pop = 1 + 0.16 * Math.max(0, 1 - Math.abs(frame - (REORDER + to * 4 + 8)) / 8);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, height: rowH - 3 * u, opacity: Math.min(drop, 1), transform: `translateX(${(1 - Math.min(drop, 1)) * 30}px) scale(${pop})`, transformOrigin: 'center', background: C.concrete, borderRadius: 2.4 * u, display: 'flex', alignItems: 'center', overflow: 'hidden', boxShadow: `0 ${0.4 * u}px ${1.4 * u}px rgba(33,30,26,.08)`}}>
      <div style={{width: 1.1 * u, alignSelf: 'stretch', background: GRP_COLOR[stop.grp]}} />
      <div style={{width: 5.4 * u, height: 5.4 * u, margin: `0 ${2 * u}px`, borderRadius: '50%', background: frame < REORDER + 12 ? C.gravel : C.curb, color: '#fff', fontFamily: BRIC, fontWeight: 800, fontSize: 2.9 * u, display: 'grid', placeItems: 'center', flexShrink: 0}}>{num}</div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.4 * u, letterSpacing: '-0.02em', color: C.ink}}>{stop.name}</div>
        <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 2.3 * u, color: C.gravel}}>{stop.svc} · <span style={{color: GRP_COLOR[stop.grp], fontWeight: 700}}>{stop.addr}</span></div>
      </div>
      <div style={{color: C.gravelDk, fontSize: 3.4 * u, letterSpacing: '0.1em', marginRight: 2.4 * u, lineHeight: 0.6}}>⠿</div>
    </div>
  );
};

/* ---------- end card ---------- */
const EndCard: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: frame - 320, fps, config: {damping: 20, mass: 0.9}});
  if (frame < 316) return null;
  const line = interpolate(frame, [336, 352], [0, 1], CL);
  const link = interpolate(frame, [350, 366], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: C.asphalt, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 * u, transform: `translateY(${(1 - Math.min(rise, 1)) * 100}%)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 2 * u}}>
        <Mark size={11 * u} />
        <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 10 * u, letterSpacing: '-0.03em', color: C.sand}}>Curb</span>
      </div>
      <div style={{opacity: line, transform: `translateY(${(1 - line) * 16}px)`, fontFamily: BRIC, fontWeight: 800, fontSize: 5.2 * u, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.sand, textAlign: 'center', maxWidth: '82%'}}>Curb orders your day.<br /><span style={{color: C.curbDk}}>You just drive it.</span></div>
      <div style={{opacity: link, transform: `translateY(${(1 - link) * 14}px)`, fontFamily: HANK, fontWeight: 700, letterSpacing: '0.05em', color: C.gravelDk, fontSize: 3 * u, marginTop: 1 * u}}>getcurb.net · Link in bio</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const CurbTipRoute: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rowH = 20 * u;
  const badge = interpolate(frame, [186, 202], [0, 1], CL);
  // Start route press (real: one tap opens your nav app, shown by the label below)
  const pressed = frame >= 300 ? 1 - Math.max(0, 1 - Math.abs(frame - 308) / 8) * 0.05 : 1;
  const mapDim = interpolate(frame, [306, 322], [0, 0.5], CL);
  return (
    <AbsoluteFill style={{background: C.concrete}}>
      {/* app top bar */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 15 * u, background: C.asphalt, display: 'flex', alignItems: 'flex-end', gap: 1.6 * u, padding: `0 ${4 * u}px ${1.8 * u}px`}}>
        <Mark size={5 * u} />
        <div style={{lineHeight: 1}}>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.6 * u, color: C.sand, letterSpacing: '-0.02em'}}>Route</div>
          <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 2.1 * u, color: C.gravelDk}}>6 stops · today</div>
        </div>
        <div style={{flex: 1}} />
        <div style={{alignSelf: 'center', marginBottom: -0.4 * u, background: C.lawn, color: '#fff', fontFamily: HANK, fontWeight: 700, fontSize: 2.3 * u, padding: `${0.8 * u}px ${1.8 * u}px`, borderRadius: 99, opacity: badge, transform: `translateY(${(1 - badge) * -8}px)`}}>Ordered by proximity</div>
      </div>

      {/* stop list */}
      <div style={{position: 'absolute', top: 18 * u, left: 4 * u, right: 4 * u, height: 6 * rowH}}>
        {STOPS.map((s) => <StopCard key={s.id} u={u} stop={s} rowH={rowH} />)}
      </div>

      {/* caption */}
      <CaptionPill u={u} />

      {/* bottom bar: Start route -> opens your maps */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 24 * u, background: C.sand, borderTop: `1px solid rgba(33,30,26,.08)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.6 * u, padding: `0 ${4 * u}px`}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 1.4 * u, fontFamily: HANK, fontWeight: 600, fontSize: 2.4 * u, color: C.gravel}}>
          Opens in <span style={{color: C.ink, fontWeight: 700}}>Apple Maps</span> · Google · Waze
        </div>
        <div style={{background: C.curb, color: '#fff', textAlign: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: 3.8 * u, padding: `${1.9 * u}px 0`, borderRadius: 2.4 * u, transform: `scale(${pressed})`, boxShadow: `0 0 ${2 * u}px rgba(215,95,31,.3)`}}>Start route</div>
      </div>

      {/* dim + end card */}
      <AbsoluteFill style={{background: '#000', opacity: mapDim, pointerEvents: 'none'}} />
      <EndCard u={u} />
    </AbsoluteFill>
  );
};
