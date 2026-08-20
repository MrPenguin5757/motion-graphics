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
import {wipe} from '@remotion/transitions/wipe';
import {slide} from '@remotion/transitions/slide';
import {loadFont} from '@remotion/fonts';

/* Storefront studio brand fonts (local woff2, no network at render time) */
const FRAU = 'Fraunces';
const FRAUI = 'FrauncesItalic';
const INTER = 'Inter';
const fontHandle = delayRender('load-fonts-storefront');
Promise.all([
  loadFont({family: FRAU, url: staticFile('fonts/fraunces-latin-700-normal.woff2'), weight: '700'}),
  loadFont({family: FRAU, url: staticFile('fonts/fraunces-latin-900-normal.woff2'), weight: '900'}),
  loadFont({family: FRAUI, url: staticFile('fonts/fraunces-latin-700-italic.woff2'), weight: '700'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-400-normal.woff2'), weight: '400'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-600-normal.woff2'), weight: '600'}),
  loadFont({family: INTER, url: staticFile('fonts/inter-latin-700-normal.woff2'), weight: '700'}),
])
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

/* Storefront palette */
const S = {
  green: '#3a5a40',
  greenDk: '#2f4a35',
  greenLt: '#5c7d62',
  terra: '#c07a4b',
  terraDk: '#a8623a',
  cream: '#faf8f4',
  cream2: '#f1ebdf',
  ink: '#1c1a17',
  inkMut: '#6f6a61',
  red: '#d64525',
  redLt: '#e86a4d',
};

export const FPS = 30;
const TR = 16;
const SEQ = [108, 120, 172, 86, 118];
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
      <defs>
        <clipPath id="awn">
          <path d="M24 20 L76 20 L88 43 L12 43 Z" />
        </clipPath>
      </defs>
      <rect x={19} y={41} width={62} height={47} rx={6} fill="#e4e7e1" />
      <g clipPath="url(#awn)">
        {cols.map((c, i) => (
          <rect key={i} x={x0 + (w / cols.length) * i} y={19} width={w / cols.length + 0.5} height={25} fill={c} />
        ))}
      </g>
      <rect x={42} y={58} width={16} height={30} rx={4} fill={S.green} />
    </svg>
  );
};

// small leaf mark used inside the recreated Verde site
const Leaf: React.FC<{size: number; color?: string}> = ({size, color = S.green}) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M20 4 C 9 4, 4 10, 4 19 C 13 20, 21 15, 20 4 Z" fill={color} />
    <path d="M7 17 C 11 13, 15 10, 18 8" stroke={S.cream} strokeWidth={1.1} fill="none" strokeLinecap="round" />
  </svg>
);

