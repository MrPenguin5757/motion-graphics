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
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {fade} from '@remotion/transitions/fade';
import {loadFont} from '@remotion/fonts';

const BRIC = 'Bricolage Grotesque';
const HANK = 'Hanken Grotesk';
const fh = delayRender('getpaid-fonts');
Promise.all([
  loadFont({family: BRIC, url: staticFile('fonts/bricolage-grotesque-latin-wght-normal.woff2'), weight: '400 800'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-400-normal.woff2'), weight: '400'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-700-normal.woff2'), weight: '700'}),
]).then(() => continueRender(fh)).catch(() => continueRender(fh));

const C = {
  sand: '#F4EFE4', concrete: '#FBF8F1', pebble: '#ECE6D8', ink: '#211E1A',
  asphalt: '#1D1A16', asphalt2: '#26221C', curb: '#D75F1F', curbDk: '#E56A25',
  marigold: '#F3A847', lawn: '#3C7A59', lawnDk: '#4E9670', sky: '#2F6FB0',
  gravel: '#7A7264', gravelDk: '#BDB4A4', red: '#D64B2E', danger: '#C4362A',
};

export const FPS = 30;
const TR = 12;
const SEQ = [120, 150, 210, 72, 120];
// four transitions between five scenes: three are TR frames, the Notes->Money
// hand-off is a longer 16-frame white fade
export const DURATION = SEQ.reduce((a, b) => a + b, 0) - (TR * 3 + 16);

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};
const useSpr = (delay = 0, damping = 200, mass = 1) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass}});
};

const Mark: React.FC<{size: number; draw?: boolean; delay?: number}> = ({size, draw = false, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d1 = draw ? 1 - spring({frame: frame - delay, fps, config: {damping: 200}}) : 0;
  const d2 = draw ? 1 - spring({frame: frame - delay - 11, fps, config: {damping: 200}}) : 0;
  const dot = draw ? spring({frame: frame - delay - 22, fps, config: {damping: 12, mass: 0.6}}) : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <rect width="56" height="56" rx="14" fill={C.curb} />
      <path d="M38 15 C29 15 21 20 21 26 L21 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={d1} />
      <path d="M21 33 L40 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d2} />
      <circle cx="40" cy="33" r="3.5" fill={C.sand} opacity={draw ? (dot > 0.01 ? 1 : 0) : 1} style={{transform: `scale(${dot})`, transformBox: 'fill-box', transformOrigin: 'center'}} />
    </svg>
  );
};

/* ---------- phone shell + curb app chrome ---------- */
const Phone: React.FC<{u: number; w: number; children: React.ReactNode}> = ({u, w, children}) => (
  <div style={{width: w * u, aspectRatio: '9 / 19', background: '#000', borderRadius: 5 * u, padding: 1.3 * u, boxShadow: `0 ${3 * u}px ${8 * u}px rgba(0,0,0,.5)`}}>
    <div style={{width: '100%', height: '100%', borderRadius: 3.9 * u, overflow: 'hidden', background: C.sand, position: 'relative', display: 'flex', flexDirection: 'column', textAlign: 'left'}}>
      {children}
      <div style={{position: 'absolute', top: 1.1 * u, left: '50%', transform: 'translateX(-50%)', width: w * u * 0.32, height: 2.6 * u, background: '#000', borderRadius: 99, zIndex: 8}} />
    </div>
  </div>
);
const Top: React.FC<{u: number}> = ({u}) => (
  <div style={{background: C.asphalt, display: 'flex', alignItems: 'center', gap: 1.3 * u, padding: `${4.6 * u}px ${2.2 * u}px ${1.6 * u}px`}}>
    <Mark size={4.4 * u} /><span style={{flex: 1, background: 'rgba(244,239,228,.10)', color: C.sand, borderRadius: 99, padding: `${0.8 * u}px ${1.7 * u}px`, fontSize: 1.8 * u, fontWeight: 600}}>All trades ⌄</span>
  </div>
);
const Tabs: React.FC<{u: number; active: string}> = ({u, active}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', padding: `${1.3 * u}px ${2.2 * u}px ${1.8 * u}px`, borderTop: '1px solid rgba(33,30,26,.08)'}}>
    {['Home', 'Jobs', 'Route', 'Clients', 'Money'].map((t) => (<span key={t} style={{fontSize: 1.4 * u, color: t === active ? C.curb : C.gravel, fontWeight: 600}}>{t}</span>))}
  </div>
);
const Body: React.FC<{u: number; children: React.ReactNode}> = ({u, children}) => (
  <div style={{flex: 1, padding: 2 * u, display: 'flex', flexDirection: 'column', gap: 1.4 * u, overflow: 'hidden', color: C.ink}}>{children}</div>
);
const Lab: React.FC<{u: number; children: React.ReactNode}> = ({u, children}) => (
  <div style={{fontSize: 1.4 * u, letterSpacing: '0.13em', color: C.gravel, fontWeight: 700, textTransform: 'uppercase'}}>{children}</div>
);

