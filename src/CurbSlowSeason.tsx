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
import {clockWipe} from '@remotion/transitions/clock-wipe';
import {loadFont} from '@remotion/fonts';

// Load Curb's real fonts from public/fonts (no network at render time).
const BRIC = 'Bricolage Grotesque';
const HANK = 'Hanken Grotesk';
const fontHandle = delayRender('load-fonts-slowseason');
Promise.all([
  loadFont({family: BRIC, url: staticFile('fonts/bricolage-grotesque-latin-wght-normal.woff2'), weight: '400 800'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-400-normal.woff2'), weight: '400'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-700-normal.woff2'), weight: '700'}),
])
  .then(() => continueRender(fontHandle))
  .catch(() => continueRender(fontHandle));

/* palette (Curb Design Bible) */
const C = {
  sand: '#F4EFE4',
  ink: '#211E1A',
  asphalt: '#1D1A16',
  asphalt2: '#26221C',
  curb: '#D75F1F',
  curbDk: '#E56A25',
  marigold: '#F3A847',
  lawn: '#3C7A59',
  lawnDk: '#4E9670',
  ice: '#8CC5E6',
  red: '#D64B2E',
  gravel: '#7A7264',
  gravelDk: '#BDB4A4',
};

export const FPS = 30;
const TR = 14;
// on-screen frames per scene (before transition padding). starts = cumulative.
const BASE = [108, 108, 108, 108, 108, 108, 120];
const SEQ = BASE.map((b) => b + TR);
const STARTS = BASE.reduce<number[]>((acc, _b, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + BASE[i - 1]);
  return acc;
}, []);
const OUTRO_START = STARTS[6];
export const DURATION = SEQ.reduce((a, b) => a + b, 0) - TR * (SEQ.length - 1);

/* ---------- helpers ---------- */
const useU = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};
// bottom safe zone: widest on 9:16 (caption / capture UI), tighter on square.
const useSafe = () => {
  const {width, height} = useVideoConfig();
  const r = height / width;
  return r > 1.5 ? 28 : r > 1.1 ? 14 : 10;
};
const useSpring = (delay = 0, damping = 200, mass = 1) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, mass}});
};

const In: React.FC<{delay?: number; dy?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  dy = 6,
  children,
  style,
}) => {
  const u = useU();
  const s = useSpring(delay);
  return (
    <div style={{opacity: interpolate(s, [0, 0.9], [0, 1], {extrapolateRight: 'clamp'}), transform: `translateY(${(1 - s) * dy * u}px)`, ...style}}>
      {children}
    </div>
  );
};

const Pop: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({delay = 0, children, style}) => {
  const s = useSpring(delay, 13, 0.7);
  return (
    <div style={{opacity: interpolate(s, [0, 0.55], [0, 1], {extrapolateRight: 'clamp'}), transform: `translateY(${(1 - Math.min(s, 1)) * 18}%) scale(${0.86 + s * 0.14})`, ...style}}>
      {children}
    </div>
  );
};

const Rise: React.FC<{delay?: number; children: React.ReactNode}> = ({delay = 0, children}) => {
  const s = useSpring(delay);
  return (
    <span style={{display: 'block', overflow: 'hidden', paddingBottom: '0.04em'}}>
      <span style={{display: 'block', transform: `translateY(${(1 - s) * 110}%)`}}>{children}</span>
    </span>
  );
};

const Sweep: React.FC<{delay?: number; style?: React.CSSProperties}> = ({delay = 0, style}) => {
  const s = useSpring(delay);
  return <div style={{...style, transform: `scaleX(${s})`, transformOrigin: 'left center'}} />;
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

/* snowflake icon for the cover badge */
const Snowflake: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.ice} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" style={{flex: '0 0 auto'}}>
    <line x1="12" y1="2.5" x2="12" y2="21.5" />
    <line x1="3.8" y1="7.25" x2="20.2" y2="16.75" />
    <line x1="20.2" y1="7.25" x2="3.8" y2="16.75" />
    <path d="M12 5.4 l-2.1 1.8 M12 5.4 l2.1 1.8 M12 18.6 l-2.1 -1.8 M12 18.6 l2.1 -1.8" />
    <path d="M5.5 6.9 l0.1 2.75 M5.5 6.9 l2.7 -0.5 M18.5 17.1 l-0.1 -2.75 M18.5 17.1 l-2.7 0.5" />
    <path d="M18.5 6.9 l-0.1 2.75 M18.5 6.9 l-2.7 -0.5 M5.5 17.1 l0.1 -2.75 M5.5 17.1 l2.7 0.5" />
  </svg>
);

