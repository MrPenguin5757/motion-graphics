import React from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';

const BRIC = 'Bricolage Grotesque';
const HANK = 'Hanken Grotesk';
const fh = delayRender('tourfull-fonts');
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
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const win = (f: number, a: number, b: number, c: number, d: number) =>
  Math.max(0, Math.min(interpolate(f, [a, b], [0, 1], CL), interpolate(f, [c, d], [1, 0], CL)));

// beats: five screens, spin transition into each after the first
const INTRO_OUT = 84;
const S = [78, 228, 378, 528, 678]; // home, jobs, route, clients, money
const SPIN = 28;
const END = 828;
export const DURATION = 958;
const BASE = -16;

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

/* ---------- app chrome ---------- */
const Top: React.FC<{u: number; trade?: string}> = ({u, trade = 'All trades'}) => (
  <div style={{background: C.asphalt, display: 'flex', alignItems: 'center', gap: 1.3 * u, padding: `${2 * u}px ${2.2 * u}px ${1.6 * u}px`}}>
    <Mark size={4.4 * u} />
    <span style={{flex: 1, background: 'rgba(244,239,228,.10)', color: C.sand, borderRadius: 99, padding: `${0.8 * u}px ${1.7 * u}px`, fontSize: 1.8 * u, fontWeight: 600}}>{trade} ⌄</span>
    <span style={{color: C.gravelDk, fontSize: 2.2 * u}}>⚙</span>
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
const Pay = ({u, paid}: {u: number; paid?: boolean}) => (
  <span style={{fontSize: 1.3 * u, fontWeight: 700, color: paid ? C.lawn : C.curb, background: paid ? 'rgba(60,122,89,.14)' : 'rgba(215,95,31,.14)', padding: `${0.25 * u}px ${1 * u}px`, borderRadius: 99}}>{paid ? 'Paid' : 'Unpaid'}</span>
);

/* ---------- screens ---------- */
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
        <Pay u={u} />
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

const JobsScreen: React.FC<{u: number}> = ({u}) => {
  const seg = (t: string, on?: boolean) => (
    <span style={{flex: 1, textAlign: 'center', fontSize: 1.7 * u, fontWeight: 700, padding: `${0.9 * u}px 0`, borderRadius: 99, background: on ? '#fff' : 'transparent', color: on ? C.ink : C.gravel, boxShadow: on ? `0 ${0.3 * u}px ${0.8 * u}px rgba(0,0,0,.12)` : undefined}}>{t}</span>
  );
  const chip = (t: string, on?: boolean) => (
    <span style={{fontSize: 1.55 * u, fontWeight: 700, padding: `${0.7 * u}px ${1.8 * u}px`, borderRadius: 99, background: on ? C.asphalt : 'transparent', color: on ? C.sand : C.gravel}}>{t}</span>
  );
  const day = (d: string, w: string, wet: string, total: string) => (
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 0.4 * u}}>
      <div>
        <div style={{fontFamily: HANK, fontWeight: 800, fontSize: 2.1 * u}}>{d}</div>
        <div style={{fontSize: 1.4 * u, color: C.gravel}}>{w} · <span style={{color: C.sky, fontWeight: 700}}>{wet}</span></div>
      </div>
      <b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.2 * u, letterSpacing: '-0.03em', color: C.gravel}}>{total}</b>
    </div>
  );
  const job = (t: string, n: string, s: string, ad: string, p: string, st: string, sc: string, paid: boolean, rain?: boolean) => (
    <div style={{background: C.concrete, borderRadius: 1.5 * u, padding: `${1.4 * u}px ${1.6 * u}px`, display: 'flex', justifyContent: 'space-between', gap: 1.2 * u}}>
      <div style={{minWidth: 0}}>
        <div style={{fontSize: 1.35 * u, color: C.gravel}}>{t}</div>
        <div style={{fontFamily: HANK, fontWeight: 700, fontSize: 1.95 * u}}>{n}</div>
        <div style={{fontSize: 1.4 * u, color: C.gravel}}>{s}</div>
        <div style={{fontSize: 1.3 * u, color: C.gravel, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ad}</div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.4 * u}}>
        <b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.05 * u, letterSpacing: '-0.03em'}}>{p}</b>
        <span style={{fontSize: 1.35 * u, fontWeight: 700, color: sc, display: 'flex', alignItems: 'center', gap: 0.5 * u}}><span style={{width: 0.85 * u, height: 0.85 * u, borderRadius: '50%', background: sc}} />{st}</span>
        <Pay u={u} paid={paid} />
        {rain && <span style={{fontSize: 1.3 * u, fontWeight: 700, color: C.marigold, display: 'flex', alignItems: 'center', gap: 0.4 * u}}>⚠ Rain</span>}
      </div>
    </div>
  );
  return (
    <>
      <Top u={u} trade="Auto Detailing" />
      <Body u={u}>
        <div style={{display: 'flex', background: C.pebble, borderRadius: 99, padding: 0.5 * u, gap: 0.5 * u}}>{seg('List', true)}{seg('Calendar')}</div>
        <div style={{display: 'flex', gap: 0.8 * u}}>{chip('All', true)}{chip('Unpaid')}{chip('Recurring')}</div>
        {day('Today', 'Thunderstorm 90°/72°', '29%', '$345')}
        {job('8:00a', 'Marcus Webb', 'Full Detail', '412 Apison Pike, Collegedale', '$286', 'In progress', C.curb, true)}
        {job('11:00a', 'Reyna Ortiz', 'Express Wash & Wax', '88 University Dr, Collegedale', '$59', 'Scheduled', C.lawn, false)}
        {day('Sunday', 'Drizzle 87°/69°', '73%', '$650')}
        {job('9:00a', 'Brandt Family', 'Ceramic Coating', '230 Mountain View Rd, Ooltewah', '$650', 'Scheduled', C.lawn, false, true)}
      </Body>
      <Tabs u={u} active="Jobs" />
    </>
  );
};

