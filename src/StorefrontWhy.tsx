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
import {loadFont} from '@remotion/fonts';

const FRAU = 'Fraunces';
const FRAUI = 'FrauncesItalic';
const INTER = 'Inter';
const fontHandle = delayRender('load-fonts-storefront-why');
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

const S = {
  green: '#3a5a40',
  greenDk: '#2f4a35',
  terra: '#c07a4b',
  cream: '#faf8f4',
  ink: '#1c1a17',
  inkMut: '#6f6a61',
  red: '#d64525',
  gold: '#e0a63c',
};

export const FPS = 30;
const TR = 11; // snappier transitions
// picture-first, room left for a voiceover; retimes easily when the VO arrives
const SEQ = [96, 156, 182, 122];
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

const Awning: React.FC<{size: number}> = ({size}) => {
  const cols = [S.green, S.terra, S.green, S.terra, S.green, S.terra, S.green];
  const x0 = 12, x1 = 88, w = x1 - x0;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><clipPath id="awnW"><path d="M24 20 L76 20 L88 43 L12 43 Z" /></clipPath></defs>
      <rect x={19} y={41} width={62} height={47} rx={6} fill="#e4e7e1" />
      <g clipPath="url(#awnW)">{cols.map((c, i) => (<rect key={i} x={x0 + (w / cols.length) * i} y={19} width={w / cols.length + 0.5} height={25} fill={c} />))}</g>
      <rect x={42} y={58} width={16} height={30} rx={4} fill={S.green} />
    </svg>
  );
};

const Stars: React.FC<{u: number; s?: number}> = ({u, s = 1.7}) => (
  <span style={{display: 'inline-flex', gap: 0.2 * u}}>
    {Array.from({length: 5}).map((_, i) => (
      <svg key={i} width={s * u} height={s * u} viewBox="0 0 24 24" fill={S.gold}><path d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.8 6.1 20.7l1.3-6.6L2.5 9.5l6.6-.8z" /></svg>
    ))}
  </span>
);

const Phone: React.FC<{u: number; w: number; children: React.ReactNode}> = ({u, w, children}) => (
  <div style={{width: w * u, background: S.ink, borderRadius: 5 * u, padding: 1.2 * u, boxShadow: `0 ${2.4 * u}px ${7 * u}px rgba(28,26,23,.3)`}}>
    <div style={{background: '#f3f0ea', borderRadius: 4 * u, overflow: 'hidden'}}>{children}</div>
  </div>
);