/* ---------- scene 1: the problem (crashing graph) ---------- */
const ProblemScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  // no build-in: the statement is on screen from frame 1; the graph crashes in.
  const draw = interpolate(frame, [2, 32], [1, 0], CL); // strokeDashoffset 1 -> 0
  const areaOp = interpolate(frame, [16, 34], [0, 1], CL);
  const pts = [[6, 9], [23, 17], [39, 13], [55, 29], [72, 35], [92, 50]];
  const poly = pts.map((p) => p.join(',')).join(' ');
  const dotAt = (i: number) => interpolate(frame, [2 + i * 5, 10 + i * 5], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: S.ink, flexDirection: 'column', justifyContent: 'flex-start', padding: `${11 * u}px ${8 * u}px ${8 * u}px`, fontFamily: INTER}}>
      <div style={{color: S.redLt, fontFamily: INTER, fontWeight: 600, fontSize: 2.7 * u, letterSpacing: '0.22em'}}>THE PROBLEM</div>
      <h1 style={{margin: `${1.6 * u}px 0 0`, fontFamily: FRAU, fontWeight: 900, fontSize: 9 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.cream}}>
        Losing customers<br /><span style={{color: S.terra}}>you never see.</span>
      </h1>
      <div style={{marginTop: 2.2 * u, fontFamily: INTER, fontWeight: 400, fontSize: 3.1 * u, lineHeight: 1.4, color: 'rgba(250,248,244,.62)', maxWidth: '92%'}}>
        A dated website turns them away before they ever reach out.
      </div>
      <div style={{flex: 1, marginTop: 3 * u, position: 'relative'}}>
        <div style={{position: 'absolute', top: 0, left: 0, fontFamily: INTER, fontWeight: 600, fontSize: 2 * u, letterSpacing: '0.14em', color: 'rgba(250,248,244,.5)'}}>NEW CUSTOMERS</div>
        <svg viewBox="0 0 100 58" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, top: 5 * u, width: '100%', height: `calc(100% - ${5 * u}px)`}}>
          {[14, 28, 42].map((y) => (<line key={y} x1={0} y1={y} x2={100} y2={y} stroke="rgba(250,248,244,.08)" strokeWidth={0.4} />))}
          <line x1={0} y1={56} x2={100} y2={56} stroke="rgba(250,248,244,.22)" strokeWidth={0.6} />
          <polygon points={`6,9 ${poly.split(' ').slice(1).join(' ')} 92,56 6,56`} fill={S.red} opacity={areaOp * 0.16} />
          <polyline points={poly} fill="none" stroke={S.red} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
          <g transform="translate(92,50)" opacity={interpolate(frame, [28, 36], [0, 1], CL)}>
            <path d="M0 0 L-6 -2.5 M0 0 L-2.5 -6.5" stroke={S.red} strokeWidth={2.4} strokeLinecap="round" fill="none" />
          </g>
          {pts.map((p, i) => (<circle key={i} cx={p[0]} cy={p[1]} r={1.6} fill={S.redLt} opacity={dotAt(i)} />))}
        </svg>
        <div style={{position: 'absolute', right: 0, top: 2 * u, display: 'flex', alignItems: 'center', gap: 1 * u, background: 'rgba(214,69,37,.16)', border: `1px solid ${S.red}`, color: S.redLt, borderRadius: 99, padding: `${0.9 * u}px ${1.8 * u}px`, fontFamily: INTER, fontWeight: 700, fontSize: 2.1 * u, opacity: interpolate(frame, [24, 34], [0, 1], CL)}}>
          <span style={{fontSize: 2.4 * u}}>▼</span> Trending down
        </div>
      </div>
    </AbsoluteFill>
  );
};

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

// chapter label that sits in the margin above the browser
const Chapter: React.FC<{u: number; children: React.ReactNode; color: string; bg: string}> = ({u, children, color, bg}) => (
  <div style={{position: 'absolute', top: 5 * u, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: bg, color, fontFamily: INTER, fontWeight: 700, fontSize: 2.3 * u, letterSpacing: '0.2em', padding: `${1 * u}px ${2.6 * u}px`, borderRadius: 99}}>{children}</div>
);

