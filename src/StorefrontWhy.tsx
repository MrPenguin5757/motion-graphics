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
  greenLt: '#5c7d62',
  terra: '#c07a4b',
  terraDk: '#a8623a',
  cream: '#faf8f4',
  cream2: '#f1ebdf',
  ink: '#1c1a17',
  inkMut: '#6f6a61',
  red: '#d64525',
  gold: '#e0a63c',
};

export const FPS = 30;
const TR = 16;
const SEQ = [96, 172, 158, 86, 118];
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
      <g clipPath="url(#awnW)">
        {cols.map((c, i) => (<rect key={i} x={x0 + (w / cols.length) * i} y={19} width={w / cols.length + 0.5} height={25} fill={c} />))}
      </g>
      <rect x={42} y={58} width={16} height={30} rx={4} fill={S.green} />
    </svg>
  );
};

const Stars: React.FC<{u: number; n?: number; color?: string}> = ({u, n = 5, color = S.gold}) => (
  <span style={{display: 'inline-flex', gap: 0.2 * u}}>
    {Array.from({length: n}).map((_, i) => (
      <svg key={i} width={1.7 * u} height={1.7 * u} viewBox="0 0 24 24" fill={color}><path d="M12 2l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.8 6.1 20.7l1.3-6.6L2.5 9.5l6.6-.8z" /></svg>
    ))}
  </span>
);

/* ---------- 1. hook ---------- */
const HookScene: React.FC = () => {
  const u = useU();
  const kick = useSpr(2, 14, 0.7);
  const h1 = useSpr(8);
  const h2 = useSpr(13);
  const sub = useSpr(22);
  const rise = (p: number) => ({display: 'block', transform: `translateY(${(1 - p) * 110}%)`});
  return (
    <AbsoluteFill style={{background: S.cream, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: `${8 * u}px`, fontFamily: INTER}}>
      <div style={{opacity: kick, transform: `translateY(${(1 - kick) * 24}px)`, fontFamily: INTER, fontWeight: 600, fontSize: 2.6 * u, letterSpacing: '0.2em', color: S.terra}}>FOR SHOPS WITHOUT A WEBSITE</div>
      <h1 style={{margin: `${1.6 * u}px 0 0`, fontFamily: FRAU, fontWeight: 900, fontSize: 10 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink}}>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={rise(h1)}>They're already</span></span>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={{...rise(h2), color: S.terra}}>looking for you.</span></span>
      </h1>
      <div style={{opacity: sub, transform: `translateY(${(1 - sub) * 18}px)`, marginTop: 2.6 * u, fontFamily: INTER, fontWeight: 400, fontSize: 3.3 * u, lineHeight: 1.4, color: S.inkMut, maxWidth: '92%'}}>
        The only question is whether they find you, or a competitor.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2. the search ---------- */
const ResultCard: React.FC<{u: number; name: string; meta: string; hasSite: boolean; highlight?: boolean; ring?: number}> = ({u, name, meta, hasSite, highlight, ring = 0}) => (
  <div style={{background: '#fff', borderRadius: 2 * u, padding: `${1.8 * u}px ${2 * u}px`, boxShadow: '0 1px 3px rgba(28,26,23,.06)', border: highlight ? `${0.35 * u}px solid ${S.terra}` : '1px solid rgba(28,26,23,.06)', position: 'relative', transform: `scale(${1 + ring * 0.02})`}}>
    <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 2.5 * u, color: S.ink}}>{name}</div>
    <div style={{display: 'flex', alignItems: 'center', gap: 0.8 * u, marginTop: 0.5 * u}}>
      {hasSite ? <Stars u={u} /> : <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.7 * u, color: '#b7b2a8'}}>No reviews</span>}
      <span style={{fontFamily: INTER, fontWeight: 500, fontSize: 1.7 * u, color: S.inkMut}}>{meta}</span>
    </div>
    <div style={{display: 'flex', gap: 1 * u, marginTop: 1.4 * u}}>
      <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: S.green, border: `1px solid ${S.green}`, borderRadius: 99, padding: `${0.5 * u}px ${1.5 * u}px`}}>Directions</span>
      {hasSite ? (
        <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: '#fff', background: S.green, borderRadius: 99, padding: `${0.5 * u}px ${1.6 * u}px`}}>Website</span>
      ) : (
        <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.6 * u, color: '#c0392b', background: 'rgba(214,69,37,.10)', borderRadius: 99, padding: `${0.5 * u}px ${1.5 * u}px`}}>No website</span>
      )}
    </div>
  </div>
);

const SearchScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const s = useSpr(2);
  const cap = useSpr(6);
  const card = (d: number) => spring({frame: frame - d, fps: 30, config: {damping: 200}});
  const tap = interpolate(frame, [78, 88, 98], [0, 1, 0], CL); // ripple pulse
  const chose = interpolate(frame, [92, 104], [0, 1], CL); // highlight the competitor
  const lower = useSpr(108);
  return (
    <AbsoluteFill style={{background: S.cream, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: `${7 * u}px ${6 * u}px`, fontFamily: INTER}}>
      <div style={{opacity: cap, transform: `translateY(${(1 - cap) * 16}px)`, textAlign: 'center', fontFamily: FRAU, fontWeight: 900, fontSize: 6.6 * u, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1.02}}>
        This is how they choose.
      </div>
      <div style={{marginTop: 3 * u, width: 54 * u, opacity: s, transform: `translateY(${(1 - s) * 4}%) scale(${0.97 + s * 0.03})`, background: S.ink, borderRadius: 5 * u, padding: 1.2 * u, boxShadow: `0 ${2.4 * u}px ${7 * u}px rgba(28,26,23,.3)`, position: 'relative'}}>
        <div style={{background: '#f3f0ea', borderRadius: 4 * u, overflow: 'hidden'}}>
          {/* search bar */}
          <div style={{background: '#fff', margin: `${2 * u}px ${2 * u}px ${1.4 * u}px`, borderRadius: 99, display: 'flex', alignItems: 'center', gap: 1.2 * u, padding: `${1.3 * u}px ${2 * u}px`, boxShadow: '0 1px 4px rgba(28,26,23,.08)'}}>
            <svg width={2.3 * u} height={2.3 * u} viewBox="0 0 24 24" fill="none" stroke={S.inkMut} strokeWidth={2.4}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" /></svg>
            <span style={{fontFamily: INTER, fontWeight: 500, fontSize: 2 * u, color: S.ink}}>coffee shop near me</span>
          </div>
          {/* map strip */}
          <div style={{height: 12 * u, margin: `0 ${2 * u}px ${1.6 * u}px`, borderRadius: 2 * u, background: '#dfe6db', position: 'relative', overflow: 'hidden'}}>
            <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
              <path d="M0 22 L40 22 L40 4" stroke="#c3cebd" strokeWidth="2" fill="none" />
              <path d="M62 0 L62 18 L100 18" stroke="#c3cebd" strokeWidth="2" fill="none" />
            </svg>
            {[[26, 16], [58, 10], [78, 20]].map(([x, y], i) => (
              <svg key={i} width={3.2 * u} height={3.2 * u} viewBox="0 0 24 24" style={{position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-100%)'}} fill={i === 2 ? '#b7b2a8' : S.terra}><path d="M12 2C7.6 2 4 5.6 4 10c0 5.4 8 12 8 12s8-6.6 8-12c0-4.4-3.6-8-8-8z" /><circle cx="12" cy="10" r="3" fill="#fff" /></svg>
            ))}
          </div>
          {/* results */}
          <div style={{display: 'flex', flexDirection: 'column', gap: 1.4 * u, padding: `0 ${2 * u}px ${2.4 * u}px`}}>
            <div style={{opacity: card(10), transform: `translateY(${(1 - card(10)) * 10}px)`, position: 'relative'}}>
              <ResultCard u={u} name="Rivertown Roasters" meta="· Open now" hasSite ring={chose} highlight={chose > 0.5} />
              <div style={{position: 'absolute', right: 6 * u, top: '50%', width: 7 * u, height: 7 * u, borderRadius: '50%', background: 'rgba(192,122,75,.45)', transform: `translate(-50%,-50%) scale(${0.6 + tap * 0.9})`, opacity: tap}} />
            </div>
            <div style={{opacity: card(16), transform: `translateY(${(1 - card(16)) * 10}px)`}}><ResultCard u={u} name="Verde Cafe" meta="· Open now" hasSite /></div>
            <div style={{opacity: card(22), transform: `translateY(${(1 - card(22)) * 10}px)`}}><ResultCard u={u} name="Your Shop" meta="· Hours unknown" hasSite={false} /></div>
          </div>
        </div>
      </div>
      <div style={{opacity: lower, transform: `translateY(${(1 - lower) * 16}px)`, marginTop: 2.4 * u, fontFamily: INTER, fontWeight: 500, fontSize: 2.7 * u, color: S.inkMut, textAlign: 'center', maxWidth: '90%'}}>
        No website, no reason to pick you.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 3. reasons ---------- */
const IconSearch = ({u}: {u: number}) => (<svg width={4 * u} height={4 * u} viewBox="0 0 24 24" fill="none" stroke={S.cream} strokeWidth={2}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" /></svg>);
const IconClock = ({u}: {u: number}) => (<svg width={4 * u} height={4 * u} viewBox="0 0 24 24" fill="none" stroke={S.cream} strokeWidth={2}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const IconBadge = ({u}: {u: number}) => (<svg width={4 * u} height={4 * u} viewBox="0 0 24 24" fill="none" stroke={S.cream} strokeWidth={2}><path d="M12 3l7 3v5c0 4.4-3 8-7 10-4-2-7-5.6-7-10V6z" strokeLinejoin="round" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>);

const ReasonRow: React.FC<{u: number; delay: number; icon: React.ReactNode; title: string; sub: string; divide?: boolean}> = ({u, delay, icon, title, sub, divide}) => {
  const p = useSpr(delay, 13, 0.7);
  return (
    <div style={{opacity: interpolate(p, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(p, 1)) * 16}px)`, display: 'flex', alignItems: 'flex-start', gap: 2.4 * u, borderTop: divide ? '1px solid rgba(250,248,244,.14)' : 'none', paddingTop: divide ? 2.6 * u : 0}}>
      <span style={{flex: '0 0 auto', width: 8 * u, height: 8 * u, borderRadius: 2.2 * u, background: S.terra, display: 'grid', placeItems: 'center'}}>{icon}</span>
      <div>
        <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 3.7 * u, color: S.cream, letterSpacing: '-0.01em', lineHeight: 1.05}}>{title}</div>
        <div style={{fontFamily: INTER, fontWeight: 400, fontSize: 2.4 * u, color: 'rgba(250,248,244,.62)', marginTop: 0.6 * u, lineHeight: 1.35}}>{sub}</div>
      </div>
    </div>
  );
};

const ReasonsScene: React.FC = () => {
  const u = useU();
  const head = useSpr(2);
  return (
    <AbsoluteFill style={{background: S.green, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: `${8 * u}px`, gap: 3 * u, fontFamily: INTER}}>
      <div style={{opacity: head, transform: `translateY(${(1 - head) * 16}px)`, fontFamily: FRAU, fontWeight: 900, fontSize: 7 * u, letterSpacing: '-0.02em', color: S.cream, lineHeight: 1.0}}>What a website<br />does for you.</div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2.6 * u, width: '100%', marginTop: 1 * u}}>
        <ReasonRow u={u} delay={12} icon={<IconSearch u={u} />} title="You show up" sub="When they search, you are there instead of nowhere." />
        <ReasonRow u={u} delay={20} icon={<IconClock u={u} />} title="Open 24/7" sub="Hours, menu, and location answered while you sleep." divide />
        <ReasonRow u={u} delay={28} icon={<IconBadge u={u} />} title="You look real" sub="A proper site earns trust a social page never will." divide />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4. turn ---------- */
const TurnScene: React.FC = () => {
  const u = useU();
  const h1 = useSpr(2);
  const h2 = useSpr(7);
  const sub = useSpr(16);
  const rise = (p: number) => ({display: 'block', transform: `translateY(${(1 - p) * 110}%)`});
  return (
    <AbsoluteFill style={{background: S.ink, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: `${8 * u}px`, fontFamily: INTER}}>
      <h1 style={{margin: 0, fontFamily: FRAU, fontWeight: 900, fontSize: 9.4 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.cream}}>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={rise(h1)}>It works while</span></span>
        <span style={{display: 'block', overflow: 'hidden'}}><span style={{...rise(h2), color: S.terra}}>you sleep.</span></span>
      </h1>
      <div style={{opacity: sub, transform: `translateY(${(1 - sub) * 18}px)`, marginTop: 2.6 * u, fontFamily: INTER, fontWeight: 400, fontSize: 3.3 * u, lineHeight: 1.4, color: 'rgba(250,248,244,.62)', maxWidth: '92%'}}>
        Build it once. It brings in customers every day after.
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 5. cta ---------- */
const CtaScene: React.FC = () => {
  const u = useU();
  const mark = useSpr(2, 13, 0.7);
  const kick = useSpr(10);
  const wm = useSpr(15);
  const under = useSpr(23);
  const url = useSpr(29);
  const tag = useSpr(37);
  const up = (p: number, dy = 22) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
  return (
    <AbsoluteFill style={{background: S.cream, alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 2.4 * u, fontFamily: INTER}}>
      <div style={{opacity: mark, transform: `scale(${0.6 + mark * 0.4})`}}><Awning size={19 * u} /></div>
      <div style={{...up(kick, 16), fontFamily: INTER, fontWeight: 600, fontSize: 2.5 * u, letterSpacing: '0.2em', color: S.terra}}>NO COST · NO OBLIGATION</div>
      <div style={{...up(wm, 0), fontFamily: FRAU, fontWeight: 900, fontSize: 8.4 * u, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1.02, maxWidth: '86%'}}>I'll build yours free.</div>
      <div style={{height: 0.9 * u, width: 20 * u, background: S.terra, borderRadius: 99, transform: `scaleX(${under})`, transformOrigin: 'center'}} />
      <div style={{...up(url), fontFamily: INTER, fontWeight: 600, fontSize: 3.3 * u, color: S.terra}}>storefrontdesigns.xyz</div>
      <div style={{...up(tag), fontFamily: INTER, fontWeight: 400, fontSize: 2.5 * u, color: S.inkMut, maxWidth: '80%'}}>Free concept sites for Ooltewah &amp; Chattanooga businesses.</div>
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
        <TransitionSeries.Sequence durationInFrames={SEQ[2]}><ReasonsScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[3]}><TurnScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[4]}><CtaScene /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