/* ---------- 0. hook ---------- */
const HookScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const p1 = useSpr(0, 12, 0.6);
  const p2 = useSpr(4, 12, 0.6);
  const line = (p: number) => ({display: 'block', opacity: interpolate(p, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(p, 1)) * 16}%) scale(${0.94 + Math.min(p, 1) * 0.06})`, transformOrigin: 'left center'});
  const draw = interpolate(frame, [6, 40], [1, 0], CL);
  const areaOp = interpolate(frame, [22, 42], [0, 1], CL);
  const pts = [[6, 10], [24, 20], [40, 15], [56, 32], [74, 38], [94, 54]];
  const poly = pts.map((p) => p.join(',')).join(' ');
  const dotAt = (i: number) => interpolate(frame, [6 + i * 5, 14 + i * 5], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: S.ink, flexDirection: 'column', justifyContent: 'flex-start', padding: `${9 * u}px ${8 * u}px ${7 * u}px`, fontFamily: INTER}}>
      <h1 style={{margin: 0, fontFamily: FRAU, fontWeight: 900, fontSize: 8 * u, lineHeight: 0.98, letterSpacing: '-0.02em', color: S.cream}}>
        <span style={line(p1)}>You're losing</span>
        <span style={{...line(p2), color: S.terra}}>customers.</span>
      </h1>
      <div style={{flex: 1, marginTop: 3.4 * u, position: 'relative'}}>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          {[15, 30, 45].map((y) => (<line key={y} x1={0} y1={y} x2={100} y2={y} stroke="rgba(250,248,244,.08)" strokeWidth={0.4} />))}
          <line x1={0} y1={58} x2={100} y2={58} stroke="rgba(250,248,244,.22)" strokeWidth={0.6} />
          <polygon points={`6,10 ${poly.split(' ').slice(1).join(' ')} 94,58 6,58`} fill={S.red} opacity={areaOp * 0.18} />
          <polyline points={poly} fill="none" stroke={S.red} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
          <g transform="translate(94,54)" opacity={interpolate(frame, [34, 42], [0, 1], CL)}>
            <path d="M0 0 L-6.5 -2.5 M0 0 L-2.5 -6.5" stroke={S.red} strokeWidth={2.6} strokeLinecap="round" fill="none" />
          </g>
          {pts.map((p, i) => (<circle key={i} cx={p[0]} cy={p[1]} r={1.7} fill="#e86a4d" opacity={dotAt(i)} />))}
        </svg>
        <div style={{position: 'absolute', right: 0, top: 1 * u, display: 'flex', alignItems: 'center', gap: 1 * u, background: 'rgba(214,69,37,.16)', border: `1px solid ${S.red}`, color: '#e86a4d', borderRadius: 99, padding: `${0.9 * u}px ${1.8 * u}px`, fontFamily: INTER, fontWeight: 700, fontSize: 2.1 * u, opacity: interpolate(frame, [30, 40], [0, 1], CL)}}>
          <span style={{fontSize: 2.4 * u}}>▼</span> Every day
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 1. the search ---------- */
const ResultCard: React.FC<{u: number; name: string; meta: string; hasSite: boolean; ring?: number}> = ({u, name, meta, hasSite, ring = 0}) => (
  <div style={{background: '#fff', borderRadius: 2 * u, padding: `${1.8 * u}px ${2 * u}px`, border: ring > 0.5 ? `${0.35 * u}px solid ${S.terra}` : '1px solid rgba(28,26,23,.06)', transform: `scale(${1 + ring * 0.02})`}}>
    <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 2.5 * u, color: S.ink}}>{name}</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 0.8 * u, marginTop: 0.5 * u}}>
      {hasSite ? <Stars u={u} /> : <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.7 * u, color: '#b7b2a8'}}>No reviews</span>}
      <span style={{fontFamily: INTER, fontWeight: 500, fontSize: 1.7 * u, color: S.inkMut}}>{meta}</span>
    </div>
    <div style={{display: 'flex', gap: 1 * u, marginTop: 1.4 * u}}>
      <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: S.green, border: `1px solid ${S.green}`, borderRadius: 99, padding: `${0.5 * u}px ${1.5 * u}px`}}>Directions</span>
      {hasSite
        ? <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: '#fff', background: S.green, borderRadius: 99, padding: `${0.5 * u}px ${1.6 * u}px`}}>Website</span>
        : <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: '#c0392b', background: 'rgba(214,69,37,.10)', borderRadius: 99, padding: `${0.5 * u}px ${1.5 * u}px`}}>No website</span>}
    </div>
  </div>
);

const SearchScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const head = useSpr(3);
  const s = useSpr(2);
  const card = (d: number) => spring({frame: frame - d, fps: 30, config: {damping: 200}});
  const tap = interpolate(frame, [70, 80, 92], [0, 1, 0], CL);
  const chose = interpolate(frame, [84, 96], [0, 1], CL);
  const cap = interpolate(frame, [104, 116], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: S.cream, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.6 * u, padding: `${5 * u}px`, fontFamily: INTER}}>
      <div style={{opacity: head, transform: `translateY(${(1 - head) * 16}px)`, textAlign: 'center', fontFamily: FRAU, fontWeight: 900, fontSize: 5.4 * u, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1.0}}>They Google you first.</div>
      <div style={{width: 52 * u, opacity: s, transform: `translateY(${(1 - s) * 4}%) scale(${0.97 + s * 0.03})`}}>
        <Phone u={u} w={52}>
          <div style={{background: '#fff', margin: `${2 * u}px ${2 * u}px ${1.4 * u}px`, borderRadius: 99, display: 'flex', alignItems: 'center', gap: 1.2 * u, padding: `${1.3 * u}px ${2 * u}px`, boxShadow: '0 1px 4px rgba(28,26,23,.08)'}}>
            <svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none" stroke={S.inkMut} strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" /></svg>
            <span style={{fontFamily: INTER, fontWeight: 500, fontSize: 2 * u, color: S.ink}}>coffee shop near me</span>
          </div>
          <div style={{height: 12 * u, margin: `0 ${2 * u}px ${1.6 * u}px`, borderRadius: 2 * u, background: '#dfe6db', position: 'relative', overflow: 'hidden'}}>
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
              <path d="M0 22 L40 22 L40 4" stroke="#c3cebd" strokeWidth="2" fill="none" />
              <path d="M62 0 L62 18 L100 18" stroke="#c3cebd" strokeWidth="2" fill="none" />
            </svg>
            {[[26, 16], [58, 10], [78, 20]].map(([x, y], i) => (
              <svg key={i} width={3.2 * u} height={3.2 * u} viewBox="0 0 24 24" style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-100%)'}} fill={i === 2 ? '#b7b2a8' : S.terra}><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 8 12 8 12s8-6.6 8-12c0-4.4-3.6-8-8-8z" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>
            ))}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 1.4 * u, padding: `0 ${2 * u}px ${2.4 * u}px`}}>
            <div style={{opacity: card(8), transform: `translateY(${(1 - card(8)) * 10}px)`, position: 'relative'}}>
              <ResultCard u={u} name="Rivertown Roasters" meta="· Open now" hasSite ring={chose} />
              <div style={{position: 'absolute', right: 6 * u, top: '50%', width: 7 * u, height: 7 * u, borderRadius: '50%', background: 'rgba(192,122,75,.45)', transform: `translate(-50%,-50%) scale(${0.6 + tap * 0.9})`, opacity: tap}} />
            </div>
            <div style={{opacity: card(14), transform: `translateY(${(1 - card(14)) * 10}px)`}}><ResultCard u={u} name="Verde Cafe" meta="· Open now" hasSite /></div>
            <div style={{opacity: card(20), transform: `translateY(${(1 - card(20)) * 10}px)`}}><ResultCard u={u} name="Your Shop" meta="· Hours unknown" hasSite={false} /></div>
          </div>
        </Phone>
      </div>
      <div style={{textAlign: 'center', opacity: cap, transform: `translateY(${(1 - cap) * 14}px)`, fontFamily: INTER, fontWeight: 500, fontSize: 3 * u, color: S.inkMut}}>
        No website, no reason to pick you.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2. your site + benefit chips ---------- */
const CafeArt: React.FC = () => (
  <svg viewBox="0 0 300 96" preserveAspectRatio="xMidYMid slice" style={{width: '100%', height: '100%', display: 'block'}}>
    <rect width="300" height="96" fill="#ecdfca" />
    <circle cx="150" cy="46" r="42" fill="#e2c6a4" opacity="0.55" />
    <g fill="#5c7d62"><path d="M44 82 C 30 62, 40 40, 64 33 C 62 58, 56 74, 44 82 Z" /><path d="M44 82 C 54 64, 72 55, 92 56 C 80 74, 60 82, 44 82 Z" opacity="0.92" /></g>
    <g fill="#5a3a24"><g transform="translate(244,42) rotate(22)"><ellipse rx="8.5" ry="5.6" /></g><g transform="translate(262,58) rotate(-16)"><ellipse rx="8.5" ry="5.6" /></g></g>
    <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.55"><path d="M139 22 C 134 15, 144 11, 139 4" /><path d="M151 22 C 146 15, 156 11, 151 4" /><path d="M163 22 C 158 15, 168 11, 163 4" /></g>
    <ellipse cx="150" cy="84" rx="54" ry="8" fill="#f5f1e8" />
    <path d="M180 48 C 197 48, 197 68, 178 68" stroke="#faf7f0" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    <path d="M120 41 L180 41 L173 74 Q150 82 127 74 Z" fill="#faf7f0" />
    <ellipse cx="150" cy="41" rx="30" ry="6" fill="#5a3a24" />
  </svg>
);

const Chip: React.FC<{u: number; delay: number; x: number; y: number; anchor: 'l' | 'r'; icon: React.ReactNode; label: string}> = ({u, delay, x, y, anchor, icon, label}) => {
  const p = useSpr(delay, 13, 0.7);
  const frame = useCurrentFrame();
  const floatY = Math.sin((frame + delay * 3) * 0.06) * 0.7 * u;
  const pos: React.CSSProperties = anchor === 'r' ? {right: `${x}%`} : {left: `${x}%`};
  if (p <= 0.001) return null;
  return (
    <div style={{position: 'absolute', top: `${y}%`, ...pos, opacity: interpolate(p, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(p, 1)) * 14 + floatY}px) scale(${0.9 + Math.min(p, 1) * 0.1})`, filter: `drop-shadow(0 ${1.2 * u}px ${3 * u}px rgba(28,26,23,.25))`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 1.1 * u, background: '#fff', borderRadius: 99, padding: `${1.2 * u}px ${2.2 * u}px`, fontFamily: INTER, fontWeight: 700, fontSize: 2.4 * u, color: S.ink, whiteSpace: 'nowrap'}}>
        {icon}{label}
      </div>
    </div>
  );
};

