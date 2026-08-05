import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {brand, timeline} from './brand';

const {colors: C, fonts: F, copy} = brand;

/* ---------- helpers ---------- */

// local "vmin" unit: 1u = 1% of the frame's shorter side, so every format composes.
const useUnit = () => {
  const {width, height} = useVideoConfig();
  return Math.min(width, height) / 100;
};

// spring-driven entrance: fades + rises + settles
const useEnter = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 200, mass: 0.7}});
  return {
    opacity: s,
    transform: `translateY(${(1 - s) * 6}%) scale(${0.94 + s * 0.06})`,
  };
};

const Enter: React.FC<{delay?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({
  delay = 0,
  style,
  children,
}) => {
  const e = useEnter(delay);
  return <div style={{...e, ...style}}>{children}</div>;
};

const Tag: React.FC<{time: string; right: string; light?: boolean}> = ({time, right, light}) => {
  const u = useUnit();
  return (
    <div
      style={{
        position: 'absolute',
        top: 6 * u,
        left: 7 * u,
        right: 7 * u,
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: F.mono,
        fontSize: 2.3 * u,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        opacity: 0.62,
        color: light ? C.ink : C.paper,
      }}
    >
      <span>{time}</span>
      <span>{right}</span>
    </div>
  );
};

const SceneBox: React.FC<{bg: string; color: string; children: React.ReactNode}> = ({
  bg,
  color,
  children,
}) => {
  const u = useUnit();
  return (
    <AbsoluteFill
      style={{
        background: bg,
        color,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: `${8 * u}px ${7 * u}px`,
        fontFamily: F.display,
        gap: 3 * u,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const bgCoral = `radial-gradient(120% 120% at 30% 10%, #ff6f52, ${C.coral} 70%)`;
const bgInk = `radial-gradient(130% 100% at 50% 30%, #1b1630, ${C.ink} 70%)`;
const bgPaper = `radial-gradient(120% 120% at 70% 0%, #fffdf8, ${C.paper} 75%)`;

/* ---------- scenes ---------- */

const Hook: React.FC = () => {
  const u = useUnit();
  return (
    <SceneBox bg={bgCoral} color={C.ink}>
      <Tag time="0:00" right="Curb" light />
      <Enter
        style={{
          fontFamily: F.mono,
          fontSize: 2.6 * u,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        {copy.kicker}
      </Enter>
      <div
        style={{
          fontWeight: 900,
          textTransform: 'uppercase',
          lineHeight: 0.92,
          fontSize: 11 * u,
        }}
      >
        {copy.hook.map((line, i) => (
          <Enter key={i} delay={4 + i * 4} style={{display: 'block'}}>
            {line}
          </Enter>
        ))}
      </div>
    </SceneBox>
  );
};

const Turn: React.FC = () => {
  const u = useUnit();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sweep = spring({frame: frame - 4, fps, config: {damping: 200}});
  return (
    <SceneBox bg={bgInk} color={C.paper}>
      <Tag time="0:03" right="Curb" />
      <div
        style={{
          height: 0.8 * u,
          width: 22 * u,
          background: C.coral,
          borderRadius: 99,
          transform: `scaleX(${sweep})`,
          transformOrigin: 'left center',
        }}
      />
      <div style={{fontWeight: 900, textTransform: 'uppercase', lineHeight: 0.92, fontSize: 11 * u}}>
        <Enter delay={4} style={{display: 'block'}}>
          {copy.turn[0]}
        </Enter>
        <Enter delay={9} style={{display: 'block', color: C.coral}}>
          {copy.turn[1]}
        </Enter>
      </div>
    </SceneBox>
  );
};

const Logo: React.FC = () => {
  const u = useUnit();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const under = spring({frame: frame - 14, fps, config: {damping: 200}});
  const letters = copy.wordmark.split('');
  return (
    <SceneBox bg={bgInk} color={C.paper}>
      <Tag time="0:05" right="Curb" />
      {brand.logoSrc ? (
        <Enter>
          <Img src={staticFile(brand.logoSrc)} style={{width: 60 * u}} />
        </Enter>
      ) : (
        <div style={{display: 'flex', fontWeight: 900, fontSize: 20 * u, textTransform: 'uppercase', lineHeight: 1}}>
          {letters.map((ch, i) => (
            <Enter key={i} delay={i * 3} style={{color: i === 1 ? C.coral : C.paper}}>
              {ch}
            </Enter>
          ))}
        </div>
      )}
      <div
        style={{
          height: 1.3 * u,
          width: 30 * u,
          background: C.coral,
          borderRadius: 99,
          transform: `scaleX(${under})`,
          transformOrigin: 'left center',
          boxShadow: `0 0 ${3 * u}px rgba(255,90,60,.6)`,
        }}
      />
      <Enter
        delay={18}
        style={{
          fontFamily: F.mono,
          fontSize: 3.1 * u,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: C.muted,
        }}
      >
        {copy.tagline}
      </Enter>
    </SceneBox>
  );
};

const Phone: React.FC = () => {
  const u = useUnit();
  const rows = [
    {short: false, status: 'Paid'},
    {short: true, status: 'Due'},
    {short: false, status: 'Paid'},
    {short: true, status: 'Due'},
  ];
  return (
    <div
      style={{
        width: 40 * u,
        aspectRatio: '9 / 17',
        background: C.ink2,
        borderRadius: 5 * u,
        padding: 2 * u,
        boxShadow: `0 ${3 * u}px ${8 * u}px rgba(0,0,0,.35)`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 3.4 * u,
          background: 'linear-gradient(180deg,#141026,#0e0b1c)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: C.paper,
        }}
      >
        <div
          style={{
            padding: `${3 * u}px ${3 * u}px ${1.5 * u}px`,
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 900,
            textTransform: 'uppercase',
            fontSize: 3.4 * u,
          }}
        >
          <span>
            C<span style={{color: C.coral}}>U</span>RB
          </span>
          <span style={{fontFamily: F.mono, fontSize: 2.4 * u, opacity: 0.8}}>Today · 5 jobs</span>
        </div>
        <div
          style={{
            margin: `${1.5 * u}px ${3 * u}px`,
            borderRadius: 2.4 * u,
            background: `linear-gradient(135deg,${C.coral},${C.amber})`,
            aspectRatio: '16 / 8',
            display: 'flex',
            alignItems: 'flex-end',
            padding: 2.4 * u,
            color: C.ink,
            fontWeight: 800,
            fontSize: 2.6 * u,
          }}
        >
          Optimized route · 5 stops · 32 min
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 1.6 * u, padding: `${2 * u}px ${3 * u}px`, flex: 1}}>
          {rows.map((r, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 2 * u}}>
              <span style={{width: 5 * u, height: 5 * u, borderRadius: 1.4 * u, background: 'rgba(255,255,255,.1)'}} />
              <span style={{height: 1.5 * u, borderRadius: 99, background: 'rgba(255,255,255,.14)', flex: r.short ? 0.5 : 1}} />
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: 1.9 * u,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  padding: `${0.7 * u}px ${1.6 * u}px`,
                  borderRadius: 99,
                  background: r.status === 'Paid' ? 'rgba(56,224,176,.16)' : 'rgba(255,90,60,.16)',
                  color: r.status === 'Paid' ? C.mint : C.coral,
                }}
              >
                {r.status}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            margin: `${2 * u}px ${3 * u}px ${3 * u}px`,
            background: C.coral,
            color: C.ink,
            textAlign: 'center',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontSize: 2.8 * u,
            padding: 2.4 * u,
            borderRadius: 99,
          }}
        >
          Start route
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{children: React.ReactNode; accent: string; light?: boolean; icon: React.ReactNode}> = ({
  children,
  accent,
  light,
  icon,
}) => {
  const u = useUnit();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2.6 * u,
        background: light ? 'rgba(12,10,20,.06)' : 'rgba(247,243,236,.06)',
        border: `${0.35 * u}px solid ${light ? 'rgba(12,10,20,.12)' : 'rgba(247,243,236,.14)'}`,
        borderRadius: 99,
        padding: `${2.4 * u}px ${4 * u}px`,
        fontWeight: 700,
        fontSize: 3.6 * u,
        textAlign: 'left',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          width: 6 * u,
          height: 6 * u,
          borderRadius: '50%',
          background: accent,
          color: C.ink,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        {icon}
      </span>
      {children}
    </div>
  );
};

const Check = (
  <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none">
    <path d="M5 13l4 4 10-11" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Doc = (
  <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none">
    <path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth={2} />
    <path d="M14 3v4h4M8 13h8M8 17h5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const Pin = (
  <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none">
    <path d="M12 2c3.9 0 7 3 7 6.8 0 4.6-7 12.2-7 12.2S5 13.4 5 8.8C5 5 8.1 2 12 2z" fill="currentColor" />
    <circle cx="12" cy="9" r="2.4" fill={C.ink} />
  </svg>
);

const Feature1: React.FC = () => {
  const u = useUnit();
  return (
    <SceneBox bg={bgPaper} color={C.ink}>
      <Tag time="0:07" right="Curb" light />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4.5 * u}}>
        <Enter style={{fontWeight: 800, textTransform: 'uppercase', fontSize: 5 * u}}>{copy.feature1Heading}</Enter>
        <Enter delay={4}>
          <Phone />
        </Enter>
        <Enter delay={10}>
          <Chip accent={C.coral} light icon={<svg viewBox="0 0 24 24" width="60%" height="60%"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" /></svg>}>
            {copy.feature1Chip}
          </Chip>
        </Enter>
      </div>
    </SceneBox>
  );
};

const Feature2: React.FC = () => {
  const u = useUnit();
  const icons = [Doc, Check, Pin];
  const accents = [C.amber, C.mint, C.coral];
  return (
    <SceneBox bg={bgInk} color={C.paper}>
      <Tag time="0:10" right="Curb" />
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4.5 * u, width: '100%'}}>
        <Enter style={{fontWeight: 800, textTransform: 'uppercase', fontSize: 5 * u}}>{copy.feature2Heading}</Enter>
        <div style={{display: 'flex', flexDirection: 'column', gap: 3 * u, alignItems: 'center'}}>
          {copy.feature2Chips.map((c, i) => (
            <Enter key={i} delay={4 + i * 4}>
              <Chip accent={accents[i]} icon={icons[i]}>
                {c}
              </Chip>
            </Enter>
          ))}
        </div>
      </div>
    </SceneBox>
  );
};

const Badge: React.FC<{small: string; big: string; icon: React.ReactNode}> = ({small, big, icon}) => {
  const u = useUnit();
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2.4 * u,
        background: C.ink,
        color: C.paper,
        borderRadius: 2.4 * u,
        padding: `${2.2 * u}px ${4.5 * u}px`,
        minWidth: 46 * u,
      }}
    >
      {icon}
      <span style={{textAlign: 'left', lineHeight: 1.05}}>
        <small style={{fontFamily: F.mono, fontSize: 2 * u, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.7, display: 'block'}}>
          {small}
        </small>
        <b style={{fontSize: 3.5 * u, fontWeight: 800}}>{big}</b>
      </span>
    </div>
  );
};

