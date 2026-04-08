import { AbsoluteFill, spring, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, SPRING } from '../../brand';

const details = [
  { icon: '\uD83D\uDCC5', text: 'May 12 & 13, 2026' },
  { icon: '\uD83D\uDCCD', text: 'QT Gold Coast Surfers Paradise' },
  { icon: '\uD83C\uDF9F\uFE0F', text: `GA ${BRAND.ticketGA} · VIP ${BRAND.ticketVIP}` },
];

export const StaticAd3Urgency: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dotPulse = interpolate(Math.sin(frame * 0.15), [-1, 1], [0.6, 1]);
  const badgeIn = spring({ fps, frame: frame - 8, config: SPRING.snappy });
  const headlineIn = spring({ fps, frame: frame - 25, config: SPRING.snappy });
  const ctaIn = spring({ fps, frame: frame - 80, config: SPRING.bouncy });
  const urlIn = spring({ fps, frame: frame - 95, config: SPRING.smooth });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.dark, overflow: 'hidden' }}>
      {/* Rose glow bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: -120,
          right: -120,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.rose}25, transparent 70%)`,
        }}
      />
      {/* Teal glow top-left */}
      <div
        style={{
          position: 'absolute',
          top: -120,
          left: -120,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${BRAND.teal}25, transparent 70%)`,
        }}
      />

      {/* Diagonal teal accent bar top-right */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -40,
          width: 200,
          height: 8,
          backgroundColor: BRAND.teal,
          transform: 'rotate(-45deg)',
          transformOrigin: 'center center',
        }}
      />

      {/* Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          padding: '80px 64px',
        }}
      >
        {/* Pulsing dot + seats badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            marginBottom: 40,
            opacity: badgeIn,
            transform: `translateY(${(1 - badgeIn) * -20}px)`,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: BRAND.rose,
              opacity: dotPulse,
              transform: `scale(${dotPulse})`,
            }}
          />
          <span
            style={{
              fontFamily: BRAND.fontHeading,
              fontWeight: 700,
              fontSize: 28,
              color: BRAND.rose,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Only {BRAND.seats} seats available
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: BRAND.fontHeading,
            fontWeight: 900,
            fontSize: 96,
            lineHeight: 1.05,
            color: BRAND.white,
            textAlign: 'center',
            opacity: headlineIn,
            transform: `translateY(${(1 - headlineIn) * 40}px)`,
            marginBottom: 48,
          }}
        >
          One day.
          <br />
          <span style={{ color: BRAND.teal }}>EVERY</span> answer.
        </div>

        {/* Detail rows */}
        {details.map((row, i) => {
          const rowIn = spring({ fps, frame: frame - 50 - i * 10, config: SPRING.snappy });
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                marginBottom: 20,
                opacity: rowIn,
                transform: `translateX(${(1 - rowIn) * 60}px)`,
              }}
            >
              <span style={{ fontSize: 36 }}>{row.icon}</span>
              <span
                style={{
                  fontFamily: BRAND.fontBody,
                  fontSize: 34,
                  color: BRAND.offWhite,
                }}
              >
                {row.text}
              </span>
            </div>
          );
        })}

        {/* CTA pill */}
        <div
          style={{
            marginTop: 44,
            backgroundColor: BRAND.rose,
            borderRadius: 50,
            padding: '20px 52px',
            fontFamily: BRAND.fontBody,
            fontWeight: 700,
            fontSize: 36,
            color: BRAND.dark,
            transform: `scale(${ctaIn})`,
            opacity: ctaIn,
          }}
        >
          Grab Your Seat →
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: 20,
            fontFamily: BRAND.fontBody,
            fontSize: 28,
            color: BRAND.offWhite,
            opacity: urlIn,
          }}
        >
          {BRAND.website}
        </div>
      </div>
    </AbsoluteFill>
  );
};
