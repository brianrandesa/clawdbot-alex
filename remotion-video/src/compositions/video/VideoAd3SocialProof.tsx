import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from 'remotion';
import { BRAND, SPRING } from '../../brand';

/* ── Testimonial Card ── */
const TestimonialCard: React.FC<{
  quote: string;
  name: string;
  role: string;
  initials: string;
  result: string;
}> = ({ quote, name, role, initials, result }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardIn = spring({ fps, frame: frame - 8, config: SPRING.smooth });
  const quoteIn = spring({ fps, frame: frame - 18, config: SPRING.smooth });
  const attrIn = spring({ fps, frame: frame - 35, config: SPRING.smooth });
  const badgeIn = spring({ fps, frame: frame - 50, config: SPRING.bouncy });

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '0 60px',
        opacity: cardIn,
      }}
    >
      {/* Large quote mark */}
      <div
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 140,
          color: BRAND.teal,
          lineHeight: 0.8,
          marginBottom: 16,
          opacity: cardIn,
        }}
      >
        {'\u201C'}
      </div>

      {/* Quote text */}
      <div
        style={{
          fontFamily: BRAND.fontBody,
          fontSize: 40,
          color: BRAND.white,
          fontStyle: 'italic',
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: 880,
          opacity: quoteIn,
          transform: `translateY(${(1 - quoteIn) * 20}px)`,
          marginBottom: 40,
        }}
      >
        {quote}
      </div>

      {/* Attribution row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: attrIn,
          transform: `translateY(${(1 - attrIn) * 15}px)`,
          marginBottom: 36,
        }}
      >
        {/* Monogram circle */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: BRAND.teal,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: BRAND.fontHeading,
            fontWeight: 900,
            fontSize: 22,
            color: BRAND.white,
          }}
        >
          {initials}
        </div>
        <div>
          <div
            style={{
              fontFamily: BRAND.fontHeading,
              fontWeight: 700,
              fontSize: 28,
              color: BRAND.rose,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: BRAND.fontBody,
              fontSize: 22,
              color: '#999',
            }}
          >
            {role}
          </div>
        </div>
      </div>

      {/* Result badge */}
      <div
        style={{
          border: `2px solid ${BRAND.teal}`,
          borderRadius: 12,
          padding: '14px 32px',
          transform: `scale(${badgeIn})`,
          opacity: badgeIn,
        }}
      >
        <span
          style={{
            fontFamily: BRAND.fontBody,
            fontWeight: 700,
            fontSize: 28,
            color: BRAND.teal,
          }}
        >
          ✓ {result}
        </span>
      </div>
    </div>
  );
};

/* ── Stats ── */
const stats = [
  { value: '$2B+', label: 'Revenue Under Management' },
  { value: '500+', label: 'Family Businesses' },
  { value: '30', label: 'Strategies' },
];