/* badge + caption around the phone */
const Badge: React.FC<{u: number; color: string; bg: string; children: React.ReactNode}> = ({u, color, bg, children}) => (
  <div style={{background: bg, color, fontFamily: HANK, fontWeight: 700, fontSize: 2.6 * u, letterSpacing: '0.2em', padding: `${1 * u}px ${2.8 * u}px`, borderRadius: 99}}>{children}</div>
);
const Cap: React.FC<{u: number; delay?: number; children: React.ReactNode}> = ({u, delay = 8, children}) => {
  const s = useSpr(delay);
  return <div style={{opacity: s, transform: `translateY(${(1 - s) * 14}px)`, fontFamily: BRIC, fontWeight: 800, fontSize: 4.4 * u, letterSpacing: '-0.02em', color: C.sand, textAlign: 'center', maxWidth: '92%'}}>{children}</div>;
};

/* ---------- 1. problem ---------- */
const ProblemScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tag = useSpr(4, 13, 0.7);
  const head = useSpr(8, 14, 0.7);
  // the ghosted follow-up texts, then "read" with no reply, then the owed number
  const texts = ['Hey! Following up on that invoice', 'Any update on payment?', '??'];
  const readS = useSpr(52, 16);
  const owed = useSpr(60, 13, 0.7);
  const count = Math.round(interpolate(frame, [60, 84], [0, 612], {...CL, easing: Easing.out(Easing.cubic)}));
  const drift = Math.sin(frame / 26) * 0.6 * u;
  const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(frame / 7));
  return (
    <AbsoluteFill style={{background: C.asphalt, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3.4 * u, padding: `${8 * u}px`, fontFamily: HANK, overflow: 'hidden'}}>
      <div style={{transform: `translateY(${drift}px)`, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 3.2 * u}}>
        <div style={{opacity: head, transform: `translateY(${(1 - head) * 16}px)`}}>
          <div style={{display: 'inline-flex', alignItems: 'center', gap: 1.2 * u, background: 'rgba(196,54,42,.16)', border: `1px solid rgba(196,54,42,.5)`, borderRadius: 99, padding: `${0.9 * u}px ${2 * u}px`, transform: `scale(${0.9 + tag * 0.1})`, opacity: tag}}>
            <span style={{width: 1.6 * u, height: 1.6 * u, borderRadius: '50%', background: C.danger, opacity: pulse}} />
            <span style={{color: '#EF7B66', fontWeight: 700, fontSize: 2.3 * u, letterSpacing: '0.14em'}}>3 WEEKS OVERDUE</span>
          </div>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 7.6 * u, lineHeight: 1, letterSpacing: '-0.03em', color: C.sand, marginTop: 1.8 * u}}>You did the work.<br /><span style={{color: C.danger}}>Still not paid.</span></div>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.3 * u}}>
          {texts.map((b, i) => {
            const p = spring({frame: frame - (18 + i * 10), fps, config: {damping: 15, mass: 0.7}});
            return <div key={i} style={{opacity: p, transform: `translateY(${(1 - p) * 10}px) scale(${0.9 + Math.min(p, 1) * 0.1})`, transformOrigin: 'bottom right', maxWidth: '82%', background: C.sky, color: '#fff', fontWeight: 600, fontSize: 2.9 * u, padding: `${1.5 * u}px ${2.4 * u}px`, borderRadius: `${2.8 * u}px ${2.8 * u}px ${0.6 * u}px ${2.8 * u}px`}}>{b}</div>;
          })}
          <div style={{opacity: readS, fontSize: 2 * u, color: C.gravel, fontWeight: 600, marginTop: 0.3 * u}}>Read 3:47 PM · no reply</div>
        </div>
        <div style={{opacity: owed, transform: `translateY(${(1 - owed) * 14}px)`, display: 'flex', alignItems: 'baseline', gap: 1.8 * u, borderTop: `1px solid rgba(244,239,228,.12)`, paddingTop: 2.4 * u}}>
          <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 8.6 * u, letterSpacing: '-0.03em', color: C.danger, lineHeight: 1}}>${count.toLocaleString()}</span>
          <span style={{fontSize: 2.6 * u, color: C.gravelDk, fontWeight: 700}}>owed · 3 jobs</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2. before: messy notes ---------- */
