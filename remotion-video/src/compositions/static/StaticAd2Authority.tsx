import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { BRAND, SPRING } from '../../brand';

const USE_HEADSHOT = false;

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
  const cardIn = spring({ fps, frame: frame - 90, config: SPRING.bouncy });

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.dark, display: 'flex', flexDirection: 'row' }}>
      {/* Left panel — teal */}
      <div
        style={{
          width: '42%',
          height: '100%',
          backgroundColor: BRAND.teal,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: panelIn,
          transform: `translateX(${(1 - panelIn) * -60}px)`,
        }}
      >
        {/* Monogram circle / headshot slot */}
        <div
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: BRAND.dark,
            border: `5px solid ${BRAND.rose}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: 20,
          }}
        >
          {USE_HEADSHOT ? (
            <img
              src="/anna-headshot.jpg"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span
              style={{
                fontFamily: BRAND.fontHeading,
                fontWeight: 900,
                fontSize: 64,
                color: BRAND.rose,
              }}
            >
              AS
            </span>
          )}
        </div>
        <span
          style={{
            fontFamily: BRAND.fontAccent,
            fontSize: 36,
            color: BRAND.offWhite,
          }}
        >
          Anna Samios
        </span>
      </div>

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 56px',
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
            marginBottom: 40,
          }}
        >
          ANNA
          <br />
          SAMIOS
        </div>

        {/* Stats */}
        {stats.map((stat, i) => {
          const statIn = spring({ fps, frame: frame - 45 - i * 12, config: SPRING.snappy });
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 16,
                marginBottom: 22,
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
                  fontSize: 28,
                  color: BRAND.offWhite,
                }}
              >
                {stat.label}
              </span>
            </div>
          );
        })}

        {/* Bottom event card */}
        <div
          style={{
            marginTop: 32,
            backgroundColor: BRAND.rose,
            borderRadius: 20,
            padding: '22px 32px',
            transform: `scale(${cardIn})`,
            opacity: cardIn,
          }}
        >
          <div
            style={{
              fontFamily: BRAND.fontHeading,
              fontWeight: 900,
              fontSize: 26,
              color: BRAND.dark,
              marginBottom: 6,
            }}
          >
            {BRAND.eventName}
          </div>
          <div
            style={{
              fontFamily: BRAND.fontBody,
              fontSize: 22,
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