const SiteScene: React.FC = () => {
  const u = useU();
  const s = useSpr(2);
  const head = useSpr(3);
  return (
    <AbsoluteFill style={{background: S.cream, alignItems: 'center', justifyContent: 'center', fontFamily: INTER}}>
      <div style={{position: 'absolute', top: 6 * u, left: 0, right: 0, textAlign: 'center', opacity: head, transform: `translateY(${(1 - head) * 16}px)`, fontFamily: FRAU, fontWeight: 900, fontSize: 5.6 * u, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1.0}}>A website does the work.</div>
      <div style={{width: 44 * u, opacity: s, transform: `translateY(${(1 - s) * 4}%) scale(${0.96 + s * 0.04})`}}>
        <Phone u={u} w={44}>
          <div style={{background: S.cream, padding: `${1.8 * u}px ${2 * u}px ${2.2 * u}px`}}>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 0.8 * u}}>
                <svg width={2.6 * u} height={2.6 * u} viewBox="0 0 24 24"><path d="M20 4 C 9 4, 4 10, 4 19 C 13 20, 21 15, 20 4 Z" fill={S.green} /></svg>
                <span style={{fontFamily: FRAU, fontWeight: 700, fontSize: 2.6 * u, color: S.green}}>Verde</span>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 0.35 * u}}>{[0, 1, 2].map((i) => (<span key={i} style={{width: 2.4 * u, height: 0.34 * u, background: S.ink, borderRadius: 2}} />))}</div>
            </div>
            <div style={{marginTop: 2 * u, fontFamily: INTER, fontWeight: 600, fontSize: 1.5 * u, letterSpacing: '0.12em', color: S.terra}}>COFFEE · BRUNCH</div>
            <div style={{fontFamily: FRAU, fontWeight: 900, fontSize: 5.4 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink, marginTop: 0.8 * u}}>Good <span style={{fontFamily: FRAUI, fontStyle: 'italic', color: S.terra}}>mornings</span>.</div>
            <div style={{marginTop: 1.6 * u, height: 18 * u, borderRadius: 1.8 * u, overflow: 'hidden'}}><CafeArt /></div>
            <div style={{display: 'flex', alignItems: 'center', gap: 1.2 * u, marginTop: 1.8 * u}}>
              <span style={{background: S.terra, color: '#fff', fontFamily: INTER, fontWeight: 600, fontSize: 1.7 * u, padding: `${1.1 * u}px ${2.2 * u}px`, borderRadius: 99}}>View the Menu</span>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: 0.6 * u, fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: S.green}}><Stars u={u} s={1.5} /> Open</span>
            </div>
          </div>
        </Phone>
      </div>
      <Chip u={u} delay={26} x={3} y={22} anchor="l" icon={<svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none" stroke={S.green} strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" /></svg>} label="On Google" />
      <Chip u={u} delay={36} x={3} y={30} anchor="r" icon={<svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none" stroke={S.terra} strokeWidth={2.4}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>} label="Open 24/7" />
      <Chip u={u} delay={46} x={4} y={66} anchor="l" icon={<Stars u={u} s={1.8} />} label="4.9" />
      <Chip u={u} delay={56} x={3} y={60} anchor="r" icon={<svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none" stroke={S.green} strokeWidth={2.2}><path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>} label="Looks legit" />
    </AbsoluteFill>
  );
};

