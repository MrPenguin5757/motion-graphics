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
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {wipe} from '@remotion/transitions/wipe';
import {loadFont} from '@remotion/fonts';

const FRAU = 'Fraunces';
const FRAUI = 'FrauncesItalic';
const INTER = 'Inter';
const fontHandle = delayRender('load-fonts-lookedup');
Promise.all([
  loadFont({family: FRAU, url: staticFile('fonts/fraunces-latin-700-normal.woff2'), weight: '700'}),
  loadFont({family: FRAU, url: staticFile('fonts/fraunces-latin-900-normal.woff2'), weight: '900'}),
  loadFont({family: FRAUI, url: staticFile('fonts/fraunces-latin-700-italic.woff2'), weight: '700'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-400-normal.woff2'), weight: '400'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-600-normal.woff2'), weight: '600'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-700-normal.woff2'), weight: '700'}),
]).then(() => continueRender(fontHandle)).catch(() => continueRender(fontHandle));

const S = {
  green: '#3a5a40', greenDk: '#2f4a35', greenLt: '#5c7d62', terra: '#c07a4b', terraDk: '#a8623a',
  cream: '#faf8f4', cream2: '#f1ebdf', ink: '#1c1a17', inkMut: '#6f6a61', red: '#d64525', redLt: '#e86a4d',
};

export const FPS = 30;
const TR = 16;
const SEQ = [90, 176, 168, 126];
export const DURATION = SEQ.reduce((a, b) => a + b, 0) - TR * (SEQ.length - 1);

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

/* ---------- brand marks ---------- */
const Awning: React.FC<{size: number}> = ({size}) => {
  const cols = [S.green, S.terra, S.green, S.terra, S.green, S.terra, S.green];
  const x0 = 12, x1 = 88, w = x1 - x0;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><clipPath id="awn2"><path d="M24 20 L76 20 L88 43 L12 43 Z" /></clipPath></defs>
      <rect x={19} y={41} width={62} height={47} rx={6} fill="#e4e7e1" />
      <g clipPath="url(#awn2)">{cols.map((c, i) => (<rect key={i} x={x0 + (w / cols.length) * i} y={19} width={w / cols.length + 0.5} height={25} fill={c} />))}</g>
      <rect x={42} y={58} width={16} height={30} rx={4} fill={S.green} />
    </svg>
  );
};
const Leaf: React.FC<{size: number; color?: string}> = ({size, color = S.green}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M20 4 C 9 4, 4 10, 4 19 C 13 20, 21 15, 20 4 Z" fill={color} />
    <path d="M7 17 C 11 13, 15 10, 18 8" stroke={S.cream} strokeWidth={1.1} fill="none" strokeLinecap="round" />
  </svg>
);
const Star: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" fill={color} /></svg>
);

/* ---------- browser chrome ---------- */
const Browser: React.FC<{u: number; url: string; bodyH: number; children: React.ReactNode}> = ({u, url, bodyH, children}) => (
  <div style={{width: '100%', borderRadius: 2.6 * u, overflow: 'hidden', background: '#fff', boxShadow: `0 ${2.4 * u}px ${7 * u}px rgba(28,26,23,.28)`}}>
    <div style={{height: 5 * u, background: '#e7e3db', display: 'flex', alignItems: 'center', gap: 0.9 * u, padding: `0 ${2 * u}px`}}>
      {['#e0685c', '#e6b34d', '#63b063'].map((c) => (<span key={c} style={{width: 1.5 * u, height: 1.5 * u, borderRadius: '50%', background: c}} />))}
      <span style={{marginLeft: 1.4 * u, flex: 1, maxWidth: '74%', background: '#fff', borderRadius: 99, fontFamily: INTER, fontSize: 1.7 * u, color: '#9a948a', padding: `${0.6 * u}px ${1.7 * u}px`, whiteSpace: 'nowrap', overflow: 'hidden'}}>{url}</span>
    </div>
    <div style={{position: 'relative', height: bodyH * u, overflow: 'hidden'}}>{children}</div>
  </div>
);

