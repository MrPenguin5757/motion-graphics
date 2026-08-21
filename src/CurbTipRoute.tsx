import React from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Easing,
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
export const DURATION = 430;
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

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
const PROX = [0, 2, 1, 4, 3, 5]; // grouped by street = a clean loop on the map
const GRP_COLOR: Record<string, string> = {A: C.curb, R: C.sky, M: C.lawn};
// pins indexed by stop id; same-street stops sit near each other
const PINS: [number, number, string][] = [
  [30, 38, 'A'], [76, 58, 'R'], [46, 44, 'A'], [56, 150, 'M'], [82, 84, 'R'], [30, 132, 'M'],
];
const MESSY = [0, 4, 1, 5, 2, 3]; // booked order: crosses all over

const CAPTIONS: {t: string; a: number; b: number}[] = [
  {t: 'Six stops, all over town.', a: 14, b: 52},
  {t: 'One truck, criss-crossing all day.', a: 58, b: 98},
  {t: 'Curb orders them by what is closest.', a: 128, b: 192},
  {t: 'Same six stops. One clean loop.', a: 232, b: 298},
];

const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};

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
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 20 * u, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - Math.min(inS, 1)) * 22}px)`, zIndex: 40}}>
      <div style={{background: C.asphalt, color: C.sand, fontFamily: BRIC, fontWeight: 800, fontSize: 4.2 * u, letterSpacing: '-0.02em', padding: `${1.6 * u}px ${3 * u}px`, borderRadius: 3 * u, boxShadow: `0 ${1 * u}px ${3 * u}px rgba(0,0,0,.35)`, maxWidth: '88%', textAlign: 'center'}}>{active.t}</div>
    </div>
  );
};

/* ---------- a map with a truck tracing a route ---------- */
const MapScene: React.FC<{order: number[]; trailColor: string; carStart: number; carEnd: number; pinStart: number}> = ({order, trailColor, carStart, carEnd, pinStart}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pts = order.map((i) => [PINS[i][0], PINS[i][1]] as [number, number]);
  const segs: {x0: number; y0: number; x1: number; y1: number; len: number; acc: number}[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    segs.push({x0, y0, x1, y1, len, acc: total});
    total += len;
  }
  const carP = interpolate(frame, [carStart, carEnd], [0, 1], CL);
  const dist = carP * total;
  let cx = pts[0][0];
  let cy = pts[0][1];
  let ang = 0;
  for (const s of segs) {
    if (dist <= s.acc + s.len || s === segs[segs.length - 1]) {
      const t = Math.min(1, Math.max(0, (dist - s.acc) / s.len));
      cx = s.x0 + (s.x1 - s.x0) * t;
      cy = s.y0 + (s.y1 - s.y0) * t;
      ang = (Math.atan2(s.y1 - s.y0, s.x1 - s.x0) * 180) / Math.PI;
      break;
    }
  }
  const d = 'M ' + pts.map((p) => `${p[0]} ${p[1]}`).join(' L ');
  const carShow = interpolate(frame, [carStart - 4, carStart + 4], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: C.concrete}}>
      <svg width="100%" height="100%" viewBox="0 0 100 178" preserveAspectRatio="xMidYMid slice" style={{display: 'block'}}>
        <rect x="0" y="0" width="100" height="178" fill={C.concrete} />
        {[[6, 34, 24, 22], [58, 12, 30, 20], [66, 66, 28, 28], [10, 120, 32, 24], [54, 140, 34, 26]].map((b, i) => (
          <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="3" fill={'#CBD9C7'} opacity={0.5} />
        ))}
        {[20, 52, 88, 124, 158].map((y) => <rect key={'h' + y} x="0" y={y} width="100" height="3" fill={C.pebble} />)}
        {[24, 52, 80].map((x) => <rect key={'v' + x} x={x} y="0" width="3" height="178" fill={C.pebble} />)}
        <path d={d} fill="none" stroke={trailColor} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - carP} opacity={0.85} />
        {PINS.map((p, i) => {
          const drop = spring({frame: frame - (pinStart + i * 4), fps, config: {damping: 11, mass: 0.6}});
          const pulse = 1 + 0.05 * Math.sin(frame / 9 + i);
          const s = Math.min(drop, 1) * pulse;
          return (
            <g key={i} transform={`translate(${p[0]} ${p[1]})`} opacity={drop > 0.02 ? 1 : 0}>
              <circle cx="0" cy="0" r={6} fill={GRP_COLOR[p[2]]} opacity={0.13 * Math.min(drop, 1)} />
              <g transform={`translate(0 ${(1 - Math.min(drop, 1)) * -6}) scale(${s})`} style={{transformOrigin: 'center'}}>
                <circle cx="0" cy="0" r={3.4} fill={GRP_COLOR[p[2]]} />
                <circle cx="0" cy="0" r={1.3} fill="#fff" />
              </g>
            </g>
          );
        })}
        {carShow > 0.01 && (
          <g transform={`translate(${cx} ${cy}) rotate(${ang})`} opacity={carShow}>
            <ellipse cx="0.6" cy="1" rx="4.6" ry="2.7" fill="rgba(0,0,0,0.16)" />
            <rect x="-3.8" y="-2.2" width="7.6" height="4.4" rx="1.6" fill={C.asphalt} />
            <rect x="-0.8" y="-1.6" width="3" height="3.2" rx="0.8" fill={C.curbDk} />
            <circle cx="3.1" cy="0" r="0.75" fill={C.sand} />
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- the real list ---------- */
const LIST_IN = 116;
const REORDER = 152;
const StopCard: React.FC<{u: number; stop: Stop; rowH: number}> = ({u, stop, rowH}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const from = BOOKED.indexOf(stop.id);
  const to = PROX.indexOf(stop.id);
  const drop = spring({frame: frame - (LIST_IN + 4 + from * 3), fps, config: {damping: 14, mass: 0.7}});
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

const ListScene: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const rowH = 20 * u;
  const badge = interpolate(frame, [188, 204], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: C.concrete}}>
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 15 * u, background: C.asphalt, display: 'flex', alignItems: 'flex-end', gap: 1.6 * u, padding: `0 ${4 * u}px ${1.8 * u}px`}}>
        <Mark size={5 * u} />
        <div style={{lineHeight: 1}}>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.6 * u, color: C.sand, letterSpacing: '-0.02em'}}>Route</div>
          <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 2.1 * u, color: C.gravelDk}}>6 stops · today</div>
        </div>
        <div style={{flex: 1}} />
        <div style={{alignSelf: 'center', marginBottom: -0.4 * u, background: C.lawn, color: '#fff', fontFamily: HANK, fontWeight: 700, fontSize: 2.3 * u, padding: `${0.8 * u}px ${1.8 * u}px`, borderRadius: 99, opacity: badge, transform: `translateY(${(1 - badge) * -8}px)`}}>Ordered by proximity</div>
      </div>
      <div style={{position: 'absolute', top: 18 * u, left: 4 * u, right: 4 * u, height: 6 * rowH}}>
        {STOPS.map((s) => <StopCard key={s.id} u={u} stop={s} rowH={rowH} />)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 24 * u, background: C.sand, borderTop: `1px solid rgba(33,30,26,.08)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.6 * u, padding: `0 ${4 * u}px`}}>
        <div style={{display: 'flex', justifyContent: 'center', gap: 1.4 * u, fontFamily: HANK, fontWeight: 600, fontSize: 2.4 * u, color: C.gravel}}>
          Opens in <span style={{color: C.ink, fontWeight: 700}}>Apple Maps</span> · Google · Waze
        </div>
        <div style={{background: C.curb, color: '#fff', textAlign: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: 3.8 * u, padding: `${1.9 * u}px 0`, borderRadius: 2.4 * u, boxShadow: `0 0 ${2 * u}px rgba(215,95,31,.3)`}}>Start route</div>
      </div>
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: frame - 322, fps, config: {damping: 20, mass: 0.9}});
  if (frame < 318) return null;
  const line = interpolate(frame, [338, 354], [0, 1], CL);
  const link = interpolate(frame, [352, 368], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: C.asphalt, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 * u, transform: `translateY(${(1 - Math.min(rise, 1)) * 100}%)`, zIndex: 50}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 2 * u}}>
        <Mark size={11 * u} />
        <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 10 * u, letterSpacing: '-0.03em', color: C.sand}}>Curb</span>
      </div>
      <div style={{opacity: line, transform: `translateY(${(1 - line) * 16}px)`, fontFamily: BRIC, fontWeight: 800, fontSize: 5.2 * u, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.sand, textAlign: 'center', maxWidth: '82%'}}>Curb orders your day.<br /><span style={{color: C.curbDk}}>You just drive it.</span></div>
      <div style={{opacity: link, transform: `translateY(${(1 - link) * 14}px)`, fontFamily: HANK, fontWeight: 700, letterSpacing: '0.05em', color: C.gravelDk, fontSize: 3 * u, marginTop: 1 * u}}>getcurb.net · Link in bio</div>
    </AbsoluteFill>
  );
};

/* ---------- conveyor: messy map -> list -> clean map -> logo ---------- */
export const CurbTipRoute: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  // progress moves the three full-screen panels up like a conveyor
  const progress = interpolate(frame, [100, 116, 196, 212], [0, 1, 1, 2], {...CL, easing: Easing.inOut(Easing.cubic)});
  const panelY = (i: number) => (i - progress) * 100;
  return (
    <AbsoluteFill style={{background: C.asphalt}}>
      <AbsoluteFill style={{transform: `translateY(${panelY(0)}%)`}}>
        <MapScene order={MESSY} trailColor={C.danger} carStart={40} carEnd={96} pinStart={8} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateY(${panelY(1)}%)`}}>
        <ListScene u={u} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateY(${panelY(2)}%)`}}>
        <MapScene order={PROX} trailColor={C.curb} carStart={224} carEnd={286} pinStart={206} />
      </AbsoluteFill>
      <CaptionPill u={u} />
      <EndCard u={u} />
    </AbsoluteFill>
  );
};
