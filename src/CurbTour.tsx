import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';

const BRIC = 'Bricolage Grotesque';
const HANK = 'Hanken Grotesk';
const fh = delayRender('tour-fonts');
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
  gravel: '#7A7264', gravelDk: '#BDB4A4',
};

export const FPS = 30;
// beat start frames
const H = 78, M = 183, R = 288, E = 393;
export const DURATION = 507;
const BASE = -16;
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const win = (f: number, a: number, b: number, c: number, d: number) =>
  Math.max(0, Math.min(interpolate(f, [a, b], [0, 1], CL), interpolate(f, [c, d], [1, 0], CL)));

const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};

/* ---------- logo mark ---------- */
const Mark: React.FC<{size: number; draw?: boolean; delay?: number}> = ({size, draw, delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d1 = draw ? 1 - spring({frame: frame - delay, fps, config: {damping: 200}}) : 0;
  const d2 = draw ? 1 - spring({frame: frame - delay - 8, fps, config: {damping: 200}}) : 0;
  const dot = draw ? spring({frame: frame - delay - 16, fps, config: {damping: 12, mass: 0.6}}) : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <rect width="56" height="56" rx="14" fill={C.curb} />
      <path d="M38 15 C29 15 21 20 21 26 L21 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={d1} />
      <path d="M21 33 L40 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d2} />
      <circle cx="40" cy="33" r="3.5" fill={C.sand} opacity={draw ? (dot > 0.01 ? 1 : 0) : 1} style={{transform: `scale(${dot})`, transformBox: 'fill-box', transformOrigin: 'center'}} />
    </svg>
  );
};

/* ---------- app chrome + screens ---------- */
const Top: React.FC<{u: number}> = ({u}) => (
  <div style={{background: C.asphalt, display: 'flex', alignItems: 'center', gap: 1.3 * u, padding: `${2 * u}px ${2.2 * u}px ${1.6 * u}px`}}>
    <Mark size={4.4 * u} />
    <span style={{flex: 1, background: 'rgba(244,239,228,.10)', color: C.sand, borderRadius: 99, padding: `${0.8 * u}px ${1.7 * u}px`, fontSize: 1.8 * u, fontWeight: 600}}>All trades ⌄</span>
  </div>
);
const Tabs: React.FC<{u: number; active: string}> = ({u, active}) => (
  <div style={{display: 'flex', justifyContent: 'space-between', padding: `${1.3 * u}px ${2.2 * u}px ${1.8 * u}px`, borderTop: '1px solid rgba(33,30,26,.08)'}}>
    {['Home', 'Jobs', 'Route', 'Clients', 'Money'].map((t) => (
      <span key={t} style={{fontSize: 1.4 * u, color: t === active ? C.curb : C.gravel, fontWeight: 600}}>{t}</span>
    ))}
  </div>
);
const Body: React.FC<{u: number; children: React.ReactNode}> = ({u, children}) => (
  <div style={{flex: 1, padding: 2 * u, display: 'flex', flexDirection: 'column', gap: 1.4 * u, overflow: 'hidden'}}>{children}</div>
);
const Lab: React.FC<{u: number; children: React.ReactNode}> = ({u, children}) => (
  <div style={{fontSize: 1.4 * u, letterSpacing: '0.13em', color: C.gravel, fontWeight: 700, textTransform: 'uppercase'}}>{children}</div>
);

