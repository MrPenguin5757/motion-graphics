import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {slide} from '@remotion/transitions/slide';
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {loadFont as loadBricolage} from '@remotion/google-fonts/BricolageGrotesque';
import {loadFont as loadHanken} from '@remotion/google-fonts/HankenGrotesk';
import {brand} from './brand';

const {fontFamily: BRIC} = loadBricolage();
const {fontFamily: HANK} = loadHanken();

/* palette (from the Curb Design Bible) */
const C = {
  sand: '#F4EFE4',
  concrete: '#FBF8F1',
  ink: '#211E1A',
  asphalt: '#1D1A16',
  asphalt2: '#26221C',
  curb: '#D75F1F',
  curbDk: '#E56A25',
  marigold: '#F3A847',
  lawn: '#3C7A59',
  lawnDk: '#4E9670',
  sky: '#2F6FB0',
  gravel: '#7A7264',
  gravelDk: '#BDB4A4',
};

export const FPS = 30;
// scene durations in frames; adjacent scenes overlap by TR frames of transition.
const SCENES = [90, 60, 60, 96, 84, 150, 132];
const TR = 14;
export const DURATION = SCENES.reduce((a, b) => a + b, 0) - TR * (SCENES.length - 1);

/* ---------- helpers ---------- */
const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};
const useSpring = (delay = 0, damping = 200, mass = 1) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass}});
};

const In: React.FC<{delay?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  dy = 7,
  children,
  style,
}) => {
  const u = useU();
  const s = useSpring(delay);
  return (
    <div style={{opacity: s, transform: `translateY(${(1 - s) * dy * u}px) scale(${0.94 + s * 0.06})`, ...style}}>
      {children}
    </div>
  );
};

const Punch: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  children,
  style,
}) => {
  const s = useSpring(delay, 13, 0.6);
  return (
    <div style={{opacity: interpolate(s, [0, 1], [0, 1], {extrapolateRight: 'clamp'}), transform: `scale(${interpolate(s, [0, 1], [1.3, 1])})`, ...style}}>
      {children}
    </div>
  );
};

// masked line rise
const Rise: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  children,
  style,
}) => {
  const s = useSpring(delay);
  return (
    <span style={{display: 'block', overflow: 'hidden', paddingBottom: '0.04em', ...style}}>
      <span style={{display: 'block', transform: `translateY(${(1 - s) * 110}%)`}}>{children}</span>
    </span>
  );
};

const Sweep: React.FC<{delay?: number; style?: React.CSSProperties}> = ({delay = 0, style}) => {
  const s = useSpring(delay);
  return <div style={{...style, transform: `scaleX(${s})`, transformOrigin: 'left center'}} />;
};

const Count: React.FC<{delay: number; dur: number; target: number; prefix?: string; style?: React.CSSProperties}> = ({
  delay,
  dur,
  target,
  prefix = '',
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const e = 1 - Math.pow(1 - p, 3);
  return <span style={style}>{prefix + Math.round(target * e).toLocaleString()}</span>;
};

const Mark: React.FC<{size: number; boxed?: boolean; draw?: boolean; delay?: number; stroke?: string}> = ({
  size,
  boxed = true,
  draw = false,
  delay = 0,
  stroke = C.sand,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d1 = draw ? 1 - spring({frame: frame - delay, fps, config: {damping: 200}}) : 0;
  const d2 = draw ? 1 - spring({frame: frame - delay - 11, fps, config: {damping: 200}}) : 0;
  const dot = draw ? spring({frame: frame - delay - 22, fps, config: {damping: 12, mass: 0.6}}) : 1;
  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      {boxed && <rect width="56" height="56" rx="14" fill={C.curb} />}
      <path d="M38 15 C29 15 21 20 21 26 L21 33" stroke={stroke} strokeWidth={7} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={d1} />
      <path d="M21 33 L40 33" stroke={stroke} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d2} />
      <circle cx="40" cy="33" r="3.5" fill={stroke} opacity={draw ? (dot > 0.01 ? 1 : 0) : 1} style={{transform: `scale(${dot})`, transformBox: 'fill-box', transformOrigin: 'center'}} />
    </svg>
  );
};