const Cta: React.FC = () => {
  const u = useUnit();
  return (
    <SceneBox bg={bgCoral} color={C.ink}>
      <Tag time="0:13" right="Download now" light />
      <div style={{fontWeight: 900, textTransform: 'uppercase', fontSize: 15 * u, lineHeight: 0.9}}>
        <Enter style={{display: 'inline-block'}}>{copy.ctaLine1} </Enter>
        <Enter delay={4} style={{display: 'inline-block', WebkitTextStroke: `${0.4 * u}px ${C.ink}`, color: 'transparent'}}>
          {copy.ctaLine2}
        </Enter>
      </div>
      <Enter delay={8} style={{fontWeight: 600, fontSize: 4.4 * u, lineHeight: 1.15, maxWidth: '82%'}}>
        {copy.ctaSub}
      </Enter>
      <div style={{display: 'flex', flexDirection: 'column', gap: 2.4 * u, alignItems: 'center'}}>
        <Enter delay={12}>
          <Badge
            small="Download on the"
            big="App Store"
            icon={
              <svg viewBox="0 0 24 24" width={5.4 * u} height={5.4 * u} fill="currentColor">
                <path d="M16.4 12.7c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 .9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-.9 2.3-1.9.7-1.1 1-2.1 1-2.2 0 0-1.9-.7-1.9-3zM14.6 6.3c.5-.6.9-1.5.8-2.3-.8 0-1.7.5-2.2 1.1-.5.5-.9 1.4-.8 2.2.9.1 1.7-.4 2.2-1z" />
              </svg>
            }
          />
        </Enter>
        <Enter delay={16}>
          <Badge
            small="Get it on"
            big="Google Play"
            icon={
              <svg viewBox="0 0 24 24" width={5.4 * u} height={5.4 * u}>
                <path d="M4 3l10 9-10 9c-.3-.2-.5-.5-.5-1V4c0-.5.2-.8.5-1z" fill={C.mint} />
                <path d="M14 12L4 21l11-6-1-3z" fill={C.amber} />
                <path d="M14 12L4 3l11 6-1 3z" fill={C.coral} />
              </svg>
            }
          />
        </Enter>
      </div>
    </SceneBox>
  );
};

/* ---------- root composition ---------- */

const SCENES = [Hook, Turn, Logo, Feature1, Feature2, Cta];

export const CurbAd: React.FC = () => {
  const {fps} = useVideoConfig();
  let acc = 0;
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {timeline.scenes.map((s, i) => {
        const from = Math.round(acc * fps);
        const dur = Math.round(s.dur * fps);
        acc += s.dur;
        const SceneComp = SCENES[i];
        return (
          <Sequence key={s.name} from={from} durationInFrames={dur} name={s.name}>
            <SceneComp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