/* ---------- scene 2: the "before" site ---------- */
const BeforeSite: React.FC<{u: number}> = ({u}) => {
  const frame = useCurrentFrame();
  const mq = ((frame * 2.2) % 120);
  const blink = Math.sin(frame * 0.5) > 0;
  const tile = 'repeating-linear-gradient(45deg,#d9d9d4 0 8px,#cfcfca 8px 16px)';
  const tape = 'repeating-linear-gradient(45deg,#f2c400 0 14px,#1c1a17 14px 28px)';
  return (
    <div style={{position: 'absolute', inset: 0, background: '#d9d9d4', backgroundImage: tile, fontFamily: 'Comic Sans MS, "Comic Sans", cursive, sans-serif', color: '#222'}}>
      <div style={{height: 3.4 * u, backgroundImage: tape}} />
      <div style={{textAlign: 'center', padding: `${1.4 * u}px 0 0`}}>
        <div style={{fontFamily: 'Comic Sans MS, cursive, sans-serif', fontWeight: 700, fontSize: 5.4 * u, color: '#b5231d', textShadow: '2px 2px 0 #7a7a75'}}>Bob's Koffee Shak</div>
        <div style={{fontSize: 1.9 * u, color: '#555', marginTop: 0.4 * u}}>"the BEST coffee in town - est. sometime"</div>
        <div style={{height: 2, background: '#b5231d', margin: `${1.2 * u}px ${5 * u}px`}} />
      </div>
      <div style={{display: 'flex', gap: 1.6 * u, padding: `0 ${3 * u}px`}}>
        <div style={{flex: 1.5, border: `2px solid #b5231d`, background: '#fff', padding: `${1.4 * u}px ${1.6 * u}px`, fontSize: 1.75 * u, lineHeight: 1.4}}>
          <div style={{color: '#b5231d', fontWeight: 700, marginBottom: 0.6 * u}}>Welcome to our website!!</div>
          <div style={{color: '#444'}}>We sell coffee and some food too. Come by our shop at Somewhere Ave sometime.</div>
          <div style={{marginTop: 0.8 * u, color: '#444'}}><b style={{color: '#b5231d'}}>Hours:</b> Mon-Fri sometimes<br /><b style={{color: '#b5231d'}}>Phone:</b> call the shop</div>
          <div style={{marginTop: 1 * u, display: 'inline-block', background: '#f2c400', border: '2px solid #222', padding: `${0.6 * u}px ${1.2 * u}px`, fontWeight: 700, fontSize: 1.6 * u}}>CLICK HERE FOR MENU (PDF)</div>
        </div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 1.4 * u}}>
          {['photo coming soon', 'under construction'].map((t) => (
            <div key={t} style={{flex: 1, backgroundImage: 'repeating-linear-gradient(45deg,#c3c3be 0 10px,#b6b6b1 10px 20px)', border: '1px solid #999', display: 'grid', placeItems: 'center', color: '#666', fontSize: 1.7 * u}}>{t}</div>
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 3.6 * u, height: 3.2 * u, background: '#111', color: '#39ff14', display: 'flex', alignItems: 'center', overflow: 'hidden', fontFamily: 'monospace', fontSize: 1.9 * u, whiteSpace: 'nowrap'}}>
        <div style={{transform: `translateX(${100 - mq}%)`}}>★ UNDER CONSTRUCTION ★ You are visitor number 000001 ★ sign our guestbook ★ best viewed in Netscape ★</div>
      </div>
      <div style={{position: 'absolute', right: 3 * u, bottom: 8 * u, color: '#b5231d', fontWeight: 700, fontSize: 2.4 * u, opacity: blink ? 1 : 0.15, transform: 'rotate(-8deg)'}}>NEW!</div>
    </div>
  );
};

const BeforeScene: React.FC = () => {
  const u = useU();
  const s = useSpr(4);
  return (
    <AbsoluteFill style={{background: S.cream, alignItems: 'center', justifyContent: 'center', padding: `${9 * u}px ${6 * u}px`}}>
      <div style={{width: '100%', opacity: s, transform: `translateY(${(1 - s) * 4}%) scale(${0.97 + s * 0.03})`}}>
        <Browser u={u} url="bobskoffeeshak.com" bodyH={58}>
          <BeforeSite u={u} />
        </Browser>
      </div>
      <Chapter u={u} color="#fff" bg={S.ink}>BEFORE</Chapter>
    </AbsoluteFill>
  );
};