const NotesScreen: React.FC<{u: number}> = ({u}) => {
  const line = (t: string, opts: {strike?: boolean; rot?: number; color?: string} = {}) => (
    <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 2.5 * u, color: opts.color || '#3a352d', lineHeight: 1.5, textDecoration: opts.strike ? 'line-through' : 'none', transform: `rotate(${opts.rot || 0}deg)`, opacity: opts.strike ? 0.55 : 1}}>{t}</div>
  );
  return (
    <>
      <div style={{background: '#fff', display: 'flex', alignItems: 'center', gap: 1 * u, padding: `${4.8 * u}px ${2.4 * u}px ${1.6 * u}px`, color: C.marigold, fontWeight: 600, fontSize: 2 * u}}>
        <span style={{fontSize: 2.6 * u}}>‹</span> Notes
      </div>
      <div style={{flex: 1, background: '#fffef8', padding: `${1.6 * u}px ${2.6 * u}px`, display: 'flex', flexDirection: 'column', gap: 1.5 * u}}>
        <div style={{fontFamily: HANK, fontWeight: 700, fontSize: 3.4 * u, color: C.ink, marginBottom: 0.6 * u}}>who owes me ??</div>
        {line('Marcus - $180 (asked twice!!)', {rot: -0.6})}
        {line('Reyna - ??? did she pay', {rot: 0.5})}
        {line('check w/ Jordan on window $', {rot: -0.3})}
        {line('Dana - ask AGAIN', {color: C.red})}
        {line('Hollises paid', {strike: true, rot: 0.4})}
        {line('cash job last wk - ???', {rot: -0.5})}
        {line('the $150 one... who??', {rot: 0.3})}
      </div>
    </>
  );
};

/* ---------- 3. after: curb money screen with one-tap flow ---------- */
const owed = (u: number, name: string, sub: string, amt: string, paid: boolean) => (
  <div style={{background: C.concrete, borderRadius: 1.6 * u, padding: 1.6 * u}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
      <div><div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.3 * u, letterSpacing: '-0.03em'}}>{name}</div><div style={{fontSize: 1.5 * u, color: C.gravel}}>{sub}</div></div>
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.5 * u, letterSpacing: '-0.03em', color: paid ? C.lawn : C.ink}}>{amt}</div>
    </div>
    <div style={{display: 'flex', gap: 1 * u, marginTop: 1.2 * u}}>
      {paid ? (
        <b style={{flex: 1, textAlign: 'center', fontFamily: HANK, fontWeight: 700, fontSize: 1.7 * u, padding: `${1.1 * u}px 0`, borderRadius: 1.2 * u, background: 'rgba(60,122,89,.16)', color: C.lawn}}>✓ Paid</b>
      ) : (
        <>
          <b style={{flex: 1, textAlign: 'center', fontFamily: HANK, fontWeight: 700, fontSize: 1.55 * u, padding: `${1.1 * u}px 0`, borderRadius: 1.2 * u, background: C.pebble, color: C.ink}}>Request</b>
          <b style={{flex: 1, textAlign: 'center', fontFamily: HANK, fontWeight: 700, fontSize: 1.55 * u, padding: `${1.1 * u}px 0`, borderRadius: 1.2 * u, background: C.lawn, color: '#fff'}}>Mark paid</b>
        </>
      )}
    </div>
  </div>
);

