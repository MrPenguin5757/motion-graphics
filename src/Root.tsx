import React from 'react';
import {Composition} from 'remotion';
import {CurbAd, FPS, DURATION} from './CurbAd';

// Each format your platforms need. Render any of them by id.
const FORMATS = [
  {id: 'CurbAd-9x16', width: 1080, height: 1920}, // TikTok / Reels / Stories
  {id: 'CurbAd-4x5', width: 1080, height: 1350}, // Instagram / Facebook feed
  {id: 'CurbAd-1x1', width: 1080, height: 1080}, // Square feed
];

export const RemotionRoot: React.FC = () => (
  <>
    {FORMATS.map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={CurbAd}
        durationInFrames={DURATION}
        fps={FPS}
        width={f.width}
        height={f.height}
      />
    ))}
  </>
);