const Scene: React.FC<{dark: boolean; children: React.ReactNode; gap?: number}> = ({dark, children, gap = 3.2}) => {
  const u = useU();
  return (
    <AbsoluteFill
      style={{
        background: dark ? C.asphalt : C.sand,
        color: dark ? C.sand : C.ink,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: `${9 * u}px ${7 * u}px`,
        gap: `${gap * u}px`,
        fontFamily: HANK,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Label: React.FC<{dark: boolean; children: React.ReactNode; delay?: number; punch?: boolean}> = ({dark, children, delay = 0, punch}) => {
  const u = useU();
  const style: React.CSSProperties = {fontFamily: HANK, fontWeight: 700, fontSize: 2.6 * u, letterSpacing: '0.13em', textTransform: 'uppercase', color: dark ? C.gravelDk : C.gravel};
  return punch ? <Punch delay={delay} style={style}>{children}</Punch> : <In delay={delay} style={style}>{children}</In>;
};

/* small icons */
const Check = ({u}: {u: number}) => (
  <svg width={3.2 * u} height={3.2 * u} viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke={C.lawnDk} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Ex = ({u}: {u: number}) => (
  <svg width={2.9 * u} height={2.9 * u} viewBox="0 0 24 24" fill="none" style={{opacity: 0.6}}><path d="M6 6l12 12M18 6L6 18" stroke={C.gravel} strokeWidth={3} strokeLinecap="round" /></svg>
);
const Bolt = () => (
  <svg width="58%" height="58%" viewBox="0 0 24 24" fill="none"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="#fff" /></svg>
);
const Doc = () => (
  <svg width="58%" height="58%" viewBox="0 0 24 24" fill="none"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="#fff" strokeWidth={2} /><path d="M14 3v4h4M8 13h8M8 17h5" stroke="#fff" strokeWidth={2} strokeLinecap="round" /></svg>
);
const CheckW = () => (
  <svg width="58%" height="58%" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Send = () => (
  <svg width="58%" height="58%" viewBox="0 0 24 24" fill="none"><path d="M3 11l18-8-8 18-2-8-8-2z" fill="#fff" /></svg>
);

/* ---------- scenes ---------- */
const Hook: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const shake = frame > 18 ? Math.sin((frame - 18) * 1.6) * Math.max(0, 1 - (frame - 18) / 10) * u * 0.6 : 0;
  return (
    <Scene dark>
      <Label dark punch>{brand.copy.kicker}</Label>
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 12 * u, lineHeight: 0.96, letterSpacing: '-0.03em', transform: `translateX(${shake}px)`}}>
        <Punch delay={5}>{brand.copy.hook[0]}</Punch>
        <Punch delay={10}>{brand.copy.hook[1]}</Punch>
        <Punch delay={15} style={{color: C.curbDk}}>{brand.copy.hook[2]}</Punch>
      </div>
    </Scene>
  );
};

const Turn: React.FC = () => {
  const u = useU();
  return (
    <Scene dark={false}>
      <Sweep style={{height: 0.9 * u, width: 20 * u, background: C.curb, borderRadius: 99}} />
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 10.5 * u, lineHeight: 0.98, letterSpacing: '-0.03em'}}>
        <Rise delay={6}>{brand.copy.turn[0]}</Rise>
        <Rise delay={14}><span style={{color: C.curb}}>{brand.copy.turn[1]}</span></Rise>
      </div>
    </Scene>
  );
};

const Logo: React.FC = () => {
  const u = useU();
  return (
    <Scene dark>
      <Label dark delay={0}>Meet</Label>
      <div style={{display: 'flex', alignItems: 'center', gap: 2.6 * u}}>
        <Mark size={13 * u} boxed draw delay={6} />
        <In delay={24} dy={0}><span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 13 * u, letterSpacing: '-0.03em'}}>Curb</span></In>
      </div>
    </Scene>
  );
};

const Stat: React.FC<{label: string; children: React.ReactNode; color?: string}> = ({label, children, color}) => {
  const u = useU();
  return (
    <div style={{flex: 1, background: C.concrete, borderRadius: 1.6 * u, padding: 1.5 * u, display: 'flex', flexDirection: 'column', gap: 0.5 * u}}>
      <span style={{fontSize: 1.5 * u, color: C.gravel}}>{label}</span>
      <b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.7 * u, letterSpacing: '-0.03em', color: color || C.ink}}>{children}</b>
    </div>
  );
};