const RouteScreen: React.FC<{u: number; local: number}> = ({u, local}) => {
  const {fps} = useVideoConfig();
  const stop = (n: string, who: string, trade: string, ad: string, k: number) => {
    const p = spring({frame: local - 16 - k * 3, fps, config: {damping: 14, mass: 0.6}});
    return (
      <div style={{opacity: p, transform: `translateY(${(1 - p) * -18}%) scale(${0.93 + p * 0.07})`, background: C.concrete, borderRadius: 1.5 * u, padding: `${1.25 * u}px ${1.5 * u}px`, display: 'flex', alignItems: 'center', gap: 1.4 * u}}>
        <span style={{flex: '0 0 auto', width: 3.4 * u, height: 3.4 * u, borderRadius: '50%', background: C.curb, color: '#fff', fontFamily: BRIC, fontWeight: 800, fontSize: 1.8 * u, display: 'grid', placeItems: 'center', boxShadow: `0 ${0.6 * u}px ${1.3 * u}px rgba(215,95,31,.5)`}}>{n}</span>
        <div style={{minWidth: 0}}>
          <div style={{fontFamily: HANK, fontWeight: 800, fontSize: 1.85 * u}}>{who} · <b style={{color: C.curb}}>{trade}</b></div>
          <div style={{fontSize: 1.35 * u, color: C.gravel, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ad}</div>
        </div>
        <span style={{marginLeft: 'auto', color: C.gravelDk, fontSize: 2.2 * u}}>⋮⋮</span>
      </div>
    );
  };
  return (
    <>
      <Top u={u} />
      <Body u={u}>
        <div style={{display: 'flex', background: C.concrete, borderRadius: 1.6 * u, padding: `${1.6 * u}px 0`}}>
          {[['8', 'stops'], ['27.3', 'miles'], ['420', 'min drive']].map(([a, b]) => (
            <div key={b} style={{flex: 1, textAlign: 'center'}}><b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 3 * u, letterSpacing: '-0.03em'}}>{a}</b><span style={{fontSize: 1.35 * u, color: C.gravel}}>{b}</span></div>
          ))}
        </div>
        <div style={{textAlign: 'center', fontSize: 1.35 * u, color: C.gravel}}>Straight-line estimate</div>
        <div style={{background: C.curb, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.1 * u, fontFamily: BRIC, fontWeight: 800, fontSize: 2.1 * u, letterSpacing: '-0.02em', padding: 1.7 * u, borderRadius: 2 * u}}>
          <svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none"><path d="M3 11l18-8-8 18-2-8-8-2z" fill="#fff" /></svg> Start route
        </div>
        <Lab u={u}>Hold grip to reorder</Lab>
        {stop('1', 'Marcus Webb', 'Auto Detailing', '412 Apison Pike · 8:00a', 0)}
        {stop('2', 'Reyna Ortiz', 'Auto Detailing', '88 University Dr · 11:00a', 1)}
        {stop('3', 'The Hollises', 'Window Washing', '19 Standifer Gap · 9:30a', 2)}
        {stop('4', 'Jordan Vance', 'Pressure Washing', '77 Mountain View Rd · 1:00p', 3)}
        {stop('5', 'Pat Sweeney', 'Lawn Care', '640 Apison Pike · 11:00a', 4)}
      </Body>
      <Tabs u={u} active="Route" />
    </>
  );
};

