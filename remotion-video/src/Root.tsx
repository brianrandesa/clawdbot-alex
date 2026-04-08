// ── Render commands ──
// npx remotion render src/index.ts StaticAd1PainHook   out/static-pain-hook.mp4
// npx remotion render src/index.ts StaticAd2Authority   out/static-authority.mp4
// npx remotion render src/index.ts StaticAd3Urgency     out/static-urgency.mp4
// npx remotion render src/index.ts VideoAd1PainHook     out/video-pain-hook.mp4
// npx remotion render src/index.ts VideoAd2OriginStory  out/video-origin-story.mp4
// npx remotion render src/index.ts VideoAd3SocialProof  out/video-social-proof.mp4
//
// Stills (thumbnails):
// npx remotion still src/index.ts StaticAd1PainHook  out/thumb-pain-hook.png  --frame=90
// npx remotion still src/index.ts StaticAd2Authority  out/thumb-authority.png  --frame=90
// npx remotion still src/index.ts StaticAd3Urgency    out/thumb-urgency.png    --frame=90

import { Composition } from 'remotion';
import { BRAND } from './brand';

import { StaticAd1PainHook } from './compositions/static/StaticAd1PainHook';
import { StaticAd2Authority } from './compositions/static/StaticAd2Authority';
import { StaticAd3Urgency } from './compositions/static/StaticAd3Urgency';
import { VideoAd1PainHook } from './compositions/video/VideoAd1PainHook';
import { VideoAd2OriginStory } from './compositions/video/VideoAd2OriginStory';
import { VideoAd3SocialProof } from './compositions/video/VideoAd3SocialProof';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── Static Ads (1080×1080, 6s hold) ── */}
      <Composition
        id="StaticAd1PainHook"
        component={StaticAd1PainHook}
        durationInFrames={180}
        fps={BRAND.fps}
        width={1080}
        height={1080}
      />
      <Composition
        id="StaticAd2Authority"
        component={StaticAd2Authority}
        durationInFrames={180}
        fps={BRAND.fps}
        width={1080}
        height={1080}
      />
      <Composition
        id="StaticAd3Urgency"
        component={StaticAd3Urgency}
        durationInFrames={180}
        fps={BRAND.fps}
        width={1080}
        height={1080}
      />

      {/* ── Video Ads (1080×1920 vertical) ── */}
      <Composition
        id="VideoAd1PainHook"
        component={VideoAd1PainHook}
        durationInFrames={450}
        fps={BRAND.fps}
        width={1080}
        height={1920}
      />
      <Composition
        id="VideoAd2OriginStory"
        component={VideoAd2OriginStory}
        durationInFrames={900}
        fps={BRAND.fps}
        width={1080}
        height={1920}
      />
      <Composition
        id="VideoAd3SocialProof"
        component={VideoAd3SocialProof}
        durationInFrames={600}
        fps={BRAND.fps}
        width={1080}
        height={1920}
      />
    </>
  );
};
