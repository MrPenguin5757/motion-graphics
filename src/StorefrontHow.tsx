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
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {loadFont} from '@remotion/fonts';

const FRAU = 'Fraunces';
const FRAUI = 'FrauncesItalic';
const INTER = 'Inter';
const fontHandle = delayRender('load-fonts-storefront-how');
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
  terra: '#c07a4b',
  cream: '#faf8f4',
  cream2: '#f1ebdf',
  ink: '#1c1a17',
  inkMut: '#6f6a61',
  gold: '#e0a63c',
};

export const FPS = 30;
const TR = 12;
const SEQ = [96, 108, 120, 108, 116, 108];
export const DURATION = SEQ.reduce((a, b) => a + b, 0) - TR * (SEQ.length - 1);

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};
// fill taller frames (9:16) more: a size bump + extra vertical spacing, so
// content grows toward the top/bottom while leaving only the very edges clear.
const useAspect = () => {
  const {width, height} = useVideoConfig();
  return height / width;
};
const useK = () => {
  const r = useAspect();
  return r > 1.5 ? 1.28 : r > 1.1 ? 1.08 : 1;
};
const useGap = () => {
  const r = useAspect();
  return r > 1.5 ? 2.1 : r > 1.1 ? 1.25 : 1;
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
      <defs><clipPath id="awnH"><path d="M24 20 L76 20 L88 43 L12 43 Z" /></clipPath></defs>
      <rect x={19} y={41} width={62} height={47} rx={6} fill="#e4e7e1" />
      <g clipPath="url(#awnH)">{cols.map((c, i) => (<rect key={i} x={x0 + (w / cols.length) * i} y={19} width={w / cols.length + 0.5} height={25} fill={c} />))}</g>
      <rect x={42} y={58} width={16} height={30} rx={4} fill={S.green} />
    </svg>
  );
};

const Num: React.FC<{u: number; n: string}> = ({u, n}) => (
  <div style={{fontFamily: FRAU, fontWeight: 900, fontSize: 5.2 * u, letterSpacing: '-0.02em', color: S.terra, lineHeight: 1}}>{n}</div>
);