/* ---------- the thin search result (no website) ---------- */
const SearchResult: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const panel = useSpr(6, 18, 0.8);
  const noSite = interpolate(frame, [44, 58], [0, 1], CL);
  const row = (d: number) => {
    const p = spring({frame: frame - d, fps: 30, config: {damping: 200}});
    return {opacity: p, transform: `translateY(${(1 - p) * 2 * u}px)`};
  };
  const actionBtn = (label: string, disabled = false) => (
    <div style={{flex: 1, textAlign: 'center', fontFamily: INTER, fontWeight: 600, fontSize: 1.7 * u, padding: `${1.1 * u}px 0`, borderRadius: 99, border: `1.4px solid ${disabled ? 'rgba(214,69,37,.5)' : 'rgba(58,90,64,.5)'}`, color: disabled ? S.red : S.green, background: disabled ? 'rgba(214,69,37,.06)' : 'transparent', opacity: disabled ? 0.5 + 0.5 * noSite : 1, position: 'relative'}}>
      {disabled ? 'No website' : label}
    </div>
  );
  return (
    <div style={{position: 'absolute', inset: 0, background: '#fff', fontFamily: INTER, color: S.ink, padding: 2 * u}}>
      {/* search bar */}
      <div style={{background: '#f1f0ec', borderRadius: 99, padding: `${1.1 * u}px ${2 * u}px`, display: 'flex', alignItems: 'center', gap: 1.2 * u}}>
        <svg width={2.4 * u} height={2.4 * u} viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#9a948a" strokeWidth="2.4" /><line x1="15.5" y1="15.5" x2="21" y2="21" stroke="#9a948a" strokeWidth="2.4" strokeLinecap="round" /></svg>
        <span style={{fontSize: 2 * u, color: S.ink}}>verde cafe ooltewah</span>
      </div>
      {/* mini map */}
      <div style={{marginTop: 1.6 * u, height: 11 * u, borderRadius: 1.6 * u, overflow: 'hidden', position: 'relative', background: '#eef0ea'}}>
        {[3, 6, 9].map((y) => <div key={'h' + y} style={{position: 'absolute', left: 0, right: 0, top: y * u, height: 0.5 * u, background: '#e0e3db'}} />)}
        {[8, 18, 28].map((x) => <div key={'v' + x} style={{position: 'absolute', top: 0, bottom: 0, left: x * u, width: 0.5 * u, background: '#e0e3db'}} />)}
        <div style={{position: 'absolute', left: '52%', top: '42%'}}><svg width={4 * u} height={4 * u} viewBox="0 0 24 24"><path d="M12 2 C7 2 3 6 3 11 C3 17 12 22 12 22 C12 22 21 17 21 11 C21 6 17 2 12 2 Z" fill={S.terra} /><circle cx="12" cy="11" r="3.4" fill="#fff" /></svg></div>
      </div>
      {/* business panel */}
      <div style={{marginTop: 1.8 * u, opacity: panel, transform: `translateY(${(1 - panel) * 3 * u}px)`}}>
        <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 3.6 * u, color: S.ink}}>Verde Cafe</div>
        <div style={{...row(14), display: 'flex', alignItems: 'center', gap: 0.8 * u, marginTop: 0.6 * u}}>
          <span style={{fontFamily: INTER, fontWeight: 700, fontSize: 2 * u, color: S.terraDk}}>4.6</span>
          {[0, 1, 2, 3, 4].map((i) => <Star key={i} size={2.1 * u} color={S.terra} />)}
          <span style={{fontFamily: INTER, fontSize: 1.8 * u, color: S.inkMut}}>(38)</span>
        </div>
        <div style={{...row(18), fontFamily: INTER, fontSize: 1.9 * u, color: S.inkMut, marginTop: 0.4 * u}}>Coffee shop · Ooltewah, TN</div>
        <div style={{...row(24), display: 'flex', gap: 1.2 * u, marginTop: 1.8 * u}}>
          {actionBtn('Call')}
          {actionBtn('Directions')}
          {actionBtn('', true)}
        </div>
        {/* stale social row */}
        <div style={{...row(34), marginTop: 2 * u, borderTop: '1px solid #eee', paddingTop: 1.6 * u, display: 'flex', gap: 1.4 * u, alignItems: 'flex-start'}}>
          <div style={{width: 6 * u, height: 6 * u, borderRadius: 1.2 * u, background: '#e9ecf3', display: 'grid', placeItems: 'center', flexShrink: 0}}>
            <svg width={3.4 * u} height={3.4 * u} viewBox="0 0 24 24"><path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8.2V14h2.3v7z" fill="#8a93a6" /></svg>
          </div>
          <div>
            <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.9 * u, color: S.ink}}>Verde Cafe · Facebook</div>
            <div style={{fontFamily: INTER, fontSize: 1.7 * u, color: S.inkMut, marginTop: 0.3 * u, lineHeight: 1.35}}>"Closed for the season, see you soon!"</div>
            <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: S.red, marginTop: 0.5 * u}}>Last post · 2 years ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------- the real site (Verde) ---------- */