/* ── Main ── */
export const VideoAd3SocialProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.dark }}>
      {/* Background video layer — persistent */}
      <OffthreadVideo
        src={staticFile('assets/video-accountant.mp4')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.3,
        }}
        muted
      />
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(180deg, ${BRAND.dark}cc 0%, ${BRAND.dark}88 50%, ${BRAND.dark}cc 100%)`,
        }}
      />

      {/* ── Section 1: Header (0-60f) ── */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill style={{ position: 'relative', zIndex: 1 }}>
          {/* Group photo fade-in */}
          {(() => {
            const photoIn = spring({ fps, frame: frame - 20, config: SPRING.smooth });
            return (
              <Img
                src={staticFile('assets/group-photo.jpg')}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: photoIn * 0.2,
                }}
              />
            );
          })()}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `${BRAND.dark}bb`,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '0 60px',
            }}
          >
            {(() => {
              const eyeIn = spring({ fps, frame: frame - 5, config: SPRING.smooth });
              const headIn = spring({ fps, frame: frame - 15, config: SPRING.snappy });
              return (
                <>
                  <div
                    style={{
                      fontFamily: BRAND.fontAccent,
                      fontSize: 44,
                      color: BRAND.rose,
                      opacity: eyeIn,
                      marginBottom: 20,
                    }}
                  >
                    Don't take our word for it.
                  </div>
                  <div
                    style={{
                      fontFamily: BRAND.fontHeading,
                      fontWeight: 900,
                      fontSize: 76,
                      color: BRAND.white,
                      textAlign: 'center',
                      lineHeight: 1.1,
                      opacity: headIn,
                      transform: `translateY(${(1 - headIn) * 30}px)`,
                    }}
                  >
                    REAL PEOPLE.
                    <br />
                    <span style={{ color: BRAND.teal }}>REAL RESULTS.</span>
                  </div>
                </>
              );
            })()}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 2: Testimonial 1 (60-240f) ── */}
      <Sequence from={60} durationInFrames={180}>
        <AbsoluteFill>
          <TestimonialCard
            quote="I thought cashflow was just about cutting costs. Anna showed me 30 strategies I'd never heard of — and freed up $80K in 90 days."
            name="Sarah M."
            role="Family Business Owner"
            initials="SM"
            result="Freed up $80K cash in 90 days"
          />
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 3: Testimonial 2 (240-420f) ── */}
      <Sequence from={240} durationInFrames={180}>
        <AbsoluteFill>
          <TestimonialCard
            quote="These are cashflow strategies that aren't taught in business school. Anna's system completely changed how we manage our money."
            name="James T."
            role="Director, Construction Group"
            initials="JT"
            result="$240K revenue increase Year 1"
          />
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 4: Anna's track record (420-540f) ── */}
      <Sequence from={420} durationInFrames={120}>
        <AbsoluteFill
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 60px',
          }}
        >
          {(() => {
            const f = frame - 420;
            const headIn = spring({ fps, frame: f - 5, config: SPRING.smooth });
            return (
              <>
                <div
                  style={{
                    fontFamily: BRAND.fontAccent,
                    fontSize: 44,
                    color: BRAND.rose,
                    opacity: headIn,
                    marginBottom: 48,
                  }}
                >
                  Anna's track record
                </div>
                <div style={{ display: 'flex', gap: 48 }}>
                  {stats.map((stat, i) => {
                    const statIn = spring({
                      fps,
                      frame: f - 18 - i * 12,
                      config: SPRING.bouncy,
                    });
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          transform: `scale(${statIn})`,
                          opacity: statIn,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: BRAND.fontHeading,
                            fontWeight: 900,
                            fontSize: 72,
                            color: BRAND.teal,
                          }}
                        >
                          {stat.value}
                        </span>
                        <span
                          style={{
                            fontFamily: BRAND.fontBody,
                            fontSize: 24,
                            color: BRAND.offWhite,
                            textAlign: 'center',
                            maxWidth: 200,
                            marginTop: 8,
                          }}
                        >
                          {stat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 5: Final CTA (540-600f) ── */}
      <Sequence from={540} durationInFrames={60}>
        <AbsoluteFill style={{ position: 'relative', zIndex: 1 }}>
          {/* Networking photo bg */}
          <Img
            src={staticFile('assets/networking.jpg')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.25,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `${BRAND.dark}bb`,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '0 60px',
            }}
          >
            {(() => {
              const f = frame - 540;
              const titleIn = spring({ fps, frame: f - 3, config: SPRING.snappy });
              const lineIn = spring({ fps, frame: f - 10, config: SPRING.smooth });
              const infoIn = spring({ fps, frame: f - 15, config: SPRING.smooth });
              const pillIn = spring({ fps, frame: f - 22, config: SPRING.bouncy });
              const urlIn = spring({ fps, frame: f - 30, config: SPRING.smooth });
              return (
                <>
                  <div
                    style={{
                      fontFamily: BRAND.fontHeading,
                      fontWeight: 900,
                      fontSize: 80,
                      color: BRAND.white,
                      textAlign: 'center',
                      lineHeight: 1.05,
                      opacity: titleIn,
                      transform: `scale(${titleIn})`,
                      marginBottom: 8,
                    }}
                  >
                    KICKASS
                    <br />
                    CASHFLOW LIVE
                  </div>
                  <div
                    style={{
                      height: 5,
                      width: 220,
                      backgroundColor: BRAND.teal,
                      borderRadius: 3,
                      opacity: lineIn,
                      transform: `scaleX(${lineIn})`,
                      marginBottom: 24,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: BRAND.fontBody,
                      fontSize: 34,
                      color: BRAND.offWhite,
                      textAlign: 'center',
                      opacity: infoIn,
                      marginBottom: 28,
                    }}
                  >
                    {BRAND.eventDate} · {BRAND.eventVenue}
                  </div>
                  <div
                    style={{
                      backgroundColor: BRAND.rose,
                      borderRadius: 50,
                      padding: '18px 44px',
                      fontFamily: BRAND.fontBody,
                      fontWeight: 700,
                      fontSize: 32,
                      color: BRAND.dark,
                      transform: `scale(${pillIn})`,
                      opacity: pillIn,
                      marginBottom: 18,
                    }}
                  >
                    Grab a seat · From {BRAND.ticketGA}
                  </div>
                  <div
                    style={{
                      fontFamily: BRAND.fontBody,
                      fontSize: 28,
                      color: BRAND.offWhite,
                      opacity: urlIn,
                    }}
                  >
                    {BRAND.website}
                  </div>
                </>
              );
            })()}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