const StepShell: React.FC<{u: number; n: string; title: React.ReactNode; children?: React.ReactNode}> = ({u, n, title, children}) => {
  const kick = useSpr(0, 14, 0.7);
  const h = useSpr(6);
  const k = useK();
  const gK = useGap();
  return (
    <AbsoluteFill style={{background: S.cream, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: `0 ${8 * u}px`, fontFamily: INTER}}>
      <div style={{width: 64 * u, transform: `scale(${k})`, transformOrigin: 'left center', display: 'flex', flexDirection: 'column', gap: 2.6 * gK * u}}>
        <div style={{opacity: kick, transform: `translateY(${(1 - kick) * 16}px)`}}><Num u={u} n={n} /></div>
        <div style={{opacity: h, transform: `translateY(${(1 - h) * 16}px)`, fontFamily: FRAU, fontWeight: 900, fontSize: 8.2 * u, lineHeight: 1.0, letterSpacing: '-0.02em', color: S.ink}}>{title}</div>
        {children}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 0. opener: "so you need a website?" then push into the screen ---------- */
const Monitor: React.FC<{u: number}> = ({u}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
    <div style={{width: 52 * u, height: 34 * u, background: S.ink, borderRadius: 3 * u, padding: 1.6 * u, boxShadow: `0 ${1.6 * u}px ${4 * u}px rgba(28,26,23,.2)`}}>
      <div style={{width: '100%', height: '100%', background: S.cream, borderRadius: 1.6 * u, display: 'grid', placeItems: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.2 * u}}>
          <Awning size={9 * u} />
          <div style={{fontFamily: FRAU, fontWeight: 700, fontSize: 3 * u, color: S.green}}>Storefront</div>
        </div>
      </div>
    </div>
    <div style={{width: 6 * u, height: 4 * u, background: '#d3cdc1'}} />
    <div style={{width: 22 * u, height: 2.2 * u, borderRadius: 99, background: '#d3cdc1'}} />
  </div>
);

const OpenerScene: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const k = useK();
  const gK = useGap();
  const intro = useSpr(2);
  const push = interpolate(frame, [46, 74], [1, 2.5], {...CL, easing: easeInOut});
  const gFade = interpolate(frame, [52, 70], [1, 0], CL);
  const title = interpolate(frame, [60, 80], [0, 1], CL);
  return (
    <AbsoluteFill style={{background: S.cream2, alignItems: 'center', justifyContent: 'center', fontFamily: INTER, overflow: 'hidden'}}>
      <div style={{opacity: interpolate(intro, [0, 1], [0, 1], CL) * gFade, transform: `scale(${(0.92 + Math.min(intro, 1) * 0.08) * push * k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3.4 * gK * u}}>
        <div style={{textAlign: 'center', fontFamily: FRAU, fontWeight: 900, fontSize: 8 * u, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1.0}}>So you need<br />a website?</div>
        <Monitor u={u} />
      </div>
      <div style={{position: 'absolute', textAlign: 'center', opacity: title, transform: `translateY(${(1 - title) * 12}px) scale(${k})`, fontFamily: FRAU, fontWeight: 900, fontSize: 9.2 * u, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1.0}}>Here's how<br /><span style={{color: S.terra}}>it works.</span></div>
    </AbsoluteFill>
  );
};

/* ---------- 1. send info (animated form fill) ---------- */
const PhotoIcon: React.FC<{u: number}> = ({u}) => (
  <svg width="52%" height="52%" viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="8.5" r="2.2" fill="#fff" opacity="0.9" />
    <path d="M3 19 L9 12 L13 16 L17 11 L21 19 Z" fill="#fff" opacity="0.9" />
  </svg>
);

const Step1: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const card = useSpr(4, 14, 0.8);
  const nameFull = 'Verde Cafe';
  const hoursFull = 'Mon-Sat, 7a-3p';
  const nameN = Math.max(0, Math.min(nameFull.length, Math.floor((frame - 10) / 2.2)));
  const hoursN = Math.max(0, Math.min(hoursFull.length, Math.floor((frame - 40) / 2.3)));
  const nameActive = frame >= 8 && frame < 40;
  const hoursActive = frame >= 38 && frame < 76;
  const blink = Math.floor(frame / 7) % 2 ? 1 : 0.2;
  const tints = ['rgba(192,122,75,.85)', 'rgba(58,90,64,.85)', 'rgba(224,166,60,.85)'];
  const field = (label: string, value: string, active: boolean) => (
    <div style={{width: '100%'}}>
      <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.9 * u, letterSpacing: '0.02em', color: S.inkMut, marginBottom: 0.7 * u}}>{label}</div>
      <div style={{background: '#fff', border: `1.6px solid ${active ? S.terra : 'rgba(28,26,23,.14)'}`, borderRadius: 1.4 * u, padding: `${1.3 * u}px ${1.8 * u}px`, minHeight: 3.2 * u, display: 'flex', alignItems: 'center', fontFamily: INTER, fontWeight: 600, fontSize: 2.7 * u, color: S.ink}}>
        {value}{active && <span style={{opacity: blink, color: S.terra, marginLeft: 1}}>|</span>}
      </div>
    </div>
  );
  return (
    <StepShell u={u} n="1" title={<>You send<br />your info.</>}>
      <div style={{width: '100%', marginTop: 0.6 * u, opacity: interpolate(card, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(card, 1)) * 12}px) scale(${0.97 + Math.min(card, 1) * 0.03})`, background: S.cream, border: '1px solid rgba(28,26,23,.10)', borderRadius: 2.4 * u, padding: `${2.6 * u}px`, boxShadow: `0 ${1.6 * u}px ${4.5 * u}px rgba(28,26,23,.12)`, display: 'flex', flexDirection: 'column', gap: 2 * u}}>
        {field('Business name', nameFull.slice(0, nameN), nameActive)}
        {field('Hours', hoursFull.slice(0, hoursN), hoursActive)}
        <div>
          <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.9 * u, letterSpacing: '0.02em', color: S.inkMut, marginBottom: 0.9 * u}}>Photos</div>
          <div style={{display: 'flex', gap: 1.4 * u}}>
            {tints.map((t, i) => {
              const p = spring({frame: frame - (78 + i * 6), fps, config: {damping: 13, mass: 0.7}});
              return (
                <div key={i} style={{flex: 1, aspectRatio: '1 / 1', borderRadius: 1.4 * u, background: t, display: 'grid', placeItems: 'center', opacity: interpolate(p, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(p, 1)) * 12}px) scale(${0.85 + Math.min(p, 1) * 0.15})`}}>
                  <PhotoIcon u={u} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </StepShell>
  );
};

/* ---------- 2. free concept ---------- */
const CafeArt: React.FC = () => (
  <svg viewBox="0 0 300 96" preserveAspectRatio="xMidYMid slice" style={{width: '100%', height: '100%', display: 'block'}}>
    <rect width="300" height="96" fill="#ecdfca" />
    <circle cx="150" cy="46" r="42" fill="#e2c6a4" opacity="0.55" />
    <g stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" fill="none" opacity="0.55"><path d="M139 22 C 134 15, 144 11, 139 4" /><path d="M151 22 C 146 15, 156 11, 151 4" /><path d="M163 22 C 158 15, 168 11, 163 4" /></g>
    <ellipse cx="150" cy="84" rx="54" ry="8" fill="#f5f1e8" />
    <path d="M180 48 C 197 48, 197 68, 178 68" stroke="#faf7f0" strokeWidth="6.5" fill="none" strokeLinecap="round" />
    <path d="M120 41 L180 41 L173 74 Q150 82 127 74 Z" fill="#faf7f0" />
    <ellipse cx="150" cy="41" rx="30" ry="6" fill="#5a3a24" />
  </svg>
);

const Step2: React.FC = () => {
  const u = useU();
  const site = useSpr(14, 14, 0.7);
  return (
    <StepShell u={u} n="2" title={<>I design it,<br /><span style={{color: S.terra}}>free.</span></>}>
      <div style={{marginTop: 0.4 * u, fontFamily: INTER, fontWeight: 400, fontSize: 3 * u, color: S.inkMut, maxWidth: '92%'}}>A real concept of your site. No deposit, no commitment.</div>
      <div style={{marginTop: 2 * u, width: '100%', opacity: interpolate(site, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(site, 1)) * 14}px) scale(${0.96 + Math.min(site, 1) * 0.04})`, borderRadius: 2.4 * u, overflow: 'hidden', background: '#fff', boxShadow: `0 ${2 * u}px ${5 * u}px rgba(28,26,23,.18)`}}>
        <div style={{height: 4 * u, background: '#e7e3db', display: 'flex', alignItems: 'center', gap: 0.8 * u, padding: `0 ${1.8 * u}px`}}>
          {['#e0685c', '#e6b34d', '#63b063'].map((c) => (<span key={c} style={{width: 1.3 * u, height: 1.3 * u, borderRadius: '50%', background: c}} />))}
        </div>
        <div style={{padding: `${2 * u}px ${2.4 * u}px ${2.4 * u}px`, background: S.cream}}>
          <div style={{fontFamily: INTER, fontWeight: 600, fontSize: 1.5 * u, letterSpacing: '0.12em', color: S.terra}}>COFFEE · BRUNCH</div>
          <div style={{fontFamily: FRAU, fontWeight: 900, fontSize: 4.6 * u, letterSpacing: '-0.02em', color: S.ink, marginTop: 0.4 * u}}>Good <span style={{fontFamily: FRAUI, fontStyle: 'italic', color: S.terra}}>mornings</span>.</div>
          <div style={{marginTop: 1.4 * u, height: 15 * u, borderRadius: 1.6 * u, overflow: 'hidden'}}><CafeArt /></div>
        </div>
      </div>
    </StepShell>
  );
};

/* ---------- 3. review ---------- */
const Step3: React.FC = () => {
  const u = useU();
  const r1 = useSpr(14, 13, 0.7);
  const r2 = useSpr(22, 13, 0.7);
  const row = (p: number, icon: React.ReactNode, bold: string, rest: string) => (
    <div style={{opacity: interpolate(p, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(p, 1)) * 14}px)`, display: 'flex', alignItems: 'center', gap: 2 * u, fontFamily: INTER, fontSize: 3.2 * u, color: S.ink}}>
      <span style={{flex: '0 0 auto', width: 6.6 * u, height: 6.6 * u, borderRadius: 2 * u, display: 'grid', placeItems: 'center', background: icon === 'yes' ? S.green : '#e7e3db'}}>
        {icon === 'yes'
          ? <svg width="58%" height="58%" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
          : <svg width="52%" height="52%" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke={S.inkMut} strokeWidth={3} strokeLinecap="round" /></svg>}
      </span>
      <span><b style={{fontWeight: 700}}>{bold}</b> {rest}</span>
    </div>
  );
  return (
    <StepShell u={u} n="3" title={<>You take<br />a look.</>}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2.4 * u, marginTop: 1.4 * u, width: '100%'}}>
        {row(r1, 'yes', 'Love it?', 'We build and launch.')}
        {row(r2, 'no', 'Not for you?', 'Walk away, no cost.')}
      </div>
    </StepShell>
  );
};

/* ---------- 4. pay once ---------- */
const Step4: React.FC = () => {
  const u = useU();
  const bar = useSpr(16, 14, 0.7);
  return (
    <StepShell u={u} n="4" title={<>Pay once,<br /><span style={{color: S.terra}}>it's yours.</span></>}>
      <div style={{marginTop: 0.4 * u, fontFamily: INTER, fontWeight: 400, fontSize: 3 * u, lineHeight: 1.4, color: S.inkMut, maxWidth: '94%'}}>One flat fee. Then I connect your domain, take it live, and hand everything over.</div>
      <div style={{marginTop: 2 * u, width: '100%', opacity: interpolate(bar, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(bar, 1)) * 12}px)`, display: 'flex', alignItems: 'center', gap: 1.4 * u, background: '#fff', border: '1px solid rgba(28,26,23,.10)', borderRadius: 99, padding: `${1.6 * u}px ${2.4 * u}px`, boxShadow: '0 1px 3px rgba(28,26,23,.06)'}}>
        <span style={{width: 2.4 * u, height: 2.4 * u, borderRadius: '50%', background: S.green}} />
        <span style={{fontFamily: INTER, fontWeight: 600, fontSize: 2.6 * u, color: S.ink}}>yourbusiness.com</span>
        <span style={{marginLeft: 'auto', fontFamily: INTER, fontWeight: 700, fontSize: 2.2 * u, color: '#fff', background: S.green, borderRadius: 99, padding: `${0.6 * u}px ${1.8 * u}px`}}>LIVE</span>
      </div>
    </StepShell>
  );
};