const ClientsScreen: React.FC<{u: number}> = ({u}) => {
  const row = (l: string, v: string) => (
    <div style={{display: 'flex', justifyContent: 'space-between', padding: `${1.1 * u}px 0`, borderTop: '1px solid rgba(33,30,26,.08)', fontSize: 1.7 * u}}>
      <span style={{color: C.gravel}}>{l}</span><b style={{fontFamily: HANK, fontWeight: 700}}>{v}</b>
    </div>
  );
  return (
    <>
      <Top u={u} trade="Pressure Washing" />
      <Body u={u}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div><div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.7 * u, letterSpacing: '-0.03em'}}>Jordan Vance</div><div style={{fontSize: 1.4 * u, color: C.gravel}}>1 job</div></div>
          <span style={{color: C.gravelDk, fontSize: 2.4 * u}}>✕</span>
        </div>
        <div style={{background: C.curb, color: '#fff', borderRadius: 1.8 * u, padding: `${1.8 * u}px ${2 * u}px`}}>
          <small style={{fontSize: 1.5 * u, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, opacity: 0.92}}>Outstanding balance</small>
          <b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 5 * u, lineHeight: 1, letterSpacing: '-0.03em', marginTop: 0.3 * u}}>$130</b>
        </div>
        <div style={{fontSize: 1.6 * u, color: C.gravel}}>📞 (423) 555-0107</div>
        <div style={{fontSize: 1.6 * u, color: C.gravel}}>📍 77 Mountain View Rd, Ooltewah, TN</div>
        <div style={{display: 'flex', gap: 1 * u}}>
          <b style={{flex: 1, textAlign: 'center', fontFamily: HANK, fontWeight: 700, fontSize: 1.6 * u, padding: `${1.1 * u}px 0`, borderRadius: 1.2 * u, background: C.pebble, color: C.ink}}>✎ Edit info</b>
          <b style={{flex: 1, textAlign: 'center', fontFamily: HANK, fontWeight: 700, fontSize: 1.6 * u, padding: `${1.1 * u}px 0`, borderRadius: 1.2 * u, background: C.lawn, color: '#fff'}}>+ New job</b>
        </div>
        <Lab u={u}>Profile</Lab>
        <div>
          {row('Cars', '1 · SUV/Truck')}
          {row('Preferred time', 'Any time')}
          {row('Property', '2-story')}
          {row('Lot size', '¼–½ acre')}
          {row('Gate / access', 'Code 2289')}
        </div>
      </Body>
      <Tabs u={u} active="Clients" />
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

/* ---------- phone ---------- */
const Face: React.FC<{u: number; back?: boolean; children: React.ReactNode}> = ({u, back, children}) => (
  <div style={{position: 'absolute', inset: 0, borderRadius: 5 * u, background: '#000', padding: 1.3 * u, backfaceVisibility: 'hidden', boxShadow: `0 ${4 * u}px ${8 * u}px rgba(0,0,0,.55)`, transform: back ? 'rotateY(180deg)' : undefined}}>
    <div style={{width: '100%', height: '100%', borderRadius: 3.9 * u, overflow: 'hidden', background: back ? '#17130f' : C.sand, display: 'flex', flexDirection: 'column', color: C.ink, textAlign: 'left', alignItems: back ? 'center' : undefined, justifyContent: back ? 'center' : undefined, gap: back ? 3 * u : undefined}}>
      {children}
    </div>
  </div>
);

const activeIndex = (f: number) => {
  let idx = 0;
  for (let i = 1; i < S.length; i++) if (f >= S[i] + SPIN / 2) idx = i;
  return idx;
};