const HomeScreen: React.FC<{u: number}> = ({u}) => {
  const stat = (l: string, v: string, col?: string) => (
    <div style={{flex: 1, background: C.concrete, borderRadius: 1.5 * u, padding: 1.4 * u, display: 'flex', flexDirection: 'column', gap: 0.4 * u}}>
      <span style={{fontSize: 1.4 * u, color: C.gravel}}>{l}</span>
      <b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.5 * u, letterSpacing: '-0.03em', color: col || C.ink}}>{v}</b>
    </div>
  );
  const job = (t: string, n: string, s: string, p: string, st: string, sc: string) => (
    <div style={{background: C.concrete, borderRadius: 1.5 * u, padding: `${1.4 * u}px ${1.6 * u}px`, display: 'flex', justifyContent: 'space-between', gap: 1.2 * u}}>
      <div>
        <div style={{fontSize: 1.4 * u, color: C.gravel}}>{t}</div>
        <div style={{fontFamily: HANK, fontWeight: 700, fontSize: 2 * u}}>{n}</div>
        <div style={{fontSize: 1.4 * u, color: C.gravel}}>{s}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.45 * u}}>
        <b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.1 * u, letterSpacing: '-0.03em'}}>{p}</b>
        <span style={{fontSize: 1.4 * u, fontWeight: 700, color: sc, display: 'flex', alignItems: 'center', gap: 0.6 * u}}><span style={{width: 0.9 * u, height: 0.9 * u, borderRadius: '50%', background: sc}} />{st}</span>
        <span style={{fontSize: 1.3 * u, fontWeight: 700, color: C.curb, background: 'rgba(215,95,31,.14)', padding: `${0.25 * u}px ${1 * u}px`, borderRadius: 99}}>Unpaid</span>
      </div>
    </div>
  );
  return (
    <>
      <Top u={u} />
      <Body u={u}>
        <div style={{fontSize: 1.8 * u, color: C.gravel}}>Good evening</div>
        <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.4 * u, lineHeight: 1, letterSpacing: '-0.03em'}}>Friday, June 12</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 1.1 * u, background: C.concrete, borderLeft: `${0.7 * u}px solid ${C.curb}`, borderRadius: 1.4 * u, padding: `${1.2 * u}px ${1.5 * u}px`, fontSize: 1.75 * u, fontWeight: 600}}>
          <svg width={2.4 * u} height={2.4 * u} viewBox="0 0 24 24" fill={C.curb}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg> Thunderstorm · 90°/72° · 29%
        </div>
        <div style={{display: 'flex', gap: 1.2 * u}}>{stat('Stops', '8')}{stat('Expected', '$1,244', C.lawn)}{stat('Owed you', '$3,102', C.curb)}</div>
        <div style={{background: C.curb, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.1 * u, fontFamily: BRIC, fontWeight: 800, fontSize: 2.1 * u, letterSpacing: '-0.02em', padding: 1.9 * u, borderRadius: 2 * u}}>
          <svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none"><path d="M3 11l18-8-8 18-2-8-8-2z" fill="#fff" /></svg> Start today's route · 8 stops
        </div>
        <Lab u={u}>Today's run</Lab>
        {job('8:00a', 'Marcus Webb', 'Full Detail', '$286', 'In progress', C.curb)}
        {job('9:30a', 'The Hollises', 'Window Washing', '$280', 'En route', C.sky)}
      </Body>
      <Tabs u={u} active="Home" />
    </>
  );
};