/* left-aligned scene with a bottom safe zone so content rides high, clear of captions */
const RScene: React.FC<{dark: boolean; children: React.ReactNode}> = ({dark, children}) => {
  const u = useU();
  const safe = useSafe();
  return (
    <AbsoluteFill
      style={{
        background: dark ? C.asphalt : C.sand,
        color: dark ? C.sand : C.ink,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        textAlign: 'left',
        padding: `${8 * u}px ${8 * u}px ${safe * u}px`,
        gap: `${2.9 * u}px`,
        fontFamily: HANK,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Num: React.FC<{n: number; dark: boolean}> = ({n, dark}) => {
  const u = useU();
  return (
    <In delay={0}>
      <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 4.2 * u, letterSpacing: '-0.02em', color: dark ? C.curbDk : C.curb}}>#{n}</span>
    </In>
  );
};

const Head: React.FC<{size: number; delay?: number; lines: {t: string; accent?: boolean}[]; dark: boolean}> = ({size, delay = 5, lines, dark}) => {
  const u = useU();
  return (
    <h2 style={{margin: 0, fontFamily: BRIC, fontWeight: 800, fontSize: size * u, lineHeight: 0.96, letterSpacing: '-0.02em', textTransform: 'uppercase'}}>
      {lines.map((l, i) => (
        <Rise key={i} delay={delay + i * 4}>
          <span style={l.accent ? {color: dark ? C.curbDk : C.curb} : undefined}>{l.t}</span>
        </Rise>
      ))}
    </h2>
  );
};

const Rule: React.FC<{dark: boolean; delay?: number}> = ({dark, delay = 6}) => {
  const u = useU();
  return <Sweep delay={delay} style={{height: 0.9 * u, width: 16 * u, background: dark ? C.curbDk : C.curb, borderRadius: 99, margin: `${0.6 * u}px 0`}} />;
};

const Body: React.FC<{dark: boolean; delay?: number; children: React.ReactNode}> = ({dark, delay = 17, children}) => {
  const u = useU();
  return (
    <In delay={delay}>
      <p style={{margin: 0, fontFamily: HANK, fontWeight: 500, fontSize: 4.2 * u, lineHeight: 1.38, maxWidth: '96%', color: dark ? C.gravelDk : C.gravel}}>{children}</p>
    </In>
  );
};

/* ---------- scenes ---------- */
const Cover: React.FC = () => {
  const u = useU();
  return (
    <RScene dark>
      <Pop delay={0}>
        <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 24 * u, lineHeight: 0.8, letterSpacing: '-0.04em'}}>5</div>
      </Pop>
      <Head dark size={9.2} delay={8} lines={[{t: 'Ways to'}, {t: 'survive the'}, {t: 'slow season', accent: true}]} />
      <Pop delay={20} style={{width: '100%'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 2.4 * u, width: '100%', border: `${0.35 * u}px solid rgba(244,239,228,.18)`, borderRadius: 3 * u, padding: `${2.8 * u}px ${3.2 * u}px`}}>
          <Snowflake size={6 * u} />
          <span style={{fontFamily: HANK, fontWeight: 700, fontSize: 3.2 * u, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.25}}>Winter comes whether you planned or not.</span>
        </div>
      </Pop>
    </RScene>
  );
};

const Tip1: React.FC = () => (
  <RScene dark={false}>
    <Num n={1} dark={false} />
    <Head dark={false} size={10.2} lines={[{t: 'Book fall'}, {t: 'cleanups now'}]} />
    <Rule dark={false} />
    <Body dark={false}>Leaf removal and final cleanups get booked in September, not November. The guys with a packed fall asked while it was still summer.</Body>
  </RScene>
);

const CRow: React.FC<{delay: number; yes: boolean; dark: boolean; divide?: boolean; children: React.ReactNode}> = ({delay, yes, dark, divide, children}) => {
  const u = useU();
  return (
    <Pop delay={delay} style={{width: '100%'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 2.4 * u, fontFamily: HANK, fontWeight: 700, fontSize: 4.2 * u, borderTop: divide ? `1px solid ${dark ? 'rgba(244,239,228,.12)' : 'rgba(33,30,26,.10)'}` : 'none', paddingTop: divide ? 2.4 * u : 0}}>
        <span style={{flex: '0 0 auto', width: 6 * u, height: 6 * u, borderRadius: 1.6 * u, display: 'grid', placeItems: 'center', background: yes ? C.lawn : C.red}}>
          {yes ? (
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4 10-11" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : (
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth={3} strokeLinecap="round" /></svg>
          )}
        </span>
        <span>{children}</span>
      </div>
    </Pop>
  );
};

const Tip2: React.FC = () => {
  const u = useU();
  return (
    <RScene dark>
      <Num n={2} dark />
      <Head dark size={10.2} lines={[{t: 'Sell a winter'}, {t: 'service'}]} />
      <Rule dark />
      <div style={{display: 'flex', flexDirection: 'column', gap: 2.4 * u, width: '100%'}}>
        <CRow delay={17} yes dark>Gutter cleaning after leaf drop</CRow>
        <CRow delay={23} yes dark divide>Snow removal or salting</CRow>
        <CRow delay={29} yes dark divide>Holiday light install</CRow>
      </div>
    </RScene>
  );
};