const Phone: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  // spin into every screen after the first
  let ry = BASE + Math.sin(f * 0.05) * 2.2;
  for (let i = 1; i < S.length; i++) {
    if (f >= S[i] && f < S[i] + SPIN) ry = BASE + easeInOut((f - S[i]) / SPIN) * 360;
  }
  const ty = Math.sin(f * 0.07) * 1.2;
  const idx = activeIndex(f);
  const enter = spring({frame: f - S[0], fps, config: {damping: 200}});
  const exit = spring({frame: f - END, fps, config: {damping: 200}});
  const op = enter * (1 - exit);
  const inT = `translateY(${(1 - enter) * 16 - exit * 8}%) rotateY(${(1 - enter) * -55 + exit * 45}deg) scale(${(0.86 + 0.14 * enter) * (1 - 0.1 * exit)})`;
  const screen = () => {
    switch (idx) {
      case 0: return <HomeScreen u={u} />;
      case 1: return <JobsScreen u={u} />;
      case 2: return <RouteScreen u={u} local={f - S[2]} />;
      case 3: return <ClientsScreen u={u} />;
      default: return <MoneyScreen u={u} />;
    }
  };
  return (
    <div style={{transformStyle: 'preserve-3d', transform: 'scale(1.28)'}}>
      <div style={{transformStyle: 'preserve-3d', opacity: op, transform: inT}}>
        <div style={{transformStyle: 'preserve-3d', transform: `translateY(${ty}%) rotateY(${ry}deg) rotateX(6deg)`}}>
          <div style={{position: 'relative', width: 40 * u, aspectRatio: '9 / 18', transformStyle: 'preserve-3d'}}>
            <Face u={u}>{screen()}</Face>
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

/* ---------- floating highlight pills ---------- */
type Anchor = 'l' | 'r' | 'c';
const Pill: React.FC<{u: number; f: number; fps: number; screen: number; delay: number; x: number; y: number; anchor?: Anchor; children: React.ReactNode}> = ({u, f, fps, screen, delay, x, y, anchor = 'l', children}) => {
  const appear = S[screen] + delay;
  const vanish = screen < S.length - 1 ? S[screen + 1] - 4 : END - 4;
  const p = spring({frame: f - appear, fps, config: {damping: 13, mass: 0.7}});
  const out = interpolate(f, [vanish, vanish + 10], [1, 0], CL);
  const op = interpolate(p, [0, 0.5], [0, 1], CL) * out;
  if (op <= 0.001) return null;
  const floatY = Math.sin((f + delay * 3) * 0.06) * 0.7 * u;
  const pos: React.CSSProperties = anchor === 'r' ? {right: `${x}%`} : anchor === 'c' ? {left: '50%'} : {left: `${x}%`};
  const cx = anchor === 'c' ? 'translateX(-50%) ' : '';
  return (
    <div style={{position: 'absolute', top: `${y}%`, ...pos, opacity: op, transform: `${cx}translateY(${(1 - Math.min(p, 1)) * 14 + floatY}px) scale(${0.9 + Math.min(p, 1) * 0.1})`, transformOrigin: 'center', filter: `drop-shadow(0 ${1.4 * u}px ${3.2 * u}px rgba(0,0,0,.34))`}}>
      {children}
    </div>
  );
};

const Card: React.FC<{u: number; children: React.ReactNode; pad?: number}> = ({u, children, pad = 1.8}) => (
  <div style={{background: '#fff', borderRadius: 2 * u, padding: `${pad * u}px ${(pad + 0.4) * u}px`}}>{children}</div>
);
const StatPill: React.FC<{u: number; label: string; value: string; color?: string; sub?: string}> = ({u, label, value, color, sub}) => (
  <Card u={u}>
    <div style={{fontFamily: HANK, fontWeight: 700, fontSize: 1.7 * u, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.gravel}}>{label}</div>
    <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 4 * u, letterSpacing: '-0.03em', color: color || C.ink, lineHeight: 1.05}}>{value}</div>
    {sub && <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 1.7 * u, color: C.gravel}}>{sub}</div>}
  </Card>
);
const StatusPill: React.FC<{u: number; dot: string; text: string}> = ({u, dot, text}) => (
  <div style={{background: '#fff', borderRadius: 99, padding: `${1.3 * u}px ${2.4 * u}px`, display: 'flex', alignItems: 'center', gap: 1.1 * u, fontFamily: HANK, fontWeight: 700, fontSize: 2.2 * u, color: C.ink, whiteSpace: 'nowrap'}}>
    <span style={{width: 1.4 * u, height: 1.4 * u, borderRadius: '50%', background: dot}} />{text}
  </div>
);
const NotePill: React.FC<{u: number; text: string; color?: string; icon?: React.ReactNode}> = ({u, text, color = C.ink, icon}) => (
  <div style={{background: '#fff', borderRadius: 1.6 * u, padding: `${1.3 * u}px ${2.2 * u}px`, display: 'flex', alignItems: 'center', gap: 1.1 * u, fontFamily: HANK, fontWeight: 700, fontSize: 2.2 * u, color, whiteSpace: 'nowrap'}}>
    {icon}{text}
  </div>
);

