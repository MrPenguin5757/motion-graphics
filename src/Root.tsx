import React from 'react';
import {Composition} from 'remotion';
import {CurbAd, FPS, DURATION} from './CurbAd';
import {CurbTour, FPS as TOUR_FPS, DURATION as TOUR_DURATION} from './CurbTour';
import {CurbReviews, FPS as REV_FPS, DURATION as REV_DURATION} from './CurbReviews';
import {CurbTourFull, FPS as TF_FPS, DURATION as TF_DURATION} from './CurbTourFull';
import {CurbPerYard, FPS as PY_FPS, DURATION as PY_DURATION} from './CurbPerYard';
import {CurbSlowSeason, FPS as SS_FPS, DURATION as SS_DURATION} from './CurbSlowSeason';
import {StorefrontAd, FPS as SF_FPS, DURATION as SF_DURATION} from './StorefrontAd';

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
    {SIZES.map((f) => (
      <Composition
        key={`reviews-${f.suffix}`}
        id={`CurbReviews-${f.suffix}`}
        component={CurbReviews}
        durationInFrames={REV_DURATION}
        fps={REV_FPS}
        width={f.width}
        height={f.height}
      />
    ))}
    {SIZES.map((f) => (
      <Composition
        key={`tourfull-${f.suffix}`}
        id={`CurbTourFull-${f.suffix}`}
        component={CurbTourFull}
        durationInFrames={TF_DURATION}
        fps={TF_FPS}
        width={f.width}
        height={f.height}
      />
    ))}
    {SIZES.map((f) => (
      <Composition
        key={`peryard-${f.suffix}`}
        id={`CurbPerYard-${f.suffix}`}
        component={CurbPerYard}
        durationInFrames={PY_DURATION}
        fps={PY_FPS}
        width={f.width}
        height={f.height}
      />
    ))}
    {SIZES.map((f) => (
      <Composition
        key={`slowseason-${f.suffix}`}
        id={`CurbSlowSeason-${f.suffix}`}
        component={CurbSlowSeason}
        durationInFrames={SS_DURATION}
        fps={SS_FPS}
        width={f.width}
        height={f.height}
      />
    ))}
    {SIZES.map((f) => (
      <Composition
        key={`storefront-${f.suffix}`}
        id={`StorefrontAd-${f.suffix}`}
        component={StorefrontAd}
        durationInFrames={SF_DURATION}
        fps={SF_FPS}
        width={f.width}
        height={f.height}
      />
    ))}
  </>
);
