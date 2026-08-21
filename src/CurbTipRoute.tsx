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
  lawn: '#3C7A59', lawnSoft: '#CBD9C7', gravel: '#7A7264', gravelDk: '#BDB4A4', danger: '#C4362A',
};

export const FPS = 30;
export const DURATION = 432;
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// eight stops laid out as a loop; connecting them in order is clean,
// the booking order criss-crosses
const PTS = [
  [32, 24], [64, 18], [84, 42], [88, 74], [70, 100], [42, 108], [18, 82], [16, 48],
];
const OPTIMAL = [0, 1, 2, 3, 4, 5, 6, 7];
const CHAOTIC = [0, 4, 7, 2, 5, 1, 6, 3];
const posIn = (order: number[], pi: number) => order.indexOf(pi);
const pathOf = (order: number[]) => 'M ' + order.map((pi) => `${PTS[pi][0]} ${PTS[pi][1]}`).join(' L ');

const fmtMin = (m: number) => `${Math.floor(m / 60)}:${String(Math.round(m % 60)).padStart(2, '0')}`;

/* ---------- the live map ---------- */
const RouteMap: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const chaoticDraw = interpolate(frame, [26, 62], [1, 0], CL); // dashoffset 1->0
  const chaoticFade = interpolate(frame, [150, 172], [1, 0], CL);
  const optimalDraw = interpolate(frame, [162, 202], [1, 0], CL);
  const optimalOpacity = interpolate(frame, [160, 172], [0, 1], CL);
  const reordered = frame >= 170;
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 124" preserveAspectRatio="xMidYMid slice" style={{display: 'block'}}>
      <rect x="0" y="0" width="100" height="124" fill={C.concrete} />
      {/* soft blocks */}
      {[[6, 30, 22, 20], [58, 8, 30, 18], [66, 52, 26, 26], [10, 92, 30, 22]].map((b, i) => (
        <rect key={i} x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx="3" fill={C.lawnSoft} opacity={0.55} />
      ))}
      {/* roads */}
      {[16, 40, 64, 88].map((y) => <rect key={'h' + y} x="0" y={y} width="100" height="3.2" fill={C.pebble} />)}
      {[22, 50, 78].map((x) => <rect key={'v' + x} x={x} y="0" width="3.2" height="124" fill={C.pebble} />)}
      {/* chaotic route (bad = red) */}
      <path d={pathOf(CHAOTIC)} fill="none" stroke={C.danger} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={chaoticDraw} opacity={0.85 * chaoticFade} />
      {/* optimal route (good = orange) */}
      <path d={pathOf(OPTIMAL)} fill="none" stroke={C.curb} strokeWidth={1.7} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={optimalDraw} opacity={optimalOpacity} />
      {/* pins */}
      {PTS.map((p, pi) => {
        const drop = spring({frame: frame - (8 + pi * 3), fps, config: {damping: 12, mass: 0.6}});
        const num = (reordered ? posIn(OPTIMAL, pi) : posIn(CHAOTIC, pi)) + 1;
        const pop = 1 + 0.4 * Math.max(0, 1 - Math.abs(frame - 176) / 7);
        const s = Math.min(drop, 1) * pop;
        return (
          <g key={pi} transform={`translate(${p[0]} ${p[1]}) scale(${s}) translate(${-p[0]} ${-p[1]})`} opacity={drop > 0.02 ? 1 : 0}>
            <circle cx={p[0]} cy={p[1]} r="4.6" fill={reordered ? C.curb : C.asphalt} />
            <text x={p[0]} y={p[1] + 1.5} textAnchor="middle" fontFamily={BRIC} fontWeight={800} fontSize="4.6" fill="#fff">{num}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* ---------- caption pill ---------- */
const CAPTIONS: {t: string; a: number; b: number}[] = [
  {t: 'Booked in the order they called.', a: 30, b: 96},
  {t: 'So you criss-cross town all day.', a: 100, b: 150},
  {t: 'One tap. Curb reorders the day.', a: 158, b: 220},
  {t: 'Same 8 yards. An hour less driving.', a: 228, b: 300},
];
const CaptionPill: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const active = CAPTIONS.find((c) => frame >= c.a && frame < c.b);
  if (!active) return null;
  const inS = spring({frame: frame - active.a, fps, config: {damping: 16, mass: 0.7}});
  const outS = interpolate(frame, [active.b - 8, active.b], [1, 0], CL);
  const o = Math.min(inS, 1) * outS;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 26 * u, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - Math.min(inS, 1)) * 22}px)`}}>
      <div style={{background: C.asphalt, color: C.sand, fontFamily: BRIC, fontWeight: 800, fontSize: 4.4 * u, letterSpacing: '-0.02em', padding: `${1.6 * u}px ${3 * u}px`, borderRadius: 3 * u, boxShadow: `0 ${1 * u}px ${3 * u}px rgba(0,0,0,.35)`, maxWidth: '86%', textAlign: 'center'}}>{active.t}</div>
    </div>
  );
};

/* ---------- app chrome ---------- */
const Mark: React.FC<{size: number; bg?: boolean}> = ({size, bg = true}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.24, background: bg ? C.curb : 'transparent', display: 'grid', placeItems: 'center'}}>
    <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 56 56">
      <path d="M38 16 C30 16 22 20 22 26 L22 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M22 33 L39 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
    </svg>
  </div>
);

const StatDrop: React.FC<{u: number; label: string; value: string}> = ({u, label, value}) => (
  <div style={{flex: 1, textAlign: 'center'}}>
    <b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 5.4 * u, letterSpacing: '-0.03em', color: C.ink}}>{value}</b>
    <span style={{fontFamily: HANK, fontSize: 2.2 * u, color: C.gravel, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{label}</span>
  </div>
);

/* ---------- soft CTA ---------- */
const EndCard: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rise = spring({frame: frame - 316, fps, config: {damping: 20, mass: 0.9}});
  if (frame < 312) return null;
  const line = interpolate(frame, [332, 348], [0, 1], CL);
  const link = interpolate(frame, [346, 362], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: C.asphalt, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 * u, transform: `translateY(${(1 - Math.min(rise, 1)) * 100}%)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 2 * u}}>
        <Mark size={11 * u} />
        <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 10 * u, letterSpacing: '-0.03em', color: C.sand}}>Curb</span>
      </div>
      <div style={{opacity: line, transform: `translateY(${(1 - line) * 16}px)`, fontFamily: BRIC, fontWeight: 800, fontSize: 5.2 * u, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.sand, textAlign: 'center', maxWidth: '80%'}}>It builds the route.<br /><span style={{color: C.curbDk}}>You just drive it.</span></div>
      <div style={{opacity: link, transform: `translateY(${(1 - link) * 14}px)`, fontFamily: HANK, fontWeight: 700, letterSpacing: '0.05em', color: C.gravelDk, fontSize: 3 * u, marginTop: 1 * u}}>getcurb.net · Link in bio</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const CurbTipRoute: React.FC = () => {
  const {width, height} = useVideoConfig();
  const u = Math.min(width, height) / 100;
  const frame = useCurrentFrame();
  const miles = interpolate(frame, [162, 204], [27.3, 16.4], CL);
  const drive = interpolate(frame, [162, 204], [260, 155], CL);
  const saved = interpolate(frame, [206, 224], [0, 1], CL);
  const startPulse = 0.5 + 0.5 * Math.sin(frame / 8);
  const mapDim = interpolate(frame, [300, 316], [0, 0.5], CL);
  return (
    <AbsoluteFill style={{background: C.concrete}}>
      {/* app top bar */}
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 15 * u, background: C.asphalt, display: 'flex', alignItems: 'flex-end', gap: 1.6 * u, padding: `0 ${4 * u}px ${1.8 * u}px`}}>
        <Mark size={5 * u} />
        <div style={{lineHeight: 1}}>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.6 * u, color: C.sand, letterSpacing: '-0.02em'}}>Route</div>
          <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 2.1 * u, color: C.gravelDk}}>8 stops · today</div>
        </div>
      </div>
      {/* map */}
      <div style={{position: 'absolute', top: 15 * u, left: 0, right: 0, bottom: 24 * u, overflow: 'hidden'}}>
        <RouteMap />
      </div>
      {/* saved chip */}
      <div style={{position: 'absolute', top: 18.5 * u, right: 4 * u, background: C.lawn, color: '#fff', fontFamily: HANK, fontWeight: 700, fontSize: 2.7 * u, padding: `${1 * u}px ${2 * u}px`, borderRadius: 99, opacity: saved, transform: `translateY(${(1 - saved) * -10}px)`}}>▼ 1h 45m saved</div>
      {/* caption */}
      <CaptionPill u={u} />
      {/* bottom stats bar */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 24 * u, background: C.sand, borderTop: `1px solid rgba(33,30,26,.08)`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.8 * u, padding: `0 ${4 * u}px`}}>
        <div style={{display: 'flex'}}>
          <StatDrop u={u} label="stops" value="8" />
          <StatDrop u={u} label="miles" value={miles.toFixed(1)} />
          <StatDrop u={u} label="drive" value={fmtMin(drive)} />
        </div>
        <div style={{background: C.curb, color: '#fff', textAlign: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: 3.6 * u, padding: `${1.8 * u}px 0`, borderRadius: 2.4 * u, boxShadow: `0 0 ${2 * u}px rgba(215,95,31,${0.25 + 0.25 * startPulse})`}}>Start route</div>
      </div>
      {/* dim + end card */}
      <AbsoluteFill style={{background: '#000', opacity: mapDim, pointerEvents: 'none'}} />
      <EndCard u={u} />
    </AbsoluteFill>
  );
};