/* ---------- scene 3: the "after" site (Verde) ---------- */
const CafeArt: React.FC<{u: number}> = ({u}) => (
  <svg viewBox="0 0 300 96" preserveAspectRatio="xMidYMid slice" style={{width: '100%', height: '100%', display: 'block'}}>
    <rect width="300" height="96" fill="#ecdfca" />
    <circle cx="150" cy="46" r="42" fill="#e2c6a4" opacity="0.55" />
    {/* leaves, left */}
    <g fill="#5c7d62">
      <path d="M44 82 C 30 62, 40 40, 64 33 C 62 58, 56 74, 44 82 Z" />
      <path d="M44 82 C 54 64, 72 55, 92 56 C 80 74, 60 82, 44 82 Z" opacity="0.92" />
      <path d="M64 33 L44 82" stroke="#3a5a40" strokeWidth="1.1" opacity="0.5" />
    </g>
    {/* beans, right */}
    <g fill="#5a3a24">
      <g transform="translate(244,42) rotate(22)"><ellipse rx="8.5" ry="5.6" /><path d="M0 -5 C 3 -2, 3 2, 0 5" stroke="#ecdfca" strokeWidth="1.2" fill="none" /></g>
      <g transform="translate(262,58) rotate(-16)"><ellipse rx="8.5" ry="5.6" /><path d="M0 -5 C 3 -2, 3 2, 0 5" stroke="#ecdfca" strokeWidth="1.2" fill="none" /></g>
    </g>
    {/* steam */}
    <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.55">
      <path d="M139 22 C 134 15, 144 11, 139 4" />
      <path d="M151 22 C 146 15, 156 11, 151 4" />
      <path d="M163 22 C 158 15, 168 11, 163 4" />
    </g>
    {/* saucer */}
    <ellipse cx="150" cy="84" rx="54" ry="8" fill="#f5f1e8" />
    <ellipse cx="150" cy="83" rx="40" ry="5.4" fill="#e6dbc6" />
    {/* handle */}
    <path d="M180 48 C 197 48, 197 68, 178 68" stroke="#faf7f0" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    {/* cup + coffee */}
    <path d="M120 41 L180 41 L173 74 Q150 82 127 74 Z" fill="#faf7f0" />
    <ellipse cx="150" cy="41" rx="30" ry="6" fill="#5a3a24" />
    <ellipse cx="150" cy="40.5" rx="25" ry="4.4" fill="#402716" />
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
      {/* hero */}
      <div style={{background: S.cream, padding: `${3 * u}px ${3.4 * u}px ${3.4 * u}px`}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 1 * u}}>
            <Leaf size={3.2 * u} />
            <span style={{fontFamily: FRAU, fontWeight: 700, fontSize: 3 * u, color: S.green}}>Verde</span>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 1.8 * u, fontFamily: INTER, fontWeight: 500, fontSize: 1.7 * u, color: S.ink}}>
            <span>Menu</span><span>About</span><span>Gallery</span>
            <span style={{background: S.green, color: S.cream, borderRadius: 99, padding: `${0.7 * u}px ${1.7 * u}px`}}>Visit Us</span>
          </div>
        </div>
        <div style={{...rise(6), marginTop: 3 * u, fontFamily: INTER, fontWeight: 600, fontSize: 1.9 * u, letterSpacing: '0.14em', color: S.terra}}>COFFEE · BRUNCH · COMMUNITY</div>
        <div style={{...rise(10), fontFamily: FRAU, fontWeight: 900, fontSize: 8.4 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink, marginTop: 1.2 * u}}>
          Good <span style={{fontFamily: FRAUI, fontStyle: 'italic', color: S.terra}}>mornings</span> start here.
        </div>
        <div style={{...rise(16), marginTop: 1.6 * u, fontFamily: INTER, fontWeight: 400, fontSize: 2.2 * u, lineHeight: 1.4, color: S.inkMut, maxWidth: '86%'}}>
          Specialty coffee, fresh brunch, and house-made pastries, served in the coziest corner of Rivertown.
        </div>
        <div style={{...rise(22), display: 'flex', gap: 1.4 * u, marginTop: 2.2 * u}}>
          <span style={{background: S.terra, color: '#fff', fontFamily: INTER, fontWeight: 600, fontSize: 2 * u, padding: `${1.3 * u}px ${2.8 * u}px`, borderRadius: 99}}>View the Menu</span>
          <span style={{border: `1.5px solid ${S.ink}`, color: S.ink, fontFamily: INTER, fontWeight: 600, fontSize: 2 * u, padding: `${1.3 * u}px ${2.6 * u}px`, borderRadius: 99}}>Find Us</span>
        </div>
        <div style={{...rise(28), marginTop: 2.6 * u, height: 26 * u, borderRadius: 2.2 * u, overflow: 'hidden'}}><CafeArt u={u} /></div>
      </div>
      {/* section 2 */}
      <div style={{background: S.green, padding: `${3.4 * u}px ${3.4 * u}px ${4 * u}px`}}>
        <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.8 * u, letterSpacing: '0.14em', color: S.terra}}>THE MENU</div>
        <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 5.6 * u, color: S.cream, letterSpacing: '-0.02em', marginTop: 0.8 * u}}>House-made pastries</div>
        <div style={{display: 'flex', gap: 1.6 * u, marginTop: 2.4 * u}}>
          {[['Sourdough loaf', '$7'], ['Maple scone', '$4'], ['Almond croissant', '$5']].map(([n, p]) => (
            <div key={n} style={{flex: 1, background: 'rgba(250,248,244,.10)', borderRadius: 1.8 * u, padding: 1.8 * u}}>
              <div style={{height: 9 * u, borderRadius: 1.2 * u, background: 'rgba(192,122,75,.55)'}} />
              <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.7 * u, color: S.cream, marginTop: 1.2 * u}}>{n}</div>
              <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 2.2 * u, color: S.terra}}>{p}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AfterScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const s = useSpr(2);
  // hold hero, then scroll down to reveal the menu section
  const scroll = interpolate(frame, [64, 132], [0, 40], CL);
  return (
    <AbsoluteFill style={{background: S.cream, alignItems: 'center', justifyContent: 'center', padding: `${9 * u}px ${6 * u}px`}}>
      <div style={{width: '100%', opacity: s, transform: `translateY(${(1 - s) * 4}%) scale(${0.97 + s * 0.03})`}}>
        <Browser u={u} url="verde-cafe.xyz" bodyH={58}>
          <VerdeSite u={u} scroll={scroll} />
        </Browser>
      </div>
      <Chapter u={u} color={S.cream} bg={S.green}>AFTER</Chapter>
    </AbsoluteFill>
  );
};

