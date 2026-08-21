import React from 'react';
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {loadFont} from '@remotion/fonts';

const BRIC = 'Bricolage Grotesque';
const HANK = 'Hanken Grotesk';
const fh = delayRender('fiveways-fonts');
Promise.all([
  loadFont({family: BRIC, url: staticFile('fonts/bricolage-grotesque-latin-wght-normal.woff2'), weight: '400 800'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-400-normal.woff2'), weight: '400'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-500-normal.woff2'), weight: '500'}),
  loadFont({family: HANK, url: staticFile('fonts/hanken-grotesk-latin-700-normal.woff2'), weight: '700'}),
]).then(() => continueRender(fh)).catch(() => continueRender(fh));

const C = {
  sand: '#F4EFE4', concrete: '#FBF8F1', pebble: '#ECE6D8', ink: '#211E1A',
  asphalt: '#1D1A16', asphalt2: '#26221C', curb: '#D75F1F', curbDk: '#E56A25',
  lawn: '#3C7A59', sky: '#2F6FB0', gravel: '#7A7264', gravelDk: '#BDB4A4',
};

export const FPS = 30;
const TR = 14;
// hook, tip1..tip5, outro
const SEQ = [84, 126, 126, 126, 126, 138, 96];
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
const up = (p: number, dy = 20) => ({opacity: p, transform: `translateY(${(1 - p) * dy}px)`});