const Phone: React.FC = () => {
  const u = useU();
  const trade: React.CSSProperties = {flex: 1, background: 'rgba(244,239,228,.10)', color: C.sand, borderRadius: 99, padding: `${0.9 * u}px ${1.8 * u}px`, fontSize: 1.9 * u, fontWeight: 600, textAlign: 'left'};
  const job = (time: string, name: string, svc: string, price: string, status: string, sColor: string) => (
    <div style={{background: C.concrete, borderRadius: 1.6 * u, padding: `${1.5 * u}px ${1.7 * u}px`, display: 'flex', justifyContent: 'space-between', gap: 1.2 * u}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 0.35 * u, minWidth: 0}}>
        <span style={{fontSize: 1.5 * u, color: C.gravel}}>{time}</span>
        <b style={{fontFamily: HANK, fontWeight: 700, fontSize: 2.1 * u}}>{name}</b>
        <span style={{fontSize: 1.5 * u, color: C.gravel, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{svc}</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 * u}}>
        <b style={{fontFamily: BRIC, fontWeight: 800, fontSize: 2.2 * u, letterSpacing: '-0.03em'}}>{price}</b>
        <span style={{fontSize: 1.5 * u, fontWeight: 700, color: sColor, display: 'flex', alignItems: 'center', gap: 0.6 * u}}>
          <span style={{width: 1 * u, height: 1 * u, borderRadius: '50%', background: sColor}} />{status}
        </span>
        <span style={{fontSize: 1.35 * u, fontWeight: 700, color: C.curb, background: 'rgba(215,95,31,.14)', padding: `${0.3 * u}px ${1.1 * u}px`, borderRadius: 99}}>Unpaid</span>
      </div>
    </div>
  );
  return (
    <div style={{width: 42 * u, aspectRatio: '9 / 18', background: '#000', borderRadius: 5.2 * u, padding: 1.4 * u, boxShadow: `0 ${2.5 * u}px ${7 * u}px rgba(0,0,0,.4)`}}>
      <div style={{width: '100%', height: '100%', borderRadius: 4 * u, overflow: 'hidden', background: C.sand, display: 'flex', flexDirection: 'column', color: C.ink, textAlign: 'left'}}>
        <div style={{background: C.asphalt, display: 'flex', alignItems: 'center', gap: 1.4 * u, padding: `${2.2 * u}px ${2.4 * u}px ${1.8 * u}px`}}>
          <Mark size={4.6 * u} boxed />
          <span style={trade}>All trades ⌄</span>
        </div>
        <div style={{flex: 1, padding: 2.2 * u, display: 'flex', flexDirection: 'column', gap: 1.5 * u, overflow: 'hidden'}}>
          <div style={{fontSize: 1.9 * u, color: C.gravel}}>Good evening</div>
          <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.6 * u, lineHeight: 1, letterSpacing: '-0.03em'}}>Friday, June 12</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 1.2 * u, background: C.concrete, borderLeft: `${0.7 * u}px solid ${C.curb}`, borderRadius: 1.4 * u, padding: `${1.3 * u}px ${1.6 * u}px`, fontSize: 1.85 * u, fontWeight: 600}}>
            <svg width={2.6 * u} height={2.6 * u} viewBox="0 0 24 24" fill={C.curb}><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" /></svg> Thunderstorm · 90°/72° · 29%
          </div>
          <div style={{display: 'flex', gap: 1.3 * u}}>
            <Stat label="Stops"><Count delay={30} dur={26} target={8} /></Stat>
            <Stat label="Expected" color={C.lawn}><Count delay={30} dur={30} target={1244} prefix="$" /></Stat>
            <Stat label="Owed you" color={C.curb}><Count delay={30} dur={30} target={3102} prefix="$" /></Stat>
          </div>
          <div style={{background: C.curb, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2 * u, fontFamily: BRIC, fontWeight: 800, fontSize: 2.2 * u, letterSpacing: '-0.02em', padding: 2 * u, borderRadius: 2 * u}}>
            <svg width={2.4 * u} height={2.4 * u} viewBox="0 0 24 24" fill="none"><path d="M3 11l18-8-8 18-2-8-8-2z" fill="#fff" /></svg> Start today's route · 8 stops
          </div>
          <div style={{fontSize: 1.5 * u, letterSpacing: '0.13em', color: C.gravel, fontWeight: 700, textTransform: 'uppercase'}}>Today's run</div>
          {job('8:00a', 'Marcus Webb', 'Full Detail · Auto Detailing', '$286', 'In progress', C.curb)}
          {job('9:30a', 'The Hollises', 'Window Washing', '$280', 'En route', C.sky)}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', padding: `${1.4 * u}px ${2.4 * u}px ${2 * u}px`, borderTop: '1px solid rgba(33,30,26,.08)'}}>
          {['Home', 'Jobs', 'Route', 'Clients', 'Money'].map((tab, i) => (
            <span key={tab} style={{fontSize: 1.45 * u, fontWeight: 600, color: i === 0 ? C.curb : C.gravel}}>{tab}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{delay: number; dark: boolean; icon: React.ReactNode; bg: string; children: React.ReactNode; fromX?: boolean}> = ({delay, dark, icon, bg, children, fromX}) => {
  const u = useU();
  const s = useSpring(delay, fromX ? 14 : 200);
  const tx = fromX ? `translateX(${(1 - s) * -14}%)` : `translateY(${(1 - s) * 30}%)`;
  return (
    <div style={{opacity: s, transform: tx, display: 'flex', alignItems: 'center', gap: 2.4 * u, background: dark ? C.asphalt2 : C.concrete, borderRadius: 3 * u, padding: `${2.6 * u}px ${3.4 * u}px`, fontFamily: HANK, fontWeight: 600, fontSize: 3.4 * u, textAlign: 'left', color: dark ? C.sand : C.ink}}>
      <span style={{flex: '0 0 auto', width: 6.4 * u, height: 6.4 * u, borderRadius: 2 * u, background: bg, display: 'grid', placeItems: 'center'}}>{icon}</span>
      {children}
    </div>
  );
};

const Feature1: React.FC = () => {
  const u = useU();
  return (
    <Scene dark={false} gap={4}>
      <In><span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 5.2 * u, letterSpacing: '-0.02em'}}>{brand.copy.feature1Heading}</span></In>
      <In delay={5} dy={4}><Phone /></In>
      <Chip delay={52} dark={false} bg={C.curb} icon={<Bolt />}>{brand.copy.feature1Chip}</Chip>
    </Scene>
  );
};

const Feature2: React.FC = () => {
  const icons = [<Doc key="d" />, <CheckW key="c" />, <Send key="s" />];
  const bgs = [C.curb, C.lawn, C.sky];
  const u = useU();
  return (
    <Scene dark gap={4}>
      <In><span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 5.2 * u, letterSpacing: '-0.02em'}}>{brand.copy.feature2Heading}</span></In>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2.6 * u, width: '100%'}}>
        {brand.copy.feature2Chips.map((c, i) => (
          <Chip key={i} delay={8 + i * 5} dark bg={bgs[i]} icon={icons[i]} fromX>{c}</Chip>
        ))}
      </div>
    </Scene>
  );
};

