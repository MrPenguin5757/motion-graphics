import React from 'react';
import {Composition} from 'remotion';
import {CurbAd, FPS, DURATION} from './CurbAd';
import {CurbTour, FPS as TOUR_FPS, DURATION as TOUR_DURATION} from './CurbTour';

// Each format your platforms need. Render any of them by id.
const SIZES = [
  {suffix: '9x16', width: 1080, height: 1920}, // TikTok / Reels / Stories
  {suffix: '4x5', width: 1080, height: 1350}, // Instagram / Facebook feed
  {suffix: '1x1', width: 1080, height: 1080}, // Square feed
];

export const RemotionRoot: React.FC = () => (
  <>
    {SIZES.map((f) => (
      <Composition
        key={`ad-${f.suffix}`}
        id={`CurbAd-${f.suffix}`}
        component={CurbAd}
        durationInFrames={DURATION}
        fps={FPS}
        width={f.width}
        height={f.height}
      />
    ))}
    {SIZES.map((f) => (
      <Composition
        key={`tour-${f.suffix}`}
        id={`CurbTour-${f.suffix}`}
        component={CurbTour}
        durationInFrames={TOUR_DURATION}
        fps={TOUR_FPS}
        width={f.width}
        height={f.height}
      />
    ))}
  </>
);