/* ---------- shared pieces ---------- */
const Bg: React.FC<{src: string; i: number; dur: number}> = ({src, i, dur}) => {
  const frame = useCurrentFrame();
  const dir = i % 2 === 0 ? 1 : -1;
  const p = interpolate(frame, [0, dur], [0, 1], CL);
  const scale = interpolate(p, [0, 1], dir > 0 ? [1.05, 1.13] : [1.13, 1.05]);
  const dy = interpolate(p, [0, 1], dir > 0 ? [-1.4, 1.4] : [1.4, -1.4]);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: C.asphalt}}>
      <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateY(${dy}%)`}} />
    </AbsoluteFill>
  );
};

// legibility scrim: darker at the anchored edge, clear over the photo
const Scrim: React.FC<{from?: 'bottom' | 'top'}> = ({from = 'bottom'}) => (
  <>
    <AbsoluteFill style={{background: 'rgba(20,18,15,0.20)'}} />
    <AbsoluteFill
      style={{
        background:
          from === 'bottom'
            ? 'linear-gradient(to top, rgba(20,18,15,0.94) 0%, rgba(20,18,15,0.82) 26%, rgba(20,18,15,0.30) 52%, rgba(20,18,15,0.05) 72%)'
            : 'linear-gradient(to bottom, rgba(20,18,15,0.94) 0%, rgba(20,18,15,0.82) 26%, rgba(20,18,15,0.30) 52%, rgba(20,18,15,0.05) 72%)',
      }}
    />
  </>
);

const Logo: React.FC<{u: number; delay?: number}> = ({u, delay = 3}) => {
  const s = useSpr(delay);
  return (
    <div style={{position: 'absolute', top: 6 * u, left: 5.5 * u, display: 'flex', alignItems: 'center', gap: 1.4 * u, opacity: s, zIndex: 6}}>
      <svg width={4.6 * u} height={4.6 * u} viewBox="0 0 56 56">
        <path d="M38 15 C29 15 21 20 21 26 L21 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M21 33 L40 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
        <circle cx="40" cy="33" r="3.6" fill={C.sand} />
      </svg>
      <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 3.7 * u, letterSpacing: '-0.02em', color: C.sand}}>Curb</span>
    </div>
  );
};

const TextBlock: React.FC<{u: number; children: React.ReactNode; from?: 'bottom' | 'top'}> = ({u, children, from = 'bottom'}) => (
  <AbsoluteFill style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: from === 'bottom' ? 'flex-end' : 'flex-start', padding: `${from === 'top' ? 15 : 8}% ${5.5 * u}px ${from === 'bottom' ? 9 : 8}%`, textAlign: 'left'}}>
    {children}
  </AbsoluteFill>
);

const Kicker: React.FC<{u: number; s: number; children: React.ReactNode}> = ({u, s, children}) => (
  <div style={{...up(s, 14), fontFamily: HANK, fontWeight: 700, fontSize: 2.5 * u, letterSpacing: '0.18em', color: C.curbDk}}>{children}</div>
);
const Headline: React.FC<{u: number; lines: string[]; d: number}> = ({u, lines, d}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 6.9 * u, lineHeight: 0.98, letterSpacing: '-0.01em', color: C.sand, textTransform: 'uppercase', margin: `${1.4 * u}px 0 ${1.8 * u}px`}}>
      {lines.map((ln, i) => {
        const p = spring({frame: frame - (d + i * 5), fps, config: {damping: 18, mass: 0.8}});
        return <div key={i} style={up(p, 22)}>{ln}</div>;
      })}
    </div>
  );
};
const Underline: React.FC<{u: number; s: number}> = ({u, s}) => (
  <div style={{width: 9 * u, height: 0.7 * u, borderRadius: 99, background: C.curb, transformOrigin: 'left', transform: `scaleX(${s})`}} />
);
const Body: React.FC<{u: number; s: number; children: React.ReactNode}> = ({u, s, children}) => (
  <div style={{...up(s, 16), fontFamily: HANK, fontWeight: 500, fontSize: 3.1 * u, lineHeight: 1.4, color: 'rgba(244,239,228,0.92)', maxWidth: '90%', marginTop: 2.4 * u}}>{children}</div>
);

/* ---------- cover ---------- */
const CoverScene: React.FC<{dur: number}> = ({dur}) => {
  const u = useU();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const five = spring({frame: frame - 6, fps, config: {damping: 12, mass: 0.7}});
  const l1 = spring({frame: frame - 16, fps, config: {damping: 18, mass: 0.8}});
  const l2 = spring({frame: frame - 22, fps, config: {damping: 18, mass: 0.8}});
  const sub = useSpr(34);
  return (
    <AbsoluteFill>
      <Bg src="slides/raw/bg-hook.jpg" i={0} dur={dur} />
      <Scrim />
      <Logo u={u} />
      <TextBlock u={u}>
        <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 26 * u, lineHeight: 0.8, letterSpacing: '-0.04em', color: C.sand, transform: `scale(${0.7 + Math.min(five, 1) * 0.3})`, transformOrigin: 'left bottom', opacity: five}}>5</div>
        <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 7.3 * u, lineHeight: 0.98, letterSpacing: '-0.01em', textTransform: 'uppercase', margin: `${1 * u}px 0 0`}}>
          <div style={{...up(l1, 22), color: C.sand}}>Ways to fit</div>
          <div style={{...up(l1, 22), color: C.sand}}>more yards</div>
          <div style={{...up(l2, 22), color: C.curbDk}}>in a day</div>
        </div>
        <div style={{...up(sub, 14), fontFamily: HANK, fontWeight: 700, fontSize: 3.2 * u, color: C.gravelDk, marginTop: 2.4 * u}}>Same crew. Same hours. More cuts.</div>
      </TextBlock>
    </AbsoluteFill>
  );
};

/* ---------- generic tip (text bottom) ---------- */
const TipScene: React.FC<{n: number; src: string; head: string[]; body: string; i: number; dur: number}> = ({n, src, head, body, i, dur}) => {
  const u = useU();
  const kick = useSpr(6, 16, 0.8);
  const line = useSpr(24, 20, 0.8);
  const bodyS = useSpr(32);
  return (
    <AbsoluteFill>
      <Bg src={src} i={i} dur={dur} />
      <Scrim />
      <Logo u={u} />
      <TextBlock u={u}>
        <Kicker u={u} s={kick}>TIP #{n}</Kicker>
        <Headline u={u} lines={head} d={14} />
        <Underline u={u} s={Math.min(line, 1)} />
        <Body u={u} s={bodyS}>{body}</Body>
      </TextBlock>
    </AbsoluteFill>
  );
};

/* ---------- tip 5: text top + crisp route phone ---------- */
const RoutePhone: React.FC<{u: number}> = ({u}) => {
  const rows = [
    ['1', 'Marcus Webb', 'Auto Detailing'],
    ['2', 'Reyna Ortiz', 'Auto Detailing'],
    ['3', 'The Hollises', 'Window Washing'],
    ['4', 'Jordan Vance', 'Pressure Washing'],
  ];
  return (
    <div style={{width: 50 * u, aspectRatio: '9 / 19', background: '#000', borderRadius: 5 * u, padding: 1.2 * u, boxShadow: `0 ${3 * u}px ${9 * u}px rgba(0,0,0,.55)`}}>
      <div style={{width: '100%', height: '100%', borderRadius: 3.9 * u, overflow: 'hidden', background: C.sand, display: 'flex', flexDirection: 'column', textAlign: 'left'}}>
        <div style={{background: C.asphalt, display: 'flex', alignItems: 'center', gap: 1.2 * u, padding: `${4 * u}px ${2 * u}px ${1.4 * u}px`}}>
          <div style={{width: 3.6 * u, height: 3.6 * u, borderRadius: 1 * u, background: C.curb, display: 'grid', placeItems: 'center'}}>
            <svg width={2.4 * u} height={2.4 * u} viewBox="0 0 56 56"><path d="M38 16 C30 16 22 20 22 26 L22 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" /><path d="M22 33 L39 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" /></svg>
          </div>
          <span style={{flex: 1, background: 'rgba(244,239,228,.10)', color: C.sand, borderRadius: 99, padding: `${0.7 * u}px ${1.5 * u}px`, fontSize: 1.6 * u, fontWeight: 600, fontFamily: HANK}}>All trades ⌄</span>
        </div>
        <div style={{flex: 1, padding: 1.8 * u, display: 'flex', flexDirection: 'column', gap: 1.3 * u, color: C.ink}}>
          <div style={{display: 'flex', background: C.concrete, borderRadius: 1.6 * u, padding: `${1.5 * u}px 0`}}>
            {[['8', 'stops'], ['27.3', 'miles'], ['4:20', 'drive']].map(([a, b]) => (
              <div key={b} style={{flex: 1, textAlign: 'center'}}><b style={{display: 'block', fontFamily: BRIC, fontWeight: 800, fontSize: 2.7 * u, letterSpacing: '-0.03em'}}>{a}</b><span style={{fontSize: 1.3 * u, color: C.gravel, fontFamily: HANK}}>{b}</span></div>
            ))}
          </div>
          <div style={{background: C.curb, color: '#fff', textAlign: 'center', fontFamily: BRIC, fontWeight: 800, fontSize: 2 * u, padding: 1.6 * u, borderRadius: 1.8 * u}}>Start route</div>
          {rows.map(([nn, who, svc]) => (
            <div key={nn} style={{background: C.concrete, borderRadius: 1.5 * u, padding: `${1.2 * u}px ${1.5 * u}px`, display: 'flex', alignItems: 'center', gap: 1.4 * u}}>
              <span style={{width: 3.2 * u, height: 3.2 * u, borderRadius: '50%', background: C.curb, color: '#fff', fontFamily: BRIC, fontWeight: 800, fontSize: 1.8 * u, display: 'grid', placeItems: 'center', flexShrink: 0}}>{nn}</span>
              <div><div style={{fontFamily: HANK, fontWeight: 700, fontSize: 1.95 * u}}>{who}</div><div style={{fontSize: 1.4 * u, color: C.gravel, fontFamily: HANK}}>{svc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Tip5Scene: React.FC<{dur: number}> = ({dur}) => {
  const u = useU();
  const kick = useSpr(6, 16, 0.8);
  const line = useSpr(24, 20, 0.8);
  const bodyS = useSpr(32);
  const phone = useSpr(28, 15, 0.9);
  return (
    <AbsoluteFill>
      <Bg src="slides/raw/bg-tip5.jpg" i={5} dur={dur} />
      <AbsoluteFill style={{background: 'rgba(20,18,15,0.34)'}} />
      <Scrim from="top" />
      <Logo u={u} />
      <TextBlock u={u} from="top">
        <Kicker u={u} s={kick}>TIP #5</Kicker>
        <Headline u={u} lines={['Let the route', 'build itself']} d={14} />
        <Underline u={u} s={Math.min(line, 1)} />
        <Body u={u} s={bodyS}>Every stop in order before you leave the house.</Body>
      </TextBlock>
      <div style={{position: 'absolute', left: 0, right: 0, top: '55%', display: 'flex', justifyContent: 'center', opacity: interpolate(phone, [0, 0.5], [0, 1], CL), transform: `translateY(${(1 - Math.min(phone, 1)) * 34}%)`}}>
        <RoutePhone u={u} />
      </div>
    </AbsoluteFill>
  );
};

/* ---------- outro ---------- */
const OutroScene: React.FC = () => {
  const u = useU();
  const h1 = useSpr(4, 16, 0.8);
  const h2 = useSpr(10, 16, 0.8);
  const body = useSpr(20);
  const logo = useSpr(30, 13, 0.7);
  return (
    <AbsoluteFill style={{background: C.asphalt, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: `0 ${6 * u}px`, textAlign: 'left'}}>
      <div style={{fontFamily: BRIC, fontWeight: 800, fontSize: 11 * u, lineHeight: 0.98, letterSpacing: '-0.02em', textTransform: 'uppercase'}}>
        <div style={{...up(h1, 20), color: C.sand}}>Try Curb</div>
        <div style={{...up(h2, 20), color: C.curbDk}}>for free.</div>
      </div>
      <div style={{...up(body, 16), fontFamily: HANK, fontWeight: 500, fontSize: 3.4 * u, lineHeight: 1.4, color: C.gravelDk, marginTop: 2.6 * u, maxWidth: '86%'}}>Quotes, jobs, routes, and invoices, all in one app. Link in bio.</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 1.6 * u, marginTop: 5 * u, opacity: logo}}>
        <svg width={5.2 * u} height={5.2 * u} viewBox="0 0 56 56">
          <path d="M38 15 C29 15 21 20 21 26 L21 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
          <path d="M21 33 L40 33" stroke={C.sand} strokeWidth={7} strokeLinecap="round" fill="none" />
          <circle cx="40" cy="33" r="3.6" fill={C.sand} />
        </svg>
        <span style={{fontFamily: BRIC, fontWeight: 800, fontSize: 5.4 * u, letterSpacing: '-0.02em', color: C.sand}}>Curb</span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- progress bar ---------- */
const STARTS: number[] = [];
{
  let acc = 0;
  for (let i = 0; i < SEQ.length; i++) {
    STARTS.push(acc);
    acc += SEQ[i] - TR;
  }
}
const SEG_END = (i: number) => (i < SEQ.length - 1 ? STARTS[i + 1] : DURATION);
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 22, left: 26, right: 26, display: 'flex', gap: 7, zIndex: 30}}>
      {SEQ.map((_, i) => {
        const fill = interpolate(frame, [STARTS[i], SEG_END(i)], [0, 1], CL);
        return (
          <div key={i} style={{flex: 1, height: 5, borderRadius: 99, background: 'rgba(244,239,228,.30)', overflow: 'hidden'}}>
            <div style={{width: `${fill * 100}%`, height: '100%', background: C.curb, borderRadius: 99}} />
          </div>
        );
      })}
    </div>
  );
};

/* ---------- composition ---------- */
const TIPS = [
  {n: 1, src: 'slides/raw/bg-tip1.jpg', head: ['Group your stops', 'by neighborhood'], body: 'Two yards on the same street is twenty minutes saved. Two yards across town is twenty minutes gone. Book new customers near the ones you already have.'},
  {n: 2, src: 'slides/raw/bg-tip2.jpg', head: ['Load the trailer', 'the night before'], body: 'Fuel, blades, string, and blowers sorted at night means you pull off at 7 instead of 7:40. That is a whole extra yard, every single day.'},
  {n: 3, src: 'slides/raw/bg-tip3.jpg', head: ['Stop quoting', 'at 9pm'], body: 'Doing estimates after dinner turns a ten hour day into a thirteen hour one. Quote it while you are standing in the yard and it is already done.'},
  {n: 4, src: 'slides/raw/bg-tip4.jpg', head: ['Write down gate codes', 'and dog names'], body: 'Every locked gate you have to call about is ten minutes of standing around. Keep the code, the dog, and where the spigot is somewhere you can find it.'},
];

export const CurbFiveWays: React.FC = () => {
  const t = linearTiming({durationInFrames: TR});
  const scenes = [
    <CoverScene dur={SEQ[0]} />,
    ...TIPS.map((tp, k) => <TipScene n={tp.n} src={tp.src} head={tp.head} body={tp.body} i={k + 1} dur={SEQ[k + 1]} />),
    <Tip5Scene dur={SEQ[5]} />,
    <OutroScene />,
  ];
  const children: React.ReactNode[] = [];
  scenes.forEach((sc, i) => {
    children.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={SEQ[i]}>{sc}</TransitionSeries.Sequence>
    );
    if (i < scenes.length - 1) {
      children.push(<TransitionSeries.Transition key={`t${i}`} presentation={slide({direction: 'from-right'})} timing={t} />);
    }
  });
  return (
    <AbsoluteFill style={{background: C.asphalt}}>
      <TransitionSeries>{children}</TransitionSeries>
      <ProgressBar />
    </AbsoluteFill>
  );
};