const CMP_ROWS: {label: string; vals?: string[]}[] = [
  {label: 'Price', vals: ['$89 · $4.99mo', '$39-599', '$69-349', '$0-49']},
  {label: 'Built for your phone'},
  {label: 'Every trade in one app'},
  {label: 'No monthly fee, ever'},
];

const Comparison: React.FC = () => {
  const u = useU();
  const cols = '1.15fr .96fr .82fr .78fr .92fr';
  const cell: React.CSSProperties = {display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'};
  return (
    <Scene dark gap={3.6}>
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 7 * u, lineHeight: 1, letterSpacing: '-0.03em'}}>
        <Rise delay={2}>Without the price.</Rise>
        <Rise delay={9}><span style={{color: C.curbDk}}>Without the bloat.</span></Rise>
      </div>
      <In delay={13} dy={5} style={{width: '100%'}}>
        <div style={{width: '100%', background: C.asphalt2, borderRadius: 2.6 * u, padding: `${0.4 * u}px ${2.4 * u}px ${1.6 * u}px`}}>
          <div style={{display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: 0.6 * u, padding: `${1.75 * u}px 0`}}>
            <span />
            <span style={{...cell, background: C.curb, color: '#fff', fontFamily: BRIC, fontWeight: 800, borderRadius: 99, padding: `${0.5 * u}px ${1.6 * u}px`, fontSize: 1.9 * u}}>Curb</span>
            {['Jobber', 'HCP', 'Yardbook'].map((h) => (
              <span key={h} style={{...cell, color: C.gravelDk, fontWeight: 700, fontSize: 1.9 * u}}>{h}</span>
            ))}
          </div>
          {CMP_ROWS.map((r) => (
            <div key={r.label} style={{display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: 0.6 * u, padding: `${1.75 * u}px 0`, borderTop: '1px solid rgba(244,239,228,.10)', fontSize: 2.2 * u}}>
              <span style={{textAlign: 'left', color: C.sand, fontWeight: 600}}>{r.label}</span>
              {r.vals ? (
                r.vals.map((v, i) => (
                  <span key={i} style={{...cell, fontFamily: BRIC, fontWeight: 800, fontSize: 1.8 * u, letterSpacing: '-0.02em', color: i === 0 ? C.curbDk : C.gravelDk}}>{v}</span>
                ))
              ) : (
                <>
                  <span style={cell}><span style={{width: 5.8 * u, height: 5.8 * u, borderRadius: '50%', background: 'rgba(78,150,112,.22)', display: 'grid', placeItems: 'center'}}><Check u={u} /></span></span>
                  {[0, 1, 2].map((i) => (<span key={i} style={cell}><Ex u={u} /></span>))}
                </>
              )}
            </div>
          ))}
        </div>
      </In>
      <In delay={40}><span style={{fontFamily: HANK, fontWeight: 700, letterSpacing: '0.06em', color: C.curbDk, fontSize: 2.9 * u}}>getcurb.net</span></In>
    </Scene>
  );
};