const Pills: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  const P = (props: any) => <Pill u={u} f={f} fps={fps} {...props} />;
  return (
    <AbsoluteFill style={{zIndex: 3, pointerEvents: 'none'}}>
      {/* HOME */}
      <P screen={0} delay={22} x={4} y={26} anchor="l"><StatPill u={u} label="Owed to you" value="$3,102" color={C.curb} /></P>
      <P screen={0} delay={34} x={4} y={62} anchor="r"><StatPill u={u} label="Stops today" value="8 stops" /></P>
      {/* JOBS */}
      <P screen={1} delay={20} x={3} y={22} anchor="l"><StatusPill u={u} dot={C.curb} text="In progress" /></P>
      <P screen={1} delay={30} x={4} y={30} anchor="r"><StatusPill u={u} dot={C.lawn} text="Scheduled" /></P>
      <P screen={1} delay={44} x={0} y={72} anchor="c"><NotePill u={u} color={C.curbDk} text="Rain warning: Sunday 73%" icon={<span style={{fontSize: 2.1 * u}}>🌧</span>} /></P>
      {/* ROUTE */}
      <P screen={2} delay={26} x={4} y={64} anchor="r"><StatPill u={u} label="Today's drive" value="27.3 mi" /></P>
      <P screen={2} delay={38} x={3} y={26} anchor="l"><StatusPill u={u} dot={C.curb} text="Optimized · 6 stops" /></P>
      {/* CLIENTS */}
      <P screen={3} delay={20} x={3} y={22} anchor="l"><StatusPill u={u} dot={C.curb} text="Prefers mornings" /></P>
      <P screen={3} delay={32} x={3} y={58} anchor="l"><StatPill u={u} label="Last job" value="$130" color={C.lawn} sub="Pressure Washing" /></P>
      <P screen={3} delay={46} x={0} y={74} anchor="c"><StatPill u={u} label="Gate / access" value="Code 2289" sub="side gate on left" /></P>
      {/* MONEY */}
      <P screen={4} delay={22} x={3} y={24} anchor="l">
        <Card u={u}>
          <div style={{display: 'flex', alignItems: 'center', gap: 0.9 * u, fontFamily: HANK, fontWeight: 700, fontSize: 1.9 * u, color: C.lawn}}>
            <svg width={2.2 * u} height={2.2 * u} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke={C.lawn} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg> Invoice sent
          </div>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.8 * u, letterSpacing: '-0.03em'}}>$280</div>
          <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 1.7 * u, color: C.gravel}}>The Hollises · Window Washing</div>
        </Card>
      </P>
      <P screen={4} delay={34} x={4} y={70} anchor="r"><StatusPill u={u} dot={C.lawn} text="14 paid this week" /></P>
    </AbsoluteFill>
  );
};