const MoneyScreen: React.FC<{u: number}> = ({u}) => (
  <>
    <Top u={u} />
    <Body u={u}>
      <div style={{display: 'flex', background: C.pebble, borderRadius: 99, padding: 0.5 * u, gap: 0.5 * u}}>
        <span style={{flex: 1, textAlign: 'center', fontSize: 1.7 * u, fontWeight: 700, padding: `${0.9 * u}px 0`, borderRadius: 99, color: C.gravel}}>All time</span>
        <span style={{flex: 1, textAlign: 'center', fontSize: 1.7 * u, fontWeight: 700, padding: `${0.9 * u}px 0`, borderRadius: 99, background: C.asphalt, color: C.sand}}>This month</span>
      </div>
      <div style={{background: C.curb, color: '#fff', borderRadius: 2 * u, padding: `${2.2 * u}px ${2.2 * u}px ${2 * u}px`}}>
        <small style={{fontSize: 1.6 * u, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.9}}>Outstanding</small>
        <b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 6.2 * u, lineHeight: 1, letterSpacing: '-0.03em', margin: `${0.3 * u}px 0`}}>$1,263</b>
        <i style={{fontStyle: 'normal', fontSize: 1.7 * u, opacity: 0.9}}>5 unpaid jobs</i>
      </div>
      <div style={{display: 'flex', gap: 1.2 * u}}>
        <div style={{flex: 1, background: C.concrete, borderRadius: 1.5 * u, padding: 1.4 * u}}><span style={{fontSize: 1.5 * u, color: C.gravel}}>Collected</span><b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 2.9 * u, letterSpacing: '-0.03em', color: C.lawn}}>$2,119</b></div>
        <div style={{flex: 1, background: C.concrete, borderRadius: 1.5 * u, padding: 1.4 * u}}><span style={{fontSize: 1.5 * u, color: C.gravel}}>Avg ticket</span><b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 2.9 * u, letterSpacing: '-0.03em'}}>$225</b></div>
      </div>
      <Lab u={u}>Who owes you</Lab>
      <div style={{background: C.concrete, borderRadius: 1.6 * u, padding: 1.6 * u}}>
        <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.3 * u, letterSpacing: '-0.03em'}}>The Hollises</div>
        <div style={{fontSize: 1.5 * u, color: C.gravel}}>In &amp; Out Windows</div>
        <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.6 * u, letterSpacing: '-0.03em', margin: `${0.4 * u}px 0 ${1 * u}px`}}>$280</div>
        <div style={{display: 'flex', gap: 1 * u}}>
          {['Invoice', 'Request'].map((t) => (<b key={t} style={{flex: 1, textAlign: 'center', fontFamily: HANK, fontWeight: 700, fontSize: 1.55 * u, padding: `${1.1 * u}px 0`, borderRadius: 1.2 * u, background: C.pebble, color: C.ink}}>{t}</b>))}
          <b style={{flex: 1, textAlign: 'center', fontFamily: HANK, fontWeight: 700, fontSize: 1.55 * u, padding: `${1.1 * u}px 0`, borderRadius: 1.2 * u, background: C.lawn, color: '#fff'}}>Mark paid</b>
        </div>
      </div>
    </Body>
    <Tabs u={u} active="Money" />
  </>
);

const RouteScreen: React.FC<{u: number; drop: number}> = ({u, drop}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const stop = (n: string, who: string, trade: string, ad: string, k: number) => {
    const p = drop ? spring({frame: frame - R - 16 - k * 4, fps, config: {damping: 14, mass: 0.6}}) : 1;
    return (
      <div style={{opacity: p, transform: `translateY(${(1 - p) * -22}%) scale(${0.92 + p * 0.08})`, background: C.concrete, borderRadius: 1.5 * u, padding: `${1.4 * u}px ${1.5 * u}px`, display: 'flex', alignItems: 'center', gap: 1.4 * u}}>
        <span style={{flex: '0 0 auto', width: 3.6 * u, height: 3.6 * u, borderRadius: '50%', background: C.curb, color: '#fff', fontFamily: BRIC, fontWeight: 800, fontSize: 1.9 * u, display: 'grid', placeItems: 'center', boxShadow: `0 ${0.7 * u}px ${1.4 * u}px rgba(215,95,31,.5)`}}>{n}</span>
        <div>
          <div style={{fontFamily: HANK, fontWeight: 800, fontSize: 1.95 * u}}>{who} · <b style={{color: C.curb}}>{trade}</b></div>
          <div style={{fontSize: 1.4 * u, color: C.gravel}}>{ad}</div>
        </div>
        <span style={{marginLeft: 'auto', color: C.gravelDk, fontSize: 2.4 * u}}>⋮⋮</span>
      </div>
    );
  };
  return (
    <>
      <Top u={u} />
      <Body u={u}>
        <div style={{display: 'flex', background: C.concrete, borderRadius: 1.6 * u, padding: `${1.8 * u}px 0`}}>
          {[['8', 'stops'], ['27.3', 'miles'], ['4:20', 'drive']].map(([a, b]) => (
            <div key={b} style={{flex: 1, textAlign: 'center'}}><b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 3.2 * u, letterSpacing: '-0.03em'}}>{a}</b><span style={{fontSize: 1.4 * u, color: C.gravel}}>{b}</span></div>
          ))}
        </div>
        <div style={{textAlign: 'center', fontSize: 1.4 * u, color: C.gravel}}>Straight-line estimate</div>
        <div style={{background: C.curb, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.1 * u, fontFamily: BRIC, fontWeight: 800, fontSize: 2.1 * u, letterSpacing: '-0.02em', padding: 1.9 * u, borderRadius: 2 * u}}>
          <svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none"><path d="M3 11l18-8-8 18-2-8-8-2z" fill="#fff" /></svg> Start route
        </div>
        <Lab u={u}>Hold grip to reorder</Lab>
        {stop('1', 'Marcus Webb', 'Auto Detailing', '412 Apison Pike · 8:00a', 0)}
        {stop('2', 'Reyna Ortiz', 'Auto Detailing', '88 University Dr · 11:00a', 1)}
        {stop('3', 'The Hollises', 'Window Washing', '19 Standifer Gap · 9:30a', 2)}
      </Body>
      <Tabs u={u} active="Route" />
    </>
  );
};