const Tip3: React.FC = () => {
  const u = useU();
  return (
    <RScene dark={false}>
      <Num n={3} dark={false} />
      <Head dark={false} size={10.2} lines={[{t: 'Bank it while'}, {t: "it's green"}]} />
      <Rule dark={false} />
      <Pop delay={19} style={{width: '100%'}}>
        <div style={{background: C.asphalt2, borderRadius: 3 * u, padding: `${3 * u}px ${3.4 * u}px`, width: '100%'}}>
          <b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 8.8 * u, letterSpacing: '-0.03em', color: C.marigold, lineHeight: 1, marginBottom: 1 * u}}>3 mo</b>
          <span style={{fontFamily: HANK, fontWeight: 500, fontSize: 3.2 * u, color: C.gravelDk, lineHeight: 1.35}}>of slow months most crews have to cover on last season's money</span>
        </div>
      </Pop>
      <Body dark={false} delay={30}>Set aside one cut a week during the busy season and winter stops being a panic.</Body>
    </RScene>
  );
};

const Tip4: React.FC = () => {
  const u = useU();
  return (
    <RScene dark>
      <Num n={4} dark />
      <Head dark size={10.2} lines={[{t: 'Stay in front'}, {t: 'of them'}]} />
      <Rule dark />
      <Body dark delay={17}>Out of sight in winter means forgotten in spring.</Body>
      <In delay={24} style={{marginTop: 1.4 * u}}>
        <span style={{fontFamily: HANK, fontWeight: 800, fontSize: 3.2 * u, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.curbDk}}>Send this in February:</span>
      </In>
      <In delay={30}>
        <p style={{margin: 0, fontFamily: BRIC, fontWeight: 800, fontSize: 6 * u, lineHeight: 1.05, letterSpacing: '-0.02em', color: C.sand, maxWidth: '98%'}}>&ldquo;Want me to put you back on the schedule for spring?&rdquo;</p>
      </In>
    </RScene>
  );
};

const Tip5: React.FC = () => (
  <RScene dark={false}>
    <Num n={5} dark={false} />
    <Head dark={false} size={10.2} lines={[{t: 'Fix your gear'}, {t: 'before March'}]} />
    <Rule dark={false} />
    <Body dark={false}>Blades, belts, and oil changes are cheap and easy to book in January. In April every shop has a two week wait and you are losing cuts.</Body>
  </RScene>
);

const Outro: React.FC = () => {
  const u = useU();
  return (
    <RScene dark>
      <Head dark size={10.4} delay={4} lines={[{t: 'Beat the'}, {t: 'slow season.', accent: true}]} />
      <Rule dark delay={4} />
      <Body dark delay={14}>Quotes, jobs, routes, and invoices, all in one app. Try Curb free, link in bio.</Body>
      <div style={{display: 'flex', alignItems: 'center', gap: 2.2 * u, marginTop: 2 * u}}>
        <Mark size={9 * u} draw delay={20} />
        <In delay={44} dy={0}><span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 8 * u, letterSpacing: '-0.03em', color: C.sand}}>Curb</span></In>
      </div>
    </RScene>
  );
};

/* story-style progress tracker across the five tips */
const Tracker: React.FC = () => {
  const u = useU();
  const frame = useCurrentFrame();
  const on = frame >= STARTS[1] && frame < OUTRO_START;
  const fade = interpolate(frame, [STARTS[1], STARTS[1] + 8, OUTRO_START - 8, OUTRO_START], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (!on) return null;
  const segStart = [STARTS[1], STARTS[2], STARTS[3], STARTS[4], STARTS[5]];
  const segEnd = [STARTS[2], STARTS[3], STARTS[4], STARTS[5], OUTRO_START];
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <div style={{position: 'absolute', top: 5 * u, left: 8 * u, right: 8 * u, display: 'flex', gap: 1.1 * u}}>
        {segStart.map((s, i) => {
          const w = interpolate(frame, [s, segEnd[i]], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          return (
            <span key={i} style={{flex: 1, height: 1.1 * u, borderRadius: 99, background: 'rgba(122,114,100,.42)', overflow: 'hidden'}}>
              <span style={{display: 'block', height: '100%', width: `${w}%`, background: C.curb, borderRadius: 99}} />
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- composition ---------- */
export const CurbSlowSeason: React.FC = () => {
  const {width, height} = useVideoConfig();
  const t = linearTiming({durationInFrames: TR});
  return (
    <AbsoluteFill style={{background: C.asphalt}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SEQ[0]}><Cover /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[1]}><Tip1 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={clockWipe({width, height})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[2]}><Tip2 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-left'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[3]}><Tip3 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({direction: 'from-bottom'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[4]}><Tip4 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({direction: 'from-top'})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[5]}><Tip5 /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={clockWipe({width, height})} timing={t} />
        <TransitionSeries.Sequence durationInFrames={SEQ[6]}><Outro /></TransitionSeries.Sequence>
      </TransitionSeries>
      <Tracker />
    </AbsoluteFill>
  );
};