/* ---------- background motifs ---------- */
const Motifs: React.FC<{u: number; f: number}> = ({u, f}) => {
  const homeM = win(f, S[0], S[0] + 14, S[1] - 6, S[1] + 6);
  const jobsM = win(f, S[1] + 2, S[1] + 16, S[2] - 6, S[2] + 6);
  const routeM = win(f, S[2] + 2, S[2] + 16, S[3] - 6, S[3] + 6);
  const clientsM = win(f, S[3] + 2, S[3] + 16, S[4] - 6, S[4] + 6);
  const moneyM = win(f, S[4] + 2, S[4] + 16, END - 6, END + 6);
  const dots = [
    {s: 16, x: 6, y: 16, c: C.marigold, o: 0.12, ph: 0}, {s: 10, x: 84, y: 26, c: C.curb, o: 0.14, ph: 20},
    {s: 22, x: 82, y: 66, c: C.curb, o: 0.08, ph: 10}, {s: 8, x: 14, y: 66, c: C.marigold, o: 0.16, ph: 34}, {s: 6, x: 44, y: 8, c: C.curb, o: 0.16, ph: 6},
  ];
  const bars = [
    {x: 4, y: 20, w: 20, ph: 0}, {x: 74, y: 34, w: 22, ph: 40}, {x: 6, y: 74, w: 24, ph: 80}, {x: 70, y: 60, w: 18, ph: 20},
  ];
  const rings = [
    {x: 12, y: 24, s: 10, ph: 0}, {x: 82, y: 32, s: 8, ph: 30}, {x: 20, y: 70, s: 12, ph: 60}, {x: 80, y: 74, s: 9, ph: 90},
  ];
  const coins = [
    {x: 5, s: 9, c: C.lawn, ph: 0}, {x: 15, s: 6, c: C.curb, ph: 66}, {x: 86, s: 11, c: C.lawn, ph: 33},
    {x: 78, s: 7, c: C.curb, ph: 99}, {x: 33, s: 8, c: C.lawn, ph: 126}, {x: 66, s: 6, c: C.marigold, ph: 18},
  ];
  const cyc = FPS * 5.5;
  const routeProg = interpolate(f, [S[2] + 2, S[2] + 48], [0, 1], CL);
  const pins = [{x: 14, y: 18, d: 10}, {x: 15, y: 104, d: 22}, {x: 62, y: 152, d: 34}, {x: 84, y: 92, d: 28}];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {/* home: floating dots */}
      <AbsoluteFill style={{opacity: homeM}}>
        {dots.map((d, i) => (
          <div key={i} style={{position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: d.s * u, height: d.s * u, borderRadius: '50%', background: d.c, opacity: d.o, transform: `translateY(${Math.sin((f + d.ph) * 0.06) * 6}%)`}} />
        ))}
      </AbsoluteFill>
      {/* jobs: drifting job-row bars */}
      <AbsoluteFill style={{opacity: jobsM}}>
        {bars.map((b, i) => (
          <div key={i} style={{position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, width: b.w * u, height: 3.4 * u, borderRadius: 1.4 * u, border: `${0.3 * u}px solid ${C.curb}`, opacity: 0.12, transform: `translateY(${Math.sin((f + b.ph) * 0.05) * 8}%)`}} />
        ))}
      </AbsoluteFill>
      {/* route: line + dropping pins */}
      <AbsoluteFill style={{opacity: routeM}}>
        <svg viewBox="0 0 100 178" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', transform: `translateY(${Math.sin(f * 0.04) * 1.5}%)`}}>
          <path d="M14 18 C 10 55, 24 74, 15 104 C 7 134, 40 156, 62 152 C 86 148, 92 118, 84 92" stroke={C.curb} strokeWidth={2} fill="none" opacity={0.6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - routeProg} />
          {pins.map((p, i) => {
            const s = Math.min(1, Math.max(0, (f - (S[2] + p.d)) / 8));
            return <circle key={i} cx={p.x} cy={p.y} r={2.9} fill={C.curb} opacity={0.75 * s} style={{transform: `scale(${s})`, transformBox: 'fill-box', transformOrigin: 'center'}} />;
          })}
        </svg>
      </AbsoluteFill>
      {/* clients: location rings */}
      <AbsoluteFill style={{opacity: clientsM}}>
        {rings.map((r, i) => {
          const pulse = (((f + r.ph) * 0.9) % 60) / 60;
          return (
            <div key={i} style={{position: 'absolute', left: `${r.x}%`, top: `${r.y}%`}}>
              <div style={{width: r.s * u, height: r.s * u, borderRadius: '50%', border: `${0.35 * u}px solid ${C.marigold}`, opacity: 0.16, transform: `translateY(${Math.sin((f + r.ph) * 0.05) * 6}%)`}} />
              <div style={{position: 'absolute', top: 0, left: 0, width: r.s * u, height: r.s * u, borderRadius: '50%', border: `${0.35 * u}px solid ${C.curb}`, opacity: 0.18 * (1 - pulse), transform: `scale(${1 + pulse * 0.8})`}} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* money: rising coins */}
      <AbsoluteFill style={{opacity: moneyM}}>
        {coins.map((c, i) => {
          const t = ((((f + c.ph) % cyc) + cyc) % cyc) / cyc;
          const top = 104 - t * 120;
          const o = (t < 0.12 ? t / 0.12 : t > 0.85 ? (1 - t) / 0.15 : 1) * 0.22;
          return <div key={i} style={{position: 'absolute', left: `${c.x}%`, top: `${top}%`, fontFamily: BRIC, fontWeight: 800, fontSize: c.s * u, color: c.c, opacity: o}}>$</div>;
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- caption ---------- */
const CAPTIONS = [
  {label: 'HOME', t: ["Stop guessing what's", 'on your plate.'], d: "Weather, today's jobs, and what you're owed the second you open the app."},
  {label: 'JOBS', t: ['Every job', 'in one place.'], d: 'Track every status and catch rain warnings before they ruin a job.'},
  {label: 'ROUTE', t: ['Know exactly', 'where to go next.'], d: 'Tap Start Route. Your whole day, sequenced and mapped.'},
  {label: 'CLIENTS', t: ['Every customer', 'remembered.'], d: 'Gate codes, lot size, preferred time. Saved to every profile.'},
  {label: 'MONEY', t: ['Get paid before', 'the day ends.'], d: 'Invoice from the job site. See who owes you and mark paid in a tap.'},
];
const Caption: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  const idx = activeIndex(f);
  const start = S[idx];
  const c = CAPTIONS[idx];
  const labP = spring({frame: f - start, fps, config: {damping: 200}});
  return (
    <div style={{minHeight: 27 * u, display: 'flex', flexDirection: 'column', gap: 1.2 * u, alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 2}}>
      <div style={{opacity: labP, transform: `translateY(${(1 - labP) * 16}px)`, fontFamily: HANK, fontWeight: 700, fontSize: 2.4 * u, letterSpacing: '0.16em', color: C.curbDk}}>{c.label}</div>
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 7.6 * u, lineHeight: 0.98, letterSpacing: '-0.03em'}}>
        {c.t.map((line, k) => {
          const p = spring({frame: f - start - 3 - k * 4, fps, config: {damping: 200}});
          return (
            <span key={k} style={{display: 'block', overflow: 'hidden', paddingBottom: '0.05em'}}>
              <span style={{display: 'block', transform: `translateY(${(1 - p) * 110}%)`, color: k === c.t.length - 1 ? C.curbDk : C.sand}}>{line}</span>
            </span>
          );
        })}
      </div>
      <div style={{fontFamily: HANK, fontWeight: 500, fontSize: 3.4 * u, color: C.gravelDk, maxWidth: '88%', opacity: spring({frame: f - start - 8, fps, config: {damping: 200}})}}>{c.d}</div>
    </div>
  );
};

/* ---------- intro / endcard ---------- */
const Intro: React.FC<{u: number; f: number; fps: number}> = ({u, f, fps}) => {
  const op = f < 66 ? 1 : interpolate(f, [66, INTRO_OUT], [1, 0], CL);
  if (op <= 0) return null;
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
  const op = interpolate(f, [END, END + 12], [0, 1], CL);
  if (op <= 0) return null;
  const g = (d: number) => spring({frame: f - END - d, fps, config: {damping: 200}});
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
export const CurbTourFull: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const u = useU();
  return (
    <AbsoluteFill style={{background: C.asphalt, fontFamily: HANK}}>
      <Motifs u={u} f={f} />
      <AbsoluteFill style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: `${12 * u}px ${6 * u}px ${3 * u}px`, zIndex: 2}}>
        <Caption u={u} f={f} fps={fps} />
        <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', perspective: 1700}}>
          <Phone u={u} f={f} fps={fps} />
        </div>
      </AbsoluteFill>
      <Pills u={u} f={f} fps={fps} />
      <Intro u={u} f={f} fps={fps} />
      <Endcard u={u} f={f} fps={fps} />
    </AbsoluteFill>
  );
};
