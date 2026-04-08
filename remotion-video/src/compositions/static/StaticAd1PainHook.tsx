import { AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { BRAND, SPRING } from '../../brand';

export const StaticAd1PainHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eyebrowIn = spring({ fps, frame: frame - 10, config: SPRING.smooth });
  const headlineIn = spring({ fps, frame: frame - 25, config: SPRING.snappy });
  const bodyIn = spring({ fps, frame: frame - 50, config: SPRING.smooth });
  const ctaIn = spring({ fps, frame: frame - 75, config: SPRING.bouncy });
  const stripIn = spring({ fps, frame: frame - 90, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.dark }}>
      {/* Background photo */}
      <Img
        src={staticFile('assets/anna-stage.jpg')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, ${BRAND.dark}cc 0%, ${BRAND.dark}99 50%, ${BRAND.dark}dd 100%)`,
        }}
      />

      {/* Teal corner accent bars — top-left */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 6,
          height: '45%',
          backgroundColor: BRAND.teal,
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '35%',
          height: 6,
          backgroundColor: BRAND.teal,
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 70px 140px',
          height: '100%',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: BRAND.fontAccent,
            fontSize: 42,
            color: BRAND.rose,
            opacity: eyebrowIn,
            transform: `translateX(${(1 - eyebrowIn) * -40}px)`,
            marginBottom: 24,
          }}
        >
          Sound familiar?
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: BRAND.fontHeading,
            fontWeight: 900,
            fontSize: 88,
            lineHeight: 1.05,
            color: BRAND.white,
            transform: `translateY(${(1 - headlineIn) * 50}px)`,
            opacity: headlineIn,
            marginBottom: 32,
          }}
        >
          Still lying awake{' '}
          <span style={{ color: BRAND.teal }}>at 2am</span> about your
          business?
        </div>

        {/* Body */}
        <div
          style={{
            fontFamily: BRAND.fontBody,
            fontSize: 38,
            lineHeight: 1.5,
            color: BRAND.offWhite,
            opacity: bodyIn,
            transform: `translateY(${(1 - bodyIn) * 30}px)`,
            marginBottom: 48,
          }}
        >
          You're profitable on paper — but broke in the bank.
          <br />
          It's not your fault. And it's fixable in one day.
        </div>

        {/* CTA pill */}
        <div
          style={{
            alignSelf: 'flex-start',
            backgroundColor: BRAND.rose,
            borderRadius: 50,
            padding: '18px 44px',
            fontFamily: BRAND.fontBody,
            fontWeight: 700,
            fontSize: 34,
            color: BRAND.dark,
            transform: `scale(${ctaIn})`,
            opacity: ctaIn,
          }}
        >
          {BRAND.eventDate} · Gold Coast
        </div>
      </div>

      {/* Bottom strip */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 72,
          backgroundColor: BRAND.teal,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          opacity: stripIn,
          transform: `translateY(${(1 - stripIn) * 72}px)`,
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fontHeading,
            fontWeight: 900,
            fontSize: 30,
            color: BRAND.white,
          }}
        >
          {BRAND.eventName}
        </span>
        <span
          style={{
            fontFamily: BRAND.fontBody,
            fontSize: 26,
            color: BRAND.offWhite,
          }}
        >
          From {BRAND.ticketGA} · {BRAND.website}
        </span>
      </div>
    </AbsoluteFill>
  );
};
