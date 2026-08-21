import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';

export const FPS = 30;
const TR = 15;
// hook, tip1..tip5, outro
const SEQ = [78, 126, 126, 126, 126, 132, 96];
export const DURATION = SEQ.reduce((a, b) => a + b, 0) - TR * (SEQ.length - 1);

const SLIDES = [
  'slides/hook.png',
  'slides/tip1.png',
  'slides/tip2.png',
  'slides/tip3.png',
  'slides/tip4.png',
  'slides/tip5.png',
  'slides/outro.png',
];

const ORANGE = '#D75F1F';
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// slide "solo" start times on the root timeline (accounting for the overlap
// each transition steals); the last segment runs to the very end
const STARTS: number[] = [];
{
  let acc = 0;
  for (let i = 0; i < SEQ.length; i++) {
    STARTS.push(acc);
    acc += SEQ[i] - TR;
  }
}
const SEG_END = (i: number) => (i < SEQ.length - 1 ? STARTS[i + 1] : DURATION);

// gentle Ken Burns so the baked-in text stays crisp; alternate the drift
const KenBurns: React.FC<{src: string; dur: number; i: number; motion?: boolean}> = ({src, dur, i, motion = true}) => {
  const frame = useCurrentFrame();
  const dir = i % 2 === 0 ? 1 : -1;
  const p = interpolate(frame, [0, dur], [0, 1], CL);
  // the text-only outro holds still so the CTA never floats
  const scale = motion ? interpolate(p, [0, 1], dir > 0 ? [1.04, 1.09] : [1.09, 1.04]) : 1;
  const dy = motion ? interpolate(p, [0, 1], dir > 0 ? [-1, 1] : [1, -1]) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#1D1A16'}}>
      <Img
        src={staticFile(src)}
        style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateY(${dy}%)`}}
      />
    </AbsoluteFill>
  );
};

// slim stories-style progress across the seven slides
const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 22, left: 26, right: 26, display: 'flex', gap: 7, zIndex: 20}}>
      {SEQ.map((_, i) => {
        const fill = interpolate(frame, [STARTS[i], SEG_END(i)], [0, 1], CL);
        return (
          <div key={i} style={{flex: 1, height: 5, borderRadius: 99, background: 'rgba(244,239,228,.28)', overflow: 'hidden'}}>
            <div style={{width: `${fill * 100}%`, height: '100%', background: ORANGE, borderRadius: 99}} />
          </div>
        );
      })}
    </div>
  );
};

export const CurbFiveWays: React.FC = () => {
  const t = linearTiming({durationInFrames: TR});
  const children: React.ReactNode[] = [];
  SLIDES.forEach((src, i) => {
    children.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={SEQ[i]}>
        <KenBurns src={src} dur={SEQ[i]} i={i} motion={i !== SLIDES.length - 1} />
      </TransitionSeries.Sequence>
    );
    if (i < SLIDES.length - 1) {
      children.push(
        <TransitionSeries.Transition key={`t${i}`} presentation={slide({direction: 'from-right'})} timing={t} />
      );
    }
  });
  return (
    <AbsoluteFill style={{background: '#1D1A16'}}>
      <TransitionSeries>{children}</TransitionSeries>
      <ProgressBar />
    </AbsoluteFill>
  );
};