/* ---------- scene 4: the offer ---------- */
const OfferScene: React.FC = () => {
  const u = useU();
  const mark = useSpr(2, 13, 0.7);
  const kick = useSpr(8);
  const h1 = useSpr(12);
  const h2 = useSpr(17);
  const sub = useSpr(26);
  const rise = (p: number) => ({display: 'block', transform: `translateY(${(1 - p) * 110}%)`});
  return (
    <AbsoluteFill style={{background: S.cream, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: `${8 * u}px`, fontFamily: INTER}}>
      <div style={{opacity: mark, transform: `scale(${0.7 + mark * 0.3})`, transformOrigin: 'left center', marginBottom: 2.6 * u}}><Awning size={10 * u} /></div>
      <div style={{opacity: kick, transform: `translateY(${(1 - kick) * 20}px)`, fontFamily: INTER, fontWeight: 600, fontSize: 2.6 * u, letterSpacing: '0.2em', color: S.terra}}>NO COST · NO OBLIGATION</div>
      <h1 style={{margin: `${1.4 * u}px 0 0`, fontFamily: FRAU, fontWeight: 900, fontSize: 9.4 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink}}>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={rise(h1)}>Get a free</span></span>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={{...rise(h2), color: S.terra}}>concept site.</span></span>
      </h1>
      <div style={{opacity: sub, transform: `translateY(${(1 - sub) * 18}px)`, marginTop: 2.6 * u, fontFamily: INTER, fontWeight: 400, fontSize: 3.2 * u, lineHeight: 1.4, color: S.inkMut, maxWidth: '94%'}}>
        I design it for your business first. You only pay when you are ready to launch.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- scene 5: end card ---------- */
const EndScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const mark = useSpr(4, 13, 0.7);
  const wm = useSpr(16);
  const under = useSpr(24);
  const url = useSpr(30);
  const tag = useSpr(38);
  const up = (p: number, dy = 24) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
  return (
    <AbsoluteFill style={{background: S.cream, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 2.6 * u, fontFamily: INTER}}>
      <div style={{opacity: mark, transform: `scale(${0.6 + mark * 0.4})`}}><Awning size={22 * u} /></div>
      <div style={{...up(wm, 0), fontFamily: FRAU, fontWeight: 900, fontSize: 11 * u, letterSpacing: '-0.02em', color: S.green, lineHeight: 1}}>Storefront</div>
      <div style={{height: 0.9 * u, width: 22 * u, background: S.terra, borderRadius: 99, transform: `scaleX(${under})`, transformOrigin: 'center'}} />
      <div style={{...up(url), fontFamily: INTER, fontWeight: 600, fontSize: 3.4 * u, letterSpacing: '0.02em', color: S.terra}}>storefrontdesigns.xyz</div>
      <div style={{...up(tag), fontFamily: INTER, fontWeight: 400, fontSize: 2.6 * u, color: S.inkMut, maxWidth: '80%'}}>Free concept sites for Ooltewah &amp; Chattanooga businesses.</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const StorefrontAd: React.FC = () => {
  const {width, height} = useVideoConfig();
  const t = linearTiming({durationInFrames: TR});
  return (
    <AbsoluteFill style={{background: S.cream}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEQ[0]}><ProblemScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[1]}><BeforeScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[2]}><AfterScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[3]}><OfferScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[4]}><EndScene /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