/* ---------- phone ---------- */
const Face: React.FC<{u: number; back?: boolean; children: React.ReactNode}> = ({u, back, children}) => (
  <div style={{position: 'absolute', inset: 0, borderRadius: 5 * u, background: '#000', padding: 1.3 * u, backfaceVisibility: 'hidden', boxShadow: `0 ${4 * u}px ${8 * u}px rgba(0,0,0,.55)`, transform: back ? 'rotateY(180deg)' : undefined}}>
    <div style={{width: '100%', height: '100%', borderRadius: 3.9 * u, overflow: 'hidden', background: back ? '#17130f' : C.sand, display: 'flex', flexDirection: 'column', color: C.ink, textAlign: 'left', alignItems: back ? 'center' : undefined, justifyContent: back ? 'center' : undefined, gap: back ? 3 * u : undefined}}>
      {children}
    </div>
  </div>
);

const Phone: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  const spinRot = (s: number) => (f >= s && f < s + 28 ? BASE + easeInOut((f - s) / 28) * 360 : null);
  const ry = spinRot(M) ?? spinRot(R) ?? BASE + Math.sin(f * 0.05) * 2.2;
  const ty = Math.sin(f * 0.07) * 1.2;
  const active = f < M + 14 ? 'home' : f < R + 14 ? 'money' : 'route';
  const enter = spring({frame: f - H, fps, config: {damping: 200}});
  const exit = spring({frame: f - E, fps, config: {damping: 200}});
  const op = enter * (1 - exit);
  const inT = `translateY(${(1 - enter) * 16 - exit * 8}%) rotateY(${(1 - enter) * -55 + exit * 45}deg) scale(${(0.86 + 0.14 * enter) * (1 - 0.1 * exit)})`;
  return (
    <div style={{transformStyle: 'preserve-3d', transform: 'scale(1.32)'}}>
      <div style={{transformStyle: 'preserve-3d', opacity: op, transform: inT}}>
        <div style={{transformStyle: 'preserve-3d', transform: `translateY(${ty}%) rotateY(${ry}deg) rotateX(6deg)`}}>
          <div style={{position: 'relative', width: 40 * u, aspectRatio: '9 / 18', transformStyle: 'preserve-3d'}}>
            <Face u={u}>
              {active === 'home' ? <HomeScreen u={u} /> : active === 'money' ? <MoneyScreen u={u} /> : <RouteScreen u={u} drop={f >= R ? 1 : 0} />}
            </Face>
            <Face u={u} back>
              <Mark size={22 * u} />
              <b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 7 * u, color: C.sand, letterSpacing: '-0.03em'}}>Curb</b>
            </Face>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- background motifs ---------- */