/* ---------- 3. cta ---------- */
const CtaScene: React.FC = () => {
  const u = useU();
  const mark = useSpr(2, 13, 0.7);
  const kick = useSpr(9);
  const h1 = useSpr(14);
  const h2 = useSpr(18);
  const sub = useSpr(26);
  const under = useSpr(24);
  const url = useSpr(32);
  const tag = useSpr(38);
  const up = (p: number, dy = 20) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
  return (
    <AbsoluteFill style={{background: S.cream, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 2 * u, padding: `${6 * u}px`, fontFamily: INTER}}>
      <div style={{opacity: mark, transform: `scale(${0.6 + mark * 0.4})`}}><Awning size={14 * u} /></div>
      <div style={{...up(kick, 14), fontFamily: INTER, fontWeight: 600, fontSize: 2.4 * u, letterSpacing: '0.2em', color: S.terra}}>NO COST TO SEE IT</div>
      <div style={{fontFamily: FRAU, fontWeight: 900, fontSize: 8 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink}}>
        <div style={up(h1, 0)}>See it before</div>
        <div style={{...up(h2, 0), color: S.terra}}>you pay.</div>
      </div>
      <div style={{...up(sub), fontFamily: INTER, fontWeight: 400, fontSize: 2.7 * u, lineHeight: 1.4, color: S.inkMut, maxWidth: '84%'}}>The concept is free. Building and launching your real site is a one-time fee.</div>
      <div style={{height: 0.9 * u, width: 18 * u, background: S.terra, borderRadius: 99, transform: `scaleX(${under})`, transformOrigin: 'center'}} />
      <div style={{...up(url), fontFamily: INTER, fontWeight: 600, fontSize: 3 * u, color: S.terra}}>storefrontdesigns.xyz</div>
      <div style={{...up(tag), fontFamily: INTER, fontWeight: 400, fontSize: 2.3 * u, color: S.inkMut, maxWidth: '82%'}}>Concept sites for Ooltewah &amp; Chattanooga businesses.</div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const StorefrontWhy: React.FC = () => {
  const t = linearTiming({durationInFrames: TR});
  return (
    <AbsoluteFill style={{background: S.cream}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEQ[0]}><HookScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[1]}><SearchScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[2]}><SiteScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[3]}><CtaScene /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