const MoneyScreen: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const total = Math.round(interpolate(frame, [110, 120], [612, 432], CL));
  const unpaid = frame < 114 ? 4 : 3;
  const marcusPaid = frame >= 112;
  const toast = interpolate(frame, [74, 84, 102, 112], [0, 1, 1, 0], CL);
  return (
    <>
      <Top u={u} />
      <Body u={u}>
        <div style={{background: C.curb, color: '#fff', borderRadius: 2 * u, padding: `${2.2 * u}px`}}>
          <small style={{fontSize: 1.6 * u, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.9}}>Outstanding</small>
          <b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 6.2 * u, lineHeight: 1, letterSpacing: '-0.03em', margin: `${0.3 * u}px 0`}}>${total.toLocaleString()}</b>
          <i style={{fontStyle: 'normal', fontSize: 1.7 * u, opacity: 0.9}}>{unpaid} unpaid jobs</i>
        </div>
        <Lab u={u}>Who owes you</Lab>
        <div style={{position: 'relative'}}>
          {owed(u, 'Marcus Webb', 'Full Detail', '$180', marcusPaid)}
          <div style={{position: 'absolute', top: -2.4 * u, left: '50%', background: C.asphalt, color: C.sand, fontFamily: HANK, fontWeight: 700, fontSize: 1.7 * u, padding: `${0.8 * u}px ${1.6 * u}px`, borderRadius: 99, opacity: toast, transform: `translateX(-50%) translateY(${(1 - toast) * 6}px)`, boxShadow: `0 ${0.6 * u}px ${1.6 * u}px rgba(0,0,0,.35)`, whiteSpace: 'nowrap', zIndex: 3}}>✓ Request sent</div>
        </div>
        {owed(u, 'The Hollises', 'Window Washing', '$280', false)}
        {owed(u, 'Dana Pruitt', 'Downspout Flush', '$152', false)}
      </Body>
      <Tabs u={u} active="Money" />
    </>
  );
};