const Motifs: React.FC<{u: number; f: number}> = ({u, f}) => {
  const homeM = win(f, H, H + 14, M - 5, M + 7);
  const moneyM = win(f, M + 2, M + 16, R - 5, R + 7);
  const routeM = win(f, R + 2, R + 16, E - 5, E + 7);
  const dots = [
    {s: 16, x: 6, y: 16, c: C.marigold, o: 0.12, ph: 0}, {s: 10, x: 84, y: 26, c: C.curb, o: 0.14, ph: 20},
    {s: 22, x: 82, y: 66, c: C.curb, o: 0.08, ph: 10}, {s: 8, x: 14, y: 66, c: C.marigold, o: 0.16, ph: 34}, {s: 6, x: 44, y: 8, c: C.curb, o: 0.16, ph: 6},
  ];
  const coins = [
    {x: 5, s: 9, c: C.lawn, ph: 0}, {x: 15, s: 6, c: C.curb, ph: 66}, {x: 86, s: 11, c: C.lawn, ph: 33},
    {x: 78, s: 7, c: C.curb, ph: 99}, {x: 33, s: 8, c: C.lawn, ph: 126}, {x: 66, s: 6, c: C.marigold, ph: 18},
  ];
  const cyc = FPS * 5.5;
  const routeProg = interpolate(f, [R + 2, R + 48], [0, 1], CL);
  const pins = [{x: 14, y: 18, d: 10}, {x: 15, y: 104, d: 22}, {x: 62, y: 152, d: 34}, {x: 84, y: 92, d: 28}];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* home */}
      <AbsoluteFill style={{opacity: homeM}}>
        {dots.map((d, i) => (
          <div key={i} style={{position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: d.s * u, height: d.s * u, borderRadius: '50%', background: d.c, opacity: d.o, transform: `translateY(${Math.sin((f + d.ph) * 0.06) * 6}%)`}} />
        ))}
      </AbsoluteFill>
      {/* money */}
      <AbsoluteFill style={{opacity: moneyM}}>
        {coins.map((c, i) => {
          const t = (((f + c.ph) % cyc) + cyc) % cyc / cyc;
          const top = 104 - t * 120;
          const o = (t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1) * 0.22;
          return <div key={i} style={{position: 'absolute', left: `${c.x}%`, top: `${top}%`, fontFamily: BRIC, fontWeight: 800, fontSize: c.s * u, color: c.c, opacity: o}}>$</div>;
        })}
      </AbsoluteFill>
      {/* route */}
      <AbsoluteFill style={{opacity: routeM}}>
        <svg viewBox="0 0 100 178" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `translateY(${Math.sin(f * 0.04) * 1.5}%)`}}>
          <path d="M14 18 C 10 55, 24 74, 15 104 C 7 134, 40 156, 62 152 C 86 148, 92 118, 84 92" stroke={C.curb} strokeWidth={2} fill="none" opacity={0.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeProg} />
          {pins.map((p, i) => {
            const s = Math.min(1, Math.max(0, (f - (R + p.d)) / 8));
            return <circle key={i} cx={p.x} cy={p.y} r={2.9} fill={C.curb} opacity={0.75 * s} style={{transform: `scale(${s})`, transformBox: 'fill-box', transformOrigin: 'center'}} />;
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- label / intro / endcard ---------- */
const Label: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  const data =
    f < M ? {start: H, t: ['Wake up ready.'], d: 'Your whole day, the second you open the app.', acc: false}
    : f < R ? {start: M, t: ['Get paid,', 'not ghosted.'], d: 'See who owes you. Collect in a tap.', acc: true}
    : {start: R, t: ['Less driving,', 'more jobs.'], d: 'Curb orders every stop so you stop backtracking.', acc: true};
  return (
    <div style={{minHeight: 26 * u, display: 'flex', flexDirection: 'column', gap: 1.4 * u, alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 2}}>
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 8.2 * u, lineHeight: 0.98, letterSpacing: '-0.03em'}}>
        {data.t.map((line, k) => {
          const p = spring({frame: f - data.start - k * 4, fps, config: {damping: 200}});
          return (
            <span key={k} style={{display: 'block', overflow: 'hidden', paddingBottom: '0.05em'}}>
              <span style={{display: 'block', transform: `translateY(${(1 - p) * 110}%)`, color: data.acc && k === data.t.length - 1 ? C.curbDk : C.sand}}>{line}</span>
            </span>
          );
        })}
      </div>
      <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 3.7 * u, color: C.gravelDk, maxWidth: '90%', opacity: spring({frame: f - data.start - 8, fps, config: {damping: 200}})}}>{data.d}</div>
    </div>
  );
};