const AppStore = ({u}: {u: number}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 2.4 * u, background: C.asphalt, color: C.sand, borderRadius: 2.2 * u, padding: `${2.2 * u}px ${4.5 * u}px`}}>
    <svg width={5.2 * u} height={5.2 * u} viewBox="0 0 24 24" fill="currentColor"><path d="M16.4 12.7c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 .9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-.9 2.3-1.9.7-1.1 1-2.1 1-2.2 0 0-1.9-.7-1.9-3zM14.6 6.3c.5-.6.9-1.5.8-2.3-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.7-.4 2.2-1z" /></svg>
    <span style={{textAlign: 'left', lineHeight: 1.05}}>
      <small style={{fontFamily: HANK, fontSize: 1.9 * u, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7, display: 'block'}}>Download on the</small>
      <b style={{fontFamily: BRIC, fontSize: 3.4 * u, fontWeight: 800, letterSpacing: '-0.02em'}}>App Store</b>
    </span>
  </div>
);

const Endcard: React.FC = () => {
  const u = useU();
  return (
    <Scene dark={false} gap={3.2}>
      <div style={{marginBottom: 1 * u}}><Mark size={26 * u} boxed draw delay={8} /></div>
      <In delay={32} dy={0}><span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 17 * u, letterSpacing: '-0.03em', lineHeight: 1}}>Curb</span></In>
      <Sweep delay={40} style={{height: 1.1 * u, width: 26 * u, background: C.curb, borderRadius: 99}} />
      <In delay={46}><span style={{fontFamily: HANK, fontWeight: 600, fontSize: 3.4 * u, color: C.ink}}>{brand.copy.ctaSub}</span></In>
      <In delay={54}><AppStore u={u} /></In>
      <In delay={62}><span style={{fontFamily: HANK, fontWeight: 700, letterSpacing: '0.06em', color: C.curb, fontSize: 2.9 * u}}>getcurb.net</span></In>
    </Scene>
  );
};

/* ---------- composition ---------- */
export const CurbAd: React.FC = () => {
  const {width, height} = useVideoConfig();
  const t = linearTiming({durationInFrames: TR});
  return (
    <AbsoluteFill style={{background: C.asphalt}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENES[0]}><Hook /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SCENES[1]}><Turn /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SCENES[2]}><Logo /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SCENES[3]}><Feature1 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SCENES[4]}><Feature2 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-top'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SCENES[5]}><Comparison /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={clockWipe({width, height})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SCENES[6]}><Endcard /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