/* ---------- 4. widen: route + jobs minis ---------- */
const RouteMini: React.FC<{u: number}> = ({u}) => (
  <>
    <Top u={u} />
    <Body u={u}>
      <div style={{display: 'flex', background: C.concrete, borderRadius: 1.6 * u, padding: `${1.6 * u}px 0`}}>
        {[['8', 'stops'], ['27', 'miles'], ['4:20', 'drive']].map(([a, b]) => (<div key={b} style={{flex: 1, textAlign: 'center'}}><b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 3 * u, letterSpacing: '-0.03em'}}>{a}</b><span style={{fontSize: 1.4 * u, color: C.gravel}}>{b}</span></div>))}
      </div>
      <div style={{background: C.curb, color: '#fff', textAlign: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: 2.1 * u, padding: 1.8 * u, borderRadius: 2 * u}}>Start route</div>
      {[['1', 'Marcus Webb'], ['2', 'Reyna Ortiz'], ['3', 'The Hollises'], ['4', 'Jordan Vance']].map(([n, who]) => (
        <div key={n} style={{background: C.concrete, borderRadius: 1.5 * u, padding: `${1.3 * u}px ${1.5 * u}px`, display: 'flex', alignItems: 'center', gap: 1.4 * u}}>
          <span style={{width: 3.4 * u, height: 3.4 * u, borderRadius: '50%', background: C.curb, color: '#fff', fontFamily: BRIC, fontWeight: 800, fontSize: 1.9 * u, display: 'grid', placeItems: 'center'}}>{n}</span>
          <span style={{fontFamily: HANK, fontWeight: 800, fontSize: 2 * u}}>{who}</span>
        </div>
      ))}
    </Body>
    <Tabs u={u} active="Route" />
  </>
);
const JobsMini: React.FC<{u: number}> = ({u}) => (
  <>
    <Top u={u} />
    <Body u={u}>
      <div style={{display: 'flex', background: C.pebble, borderRadius: 99, padding: 0.5 * u, gap: 0.5 * u}}>
        <span style={{flex: 1, textAlign: 'center', fontSize: 1.7 * u, fontWeight: 700, padding: `${0.9 * u}px 0`, borderRadius: 99, background: '#fff', color: C.ink}}>List</span>
        <span style={{flex: 1, textAlign: 'center', fontSize: 1.7 * u, fontWeight: 700, padding: `${0.9 * u}px 0`, borderRadius: 99, color: C.gravel}}>Calendar</span>
      </div>
      <Lab u={u}>Today</Lab>
      {[['Marcus Webb', 'Full Detail', '$286', C.curb, 'In progress'], ['Reyna Ortiz', 'Express Wash', '$59', C.lawn, 'Scheduled'], ['The Hollises', 'Windows', '$280', C.sky, 'En route']].map(([n, s, p, col, st]) => (
        <div key={n} style={{background: C.concrete, borderRadius: 1.5 * u, padding: `${1.4 * u}px ${1.6 * u}px`, display: 'flex', justifyContent: 'space-between'}}>
          <div><div style={{fontFamily: HANK, fontWeight: 700, fontSize: 2 * u}}>{n}</div><div style={{fontSize: 1.4 * u, color: C.gravel}}>{s}</div></div>
          <div style={{textAlign: 'right'}}><b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.1 * u, letterSpacing: '-0.03em'}}>{p}</b><div style={{fontSize: 1.4 * u, fontWeight: 700, color: col as string}}>{st}</div></div>
        </div>
      ))}
    </Body>
    <Tabs u={u} active="Jobs" />
  </>
);

const WidenScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const head = useSpr(2);
  const p1 = useSpr(8, 14, 0.7);
  const p2 = useSpr(16, 14, 0.7);
  // phones bob gently out of phase so the frame keeps living
  const bob1 = Math.sin(frame / 24) * 0.9 * u;
  const bob2 = Math.sin(frame / 24 + 1.6) * 0.9 * u;
  return (
    <AbsoluteFill style={{background: C.asphalt, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5 * u, padding: `${8 * u}px`, fontFamily: HANK, overflow: 'hidden'}}>
      <div style={{opacity: head, transform: `translateY(${(1 - head) * 16}px)`, textAlign: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: 8.4 * u, lineHeight: 0.98, letterSpacing: '-0.03em', color: C.sand}}>One app runs<br /><span style={{color: C.curbDk}}>the whole day.</span></div>
      <div style={{display: 'flex', gap: 4 * u, alignItems: 'center'}}>
        <div style={{opacity: interpolate(p1, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(p1, 1)) * 20 + bob1}px) rotate(-4deg)`}}><Phone u={u} w={30}><RouteMini u={u} /></Phone></div>
        <div style={{opacity: interpolate(p2, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(p2, 1)) * 20 + bob2}px) rotate(4deg)`}}><Phone u={u} w={30}><JobsMini u={u} /></Phone></div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- before / after scene shells ---------- */
const BeforeScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const s = useSpr(4);
  // step in a little and settle, hold there while panning down a touch, then
  // ONE smooth accelerating zoom straight into the white paper for the hand-off
  const stepIn = interpolate(frame, [28, 50], [1.0, 1.55], {...CL, easing: Easing.out(Easing.cubic)});
  const dive = interpolate(frame, [86, 128], [0, 2.2], {...CL, easing: Easing.in(Easing.cubic)});
  const zoom = stepIn + dive;
  const pan = interpolate(frame, [54, 116], [0, -6 * u], {...CL, easing: Easing.inOut(Easing.quad)});
  const capFade = interpolate(frame, [28, 44], [1, 0], CL);
  const toWhite = interpolate(frame, [116, 130], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: C.asphalt, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 * u, padding: `${6 * u}px`, fontFamily: HANK, overflow: 'hidden'}}>
      <Badge u={u} color={C.sand} bg="#000">BEFORE</Badge>
      <div style={{transformOrigin: '50% 34%', transform: `scale(${zoom}) translateY(${pan}px)`}}>
        <div style={{opacity: s, transform: `translateY(${(1 - s) * 3}%) scale(${0.97 + s * 0.03})`}}><Phone u={u} w={52}><NotesScreen u={u} /></Phone></div>
      </div>
      <div style={{opacity: capFade}}><Cap u={u}>Chasing it over text.</Cap></div>
      <AbsoluteFill style={{background: '#fffef8', opacity: toWhite, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
const AfterScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cap = interpolate(frame, [130, 144], [0, 1], CL);
  // keep the whole phone in frame; just drift the focus toward the row being tapped
  const zoom = interpolate(frame, [0, 60, 120, SEQ[2]], [1.0, 1.02, 1.06, 1.055], CL);
  // the frame arrives pure white and STAYS white; the Money phone springs up
  // from the bottom onto it, like the app opening on a clean sheet
  const rise = spring({frame: frame - 12, fps, config: {damping: 14, mass: 0.85}});
  const riseY = (1 - rise) * 120;
  const badgeIn = interpolate(frame, [34, 50], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: '#fffef8', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 * u, padding: `${6 * u}px`, fontFamily: HANK, overflow: 'hidden'}}>
      <div style={{opacity: badgeIn, transform: `translateY(${(1 - badgeIn) * -8}px)`}}><Badge u={u} color={C.sand} bg={C.curb}>AFTER</Badge></div>
      <div style={{transformOrigin: '50% 46%', transform: `translateY(${riseY}%) scale(${zoom})`}}>
        <Phone u={u} w={52}><MoneyScreen u={u} /></Phone>
      </div>
      <div style={{opacity: cap, transform: `translateY(${(1 - cap) * 14}px)`, fontFamily: BRIC, fontWeight: 800, fontSize: 4.4 * u, letterSpacing: '-0.02em', color: C.ink, textAlign: 'center'}}>One tap. Paid.</div>
    </AbsoluteFill>
  );
};

/* ---------- 5. cta ---------- */
const CtaScene: React.FC = () => {
  const u = useU();
  const mark = useSpr(4, 13, 0.7);
  const wm = useSpr(20);
  const price = useSpr(30);
  const sub = useSpr(38);
  const link = useSpr(46);
  const up = (p: number, dy = 22) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
  return (
    <AbsoluteFill style={{background: C.asphalt, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 3 * u, fontFamily: HANK}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 2.4 * u}}>
        <Mark size={13 * u} draw delay={6} />
        <div style={{...up(wm, 0), fontFamily: BRIC, fontWeight: 800, fontSize: 12 * u, letterSpacing: '-0.03em', color: C.sand}}>Curb</div>
      </div>
      <div style={{...up(price), fontFamily: BRIC, fontWeight: 800, fontSize: 9 * u, letterSpacing: '-0.03em', color: C.sand, lineHeight: 1}}>$89. <span style={{color: C.curbDk}}>Once.</span></div>
      <div style={{...up(sub), fontFamily: HANK, fontWeight: 600, fontSize: 3.4 * u, color: C.gravelDk}}>Not a subscription. Yours forever.</div>
      <div style={{...up(link), fontFamily: HANK, fontWeight: 700, letterSpacing: '0.06em', color: C.curbDk, fontSize: 3.2 * u, marginTop: 1 * u}}>getcurb.net · Link in bio</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const CurbGetPaid: React.FC = () => {
  const {width, height} = useVideoConfig();
  const t = linearTiming({durationInFrames: TR});
  const tWhite = linearTiming({durationInFrames: 16});
  return (
    <AbsoluteFill style={{background: C.asphalt}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEQ[0]}><ProblemScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[1]}><BeforeScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={tWhite} />
        <TransitionSeries.Sequence durationInFrames={SEQ[2]}><AfterScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-left'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[3]}><WidenScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[4]}><CtaScene /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