const Intro: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  const op = f < 66 ? 1 : interpolate(f, [66, 84], [1, 0], CL);
  const lab = spring({frame: f - 4, fps, config: {damping: 200}});
  return (
    <AbsoluteFill style={{opacity: op, background: C.asphalt, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 3.2 * u, zIndex: 4}}>
      <div style={{opacity: lab, transform: `translateY(${(1 - lab) * 24}%)`, fontWeight: 700, fontSize: 2.9 * u, letterSpacing: '0.13em', textTransform: 'uppercase', color: C.gravelDk}}>A quick tour</div>
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 10.6 * u, lineHeight: 0.98, letterSpacing: '-0.03em'}}>
        {['Everything you run', 'in a day.'].map((line, k) => {
          const p = spring({frame: f - 6 - k * 5, fps, config: {damping: 200}});
          return <span key={k} style={{display: 'block', overflow: 'hidden'}}><span style={{display: 'block', transform: `translateY(${(1 - p) * 110}%)`, color: k === 1 ? C.curbDk : C.sand}}>{line}</span></span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const Endcard: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  const op = interpolate(f, [E, E + 12], [0, 1], CL);
  const g = (d: number) => spring({frame: f - E - d, fps, config: {damping: 200}});
  const up = (p: number, dy = 24) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
  const wm = g(20), sub = g(30), badge = g(38), url = g(46), under = g(26);
  return (
    <AbsoluteFill style={{opacity: op, background: C.asphalt, color: C.sand, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 3.2 * u, zIndex: 4}}>
      <div style={{marginBottom: 1 * u}}><Mark size={24 * u} draw delay={6} /></div>
      <div style={{...up(wm, 0), fontFamily: BRIC, fontWeight: 800, fontSize: 18 * u, letterSpacing: '-0.03em', lineHeight: 1}}>Curb</div>
      <div style={{height: 1.1 * u, width: 26 * u, background: C.curb, borderRadius: 99, transform: `scaleX(${under})`, transformOrigin: 'left center'}} />
      <div style={{...up(sub), fontFamily: HANK, fontWeight: 600, fontSize: 3.9 * u}}>Just $4.99/mo or $89 once. Yours forever.</div>
      <div style={{...up(badge, 30), display: 'inline-flex', alignItems: 'center', gap: 2.4 * u, background: '#000', border: '1px solid rgba(244,239,228,.22)', borderRadius: 2.2 * u, padding: `${2.4 * u}px ${4.6 * u}px`}}>
        <svg width={5.8 * u} height={5.8 * u} viewBox="0 0 24 24" fill={C.sand}><path d="M16.4 12.7c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 .9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-.9 2.3-1.9.7-1.1 1-2.1 1-2.2 0 0-1.9-.7-1.9-3zM14.6 6.3c.5-.6.9-1.5.8-2.3-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.7-.4 2.2-1z" /></svg>
        <span style={{textAlign: 'left', lineHeight: 1.05}}>
          <small style={{fontFamily: HANK, fontSize: 2.1 * u, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, display: 'block'}}>Download on the</small>
          <b style={{fontFamily: BRIC, fontSize: 3.8 * u, fontWeight: 800, letterSpacing: '-0.02em'}}>App Store</b>
        </span>
      </div>
      <div style={{...up(url), fontFamily: HANK, fontWeight: 700, letterSpacing: '0.06em', color: C.curbDk, fontSize: 3.3 * u}}>getcurb.net</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const CurbTour: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const u = useU();
  return (
    <AbsoluteFill style={{background: C.asphalt, fontFamily: HANK}}>
      <Motifs u={u} f={f} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: `${13 * u}px ${6 * u}px ${3 * u}px`, zIndex: 2}}>
        <Label u={u} f={f} fps={fps} />
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', perspective: 1700}}>
          <Phone u={u} f={f} fps={fps} />
        </div>
      </AbsoluteFill>
      <Intro u={u} f={f} fps={fps} />
      <Endcard u={u} f={f} fps={fps} />
    </AbsoluteFill>
  );
};