const CafeArt: React.FC = () => (
  <svg viewBox="0 0 300 96" preserveAspectRatio="xMidYMid slice" style={{width: '100%', height: '100%', display: 'block'}}>
    <rect width="300" height="96" fill="#ecdfca" />
    <circle cx="150" cy="46" r="42" fill="#e2c6a4" opacity="0.55" />
    <g fill="#5c7d62"><path d="M44 82 C 30 62, 40 40, 64 33 C 62 58, 56 74, 44 82 Z" /><path d="M44 82 C 54 64, 72 55, 92 56 C 80 74, 60 82, 44 82 Z" opacity="0.92" /></g>
    <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.55"><path d="M139 22 C 134 15, 144 11, 139 4" /><path d="M151 22 C 146 15, 156 11, 151 4" /><path d="M163 22 C 158 15, 168 11, 163 4" /></g>
    <ellipse cx="150" cy="84" rx="54" ry="8" fill="#f5f1e8" /><ellipse cx="150" cy="83" rx="40" ry="5.4" fill="#e6dbc6" />
    <path d="M180 48 C 197 48, 197 68, 178 68" stroke="#faf7f0" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    <path d="M120 41 L180 41 L173 74 Q150 82 127 74 Z" fill="#faf7f0" /><ellipse cx="150" cy="41" rx="30" ry="6" fill="#5a3a24" /><ellipse cx="150" cy="40.5" rx="25" ry="4.4" fill="#402716" />
  </svg>
);
const VerdeSite: React.FC<{u: number; scroll: number}> = ({u, scroll}) => {
  const frame = useCurrentFrame();
  const rise = (d: number) => {
    const p = spring({frame: frame - d, fps: 30, config: {damping: 200}});
    return {opacity: p, transform: `translateY(${(1 - p) * 3 * u}px)`};
  };
  return (
    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${-scroll * u}px)`}}>
      <div style={{background: S.cream, padding: `${3 * u}px ${3.4 * u}px ${3.4 * u}px`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 1 * u}}><Leaf size={3.2 * u} /><span style={{fontFamily: FRAU, fontWeight: 700, fontSize: 3 * u, color: S.green}}>Verde</span></div>
          <div style={{display: 'flex', alignItems: 'center', gap: 1.8 * u, fontFamily: INTER, fontWeight: 500, fontSize: 1.7 * u, color: S.ink}}><span>Menu</span><span>About</span><span style={{background: S.green, color: S.cream, borderRadius: 99, padding: `${0.7 * u}px ${1.7 * u}px`}}>Visit Us</span></div>
        </div>
        <div style={{...rise(6), marginTop: 3 * u, fontFamily: INTER, fontWeight: 600, fontSize: 1.9 * u, letterSpacing: '0.14em', color: S.terra}}>OPEN TODAY · 7AM–3PM</div>
        <div style={{...rise(10), fontFamily: FRAU, fontWeight: 900, fontSize: 8.4 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink, marginTop: 1.2 * u}}>Good <span style={{fontFamily: FRAUI, fontStyle: 'italic', color: S.terra}}>mornings</span> start here.</div>
        <div style={{...rise(16), marginTop: 1.6 * u, fontFamily: INTER, fontWeight: 400, fontSize: 2.2 * u, lineHeight: 1.4, color: S.inkMut, maxWidth: '86%'}}>Specialty coffee, fresh brunch, and house-made pastries in the heart of Ooltewah.</div>
        <div style={{...rise(22), display: 'flex', gap: 1.4 * u, marginTop: 2.2 * u}}>
          <span style={{background: S.terra, color: '#fff', fontFamily: INTER, fontWeight: 600, fontSize: 2 * u, padding: `${1.3 * u}px ${2.8 * u}px`, borderRadius: 99}}>View the Menu</span>
          <span style={{border: `1.5px solid ${S.ink}`, color: S.ink, fontFamily: INTER, fontWeight: 600, fontSize: 2 * u, padding: `${1.3 * u}px ${2.6 * u}px`, borderRadius: 99}}>Find Us</span>
        </div>
        <div style={{...rise(28), marginTop: 2.6 * u, height: 26 * u, borderRadius: 2.2 * u, overflow: 'hidden'}}><CafeArt /></div>
      </div>
      <div style={{background: S.green, padding: `${3.4 * u}px ${3.4 * u}px ${4 * u}px`}}>
        <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.8 * u, letterSpacing: '0.14em', color: S.terra}}>HOURS &amp; VISIT</div>
        <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 5.6 * u, color: S.cream, letterSpacing: '-0.02em', marginTop: 0.8 * u}}>Come say hello.</div>
        <div style={{display: 'flex', gap: 1.6 * u, marginTop: 2.4 * u}}>
          {[['Mon–Fri', '7–3'], ['Saturday', '8–4'], ['Sunday', '8–2']].map(([n, p]) => (
            <div key={n} style={{flex: 1, background: 'rgba(250,248,244,.10)', borderRadius: 1.8 * u, padding: 1.8 * u}}>
              <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.7 * u, color: S.cream}}>{n}</div>
              <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 2.6 * u, color: S.terra}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- framed browser scene ---------- */
const FramedScene: React.FC<{u: number; top: React.ReactNode; url: string; chip: {t: string; bg: string; fg: string}; children: React.ReactNode; below: React.ReactNode}> = ({u, top, url, chip, children, below}) => {
  const s = useSpr(3);
  const b = useSpr(14);
  return (
    <AbsoluteFill style={{background: S.cream, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: `${7 * u}px ${6 * u}px`, gap: 3 * u}}>
      <div style={{opacity: s, transform: `translateY(${(1 - s) * 14}px)`, textAlign: 'center'}}>{top}</div>
      <div style={{width: '100%', position: 'relative', opacity: s, transform: `translateY(${(1 - s) * 3}%) scale(${0.97 + s * 0.03})`}}>
        <div style={{position: 'absolute', top: -2.4 * u, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: chip.bg, color: chip.fg, fontFamily: INTER, fontWeight: 700, fontSize: 2.1 * u, letterSpacing: '0.18em', padding: `${0.9 * u}px ${2.4 * u}px`, borderRadius: 99}}>{chip.t}</div>
        <Browser u={u} url={url} bodyH={58}>{children}</Browser>
      </div>
      <div style={{opacity: b, transform: `translateY(${(1 - b) * 14}px)`, textAlign: 'center'}}>{below}</div>
    </AbsoluteFill>
  );
};

/* ---------- scenes ---------- */
const HookScene: React.FC = () => {
  const u = useU();
  const kick = useSpr(2);
  const h = useSpr(8);
  const sub = useSpr(22);
  return (
    <AbsoluteFill style={{background: S.ink, flexDirection: 'column', justifyContent: 'center', padding: `0 ${8 * u}px`, fontFamily: INTER}}>
      <div style={{opacity: kick, transform: `translateY(${(1 - kick) * 16}px)`, color: S.terra, fontWeight: 600, fontSize: 2.7 * u, letterSpacing: '0.22em'}}>8:47 PM · TONIGHT</div>
      <h1 style={{opacity: h, transform: `translateY(${(1 - h) * 20}px)`, margin: `${1.8 * u}px 0 0`, fontFamily: FRAU, fontWeight: 900, fontSize: 9.6 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.cream}}>Someone just<br /><span style={{color: S.terra}}>looked you up.</span></h1>
      <div style={{opacity: sub, transform: `translateY(${(1 - sub) * 16}px)`, marginTop: 2.4 * u, fontFamily: INTER, fontWeight: 400, fontSize: 3.2 * u, lineHeight: 1.4, color: 'rgba(250,248,244,.62)'}}>Here is what they found.</div>
    </AbsoluteFill>
  );
};

const SearchScene: React.FC = () => {
  const u = useU();
  return (
    <FramedScene
      u={u}
      url="google.com"
      chip={{t: 'WHAT THEY FIND', bg: S.ink, fg: '#fff'}}
      top={<div style={{fontFamily: FRAU, fontWeight: 900, fontSize: 6.2 * u, color: S.ink, letterSpacing: '-0.02em', lineHeight: 1.0}}>A page from <span style={{fontFamily: FRAUI, fontStyle: 'italic', color: S.terra}}>2022.</span></div>}
      below={<div style={{fontFamily: INTER, fontWeight: 400, fontSize: 2.8 * u, color: S.inkMut}}>No website. No hours. Nowhere to go.</div>}
    >
      <SearchResult u={u} />
    </FramedScene>
  );
};

const FixScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [62, 132], [0, 40], CL);
  return (
    <FramedScene
      u={u}
      url="verde-cafe.xyz"
      chip={{t: 'WHAT WE BUILD', bg: S.green, fg: S.cream}}
      top={<div style={{fontFamily: FRAU, fontWeight: 900, fontSize: 6.2 * u, color: S.ink, letterSpacing: '-0.02em', lineHeight: 1.0}}>So we build you a <span style={{fontFamily: FRAUI, fontStyle: 'italic', color: S.green}}>home.</span></div>}
      below={<div style={{fontFamily: INTER, fontWeight: 400, fontSize: 2.8 * u, color: S.inkMut}}>Hours, menu, and a reason to come in.</div>}
    >
      <VerdeSite u={u} scroll={scroll} />
    </FramedScene>
  );
};

const CtaScene: React.FC = () => {
  const u = useU();
  const mark = useSpr(2, 13, 0.7);
  const kick = useSpr(10);
  const h1 = useSpr(14);
  const h2 = useSpr(19);
  const url = useSpr(30);
  const tag = useSpr(38);
  const up = (p: number, dy = 20) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
  const rise = (p: number) => ({display: 'block', transform: `translateY(${(1 - p) * 110}%)`});
  return (
    <AbsoluteFill style={{background: S.cream, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: `${8 * u}px`, fontFamily: INTER}}>
      <div style={{opacity: mark, transform: `scale(${0.7 + mark * 0.3})`, transformOrigin: 'left center', marginBottom: 2.6 * u}}><Awning size={10 * u} /></div>
      <div style={{...up(kick), color: S.terra, fontWeight: 600, fontSize: 2.6 * u, letterSpacing: '0.2em'}}>SEE IT BEFORE YOU PAY</div>
      <h1 style={{margin: `${1.4 * u}px 0 0`, fontFamily: FRAU, fontWeight: 900, fontSize: 9 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink}}>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={rise(h1)}>Free concept.</span></span>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={{...rise(h2), color: S.terra}}>No deposit.</span></span>
      </h1>
      <div style={{...up(url), marginTop: 2.6 * u, fontFamily: INTER, fontWeight: 600, fontSize: 3.4 * u, color: S.green}}>storefrontdesigns.xyz</div>
      <div style={{...up(tag), marginTop: 1.2 * u, fontFamily: INTER, fontWeight: 400, fontSize: 2.6 * u, color: S.inkMut, maxWidth: '92%'}}>Websites for Ooltewah &amp; Chattanooga businesses.</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const StorefrontLookedUp: React.FC = () => {
  const t = linearTiming({durationInFrames: TR});
  return (
    <AbsoluteFill style={{background: S.cream}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEQ[0]}><HookScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[1]}><SearchScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[2]}><FixScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[3]}><CtaScene /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
