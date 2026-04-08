import { AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig, staticFile } from 'remotion';
import { BRAND, SPRING } from '../../brand';

const stats = [
  { value: '$2B+', label: 'Revenue Under Management' },
  { value: '30+', label: 'Years Scaling Family Businesses' },
  { value: '#1', label: 'Amazon Bestselling Author' },
];

export const StaticAd2Authority: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelIn = spring({ fps, frame: frame - 5, config: SPRING.smooth });
  const eyebrowIn = spring({ fps, frame: frame - 15, config: SPRING.smooth });
  const nameIn = spring({ fps, frame: frame - 25, config: SPRING.snappy });
  const bookIn = spring({ fps, frame: frame - 80, config: SPRING.smooth });
  const cardIn = spring({ fps, frame: frame - 95, config: SPRING.bouncy });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.navy, display: 'flex', flexDirection: 'row' }}>
      {/* Left panel — photo */}
      <div
        style={{
          width: '42%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          opacity: panelIn,
          transform: `translateX(${(1 - panelIn) * -60}px)`,
        }}
      >
        <Img
          src={staticFile('assets/anna-coaching.jpg')}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Dark overlay on photo */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(180deg, ${BRAND.dark}44 0%, ${BRAND.dark}88 100%)`,
          }}
        />
      </div>

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '50px 48px',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: BRAND.fontAccent,
            fontSize: 38,
            color: BRAND.rose,
            opacity: eyebrowIn,
            transform: `translateX(${(1 - eyebrowIn) * -30}px)`,
            marginBottom: 8,
          }}
        >
          Meet your presenter
        </div>

        {/* Name */}
        <div
          style={{
            fontFamily: BRAND.fontHeading,
            fontWeight: 900,
            fontSize: 64,
            color: BRAND.white,
            textTransform: 'uppercase',
            lineHeight: 1.1,
            opacity: nameIn,
            transform: `translateY(${(1 - nameIn) * 30}px)`,
            marginBottom: 36,
          }}
        >
          ANNA
          <br />
          SAMIOS
        </div>

        {/* Stats */}
        {stats.map((stat, i) => {
          const statIn = spring({ fps, frame: frame - 42 - i * 12, config: SPRING.snappy });
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                marginBottom: 20,
                opacity: statIn,
                transform: `translateX(${(1 - statIn) * 60}px)`,
              }}
            >
              <span
                style={{
                  fontFamily: BRAND.fontHeading,
                  fontWeight: 900,
                  fontSize: 44,
                  color: BRAND.teal,
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: BRAND.fontBody,
                  fontSize: 26,
                  color: BRAND.offWhite,
                }}
              >
                {stat.label}
              </span>
            </div>
          );
        })}

        {/* Book thumbnail + label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            marginTop: 16,
            marginBottom: 24,
            opacity: bookIn,
            transform: `translateY(${(1 - bookIn) * 20}px)`,
          }}
        >
          <Img
            src={staticFile('assets/book-cover.jpg')}
            style={{
              height: 120,
              borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            }}
          />
          <span
            style={{
              fontFamily: BRAND.fontBody,
              fontWeight: 700,
              fontSize: 24,
              color: BRAND.rose,
              lineHeight: 1.4,
            }}
          >
            Amazon #1
            <br />
            Bestseller
          </span>
        </div>

        {/* Bottom event card */}
        <div
          style={{
            backgroundColor: BRAND.rose,
            borderRadius: 20,
            padding: '20px 28px',
            transform: `scale(${cardIn})`,
            opacity: cardIn,
          }}
        >
          <div
            style={{
              fontFamily: BRAND.fontHeading,
              fontWeight: 900,
              fontSize: 24,
              color: BRAND.dark,
              marginBottom: 4,
            }}
          >
            {BRAND.eventName}
          </div>
          <div
            style={{
              fontFamily: BRAND.fontBody,
              fontSize: 20,
              color: BRAND.dark,
              lineHeight: 1.5,
            }}
          >
            {BRAND.eventDate} · {BRAND.eventVenue}
            <br />
            From {BRAND.ticketGA} · {BRAND.website}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