/* ---------- 5. cta ---------- */
const CtaScene: React.FC = () => {
  const u = useU();
  const k = useK();
  const gK = useGap();
  const mark = useSpr(2, 13, 0.7);
  const h = useSpr(12);
  const under = useSpr(20);
  const url = useSpr(26);
  const tag = useSpr(34);
  const up = (p: number, dy = 20) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});
  return (
    <AbsoluteFill style={{background: S.cream, alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: `${6 * u}px`, fontFamily: INTER}}>
      <div style={{transform: `scale(${k})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.2 * gK * u}}>
        <div style={{opacity: mark, transform: `scale(${0.6 + mark * 0.4})`}}><Awning size={16 * u} /></div>
        <div style={{...up(h, 0), fontFamily: FRAU, fontWeight: 900, fontSize: 8.6 * u, letterSpacing: '-0.02em', color: S.ink, lineHeight: 1.02, maxWidth: '88%'}}>Ready when<br />you are.</div>
        <div style={{height: 0.9 * u, width: 18 * u, background: S.terra, borderRadius: 99, transform: `scaleX(${under})`, transformOrigin: 'center'}} />
        <div style={{...up(url), fontFamily: INTER, fontWeight: 600, fontSize: 3.3 * u, color: S.terra}}>storefrontdesigns.xyz</div>
        <div style={{...up(tag), fontFamily: INTER, fontWeight: 400, fontSize: 2.4 * u, color: S.inkMut, maxWidth: '82%'}}>Concept sites for Ooltewah &amp; Chattanooga businesses.</div>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const StorefrontHow: React.FC = () => {
  const t = linearTiming({durationInFrames: TR});
  return (
    <AbsoluteFill style={{background: S.cream}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEQ[0]}><OpenerScene /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[1]}><Step1 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[2]}><Step2 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[3]}><Step3 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[4]}><Step4 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[5]}><CtaScene /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
