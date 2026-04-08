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

/* ── Word-by-word reveal ── */
const WordReveal: React.FC<{
  text: string;
  startFrame: number;
  fontSize?: number;
  color?: string;
  tealWords?: string[];
}> = ({ text, startFrame, fontSize = 68, color = BRAND.white, tealWords = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div
      style={{
        fontFamily: BRAND.fontHeading,
        fontWeight: 900,
        fontSize,
        lineHeight: 1.15,
        textAlign: 'center',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 14px',
      }}
    >
      {words.map((word, i) => {
        const wordIn = spring({ fps, frame: frame - startFrame - i * 3, config: SPRING.snappy });
        const isTeal = tealWords.some((tw) => word.toUpperCase().includes(tw.toUpperCase()));
        return (
          <span
            key={i}
            style={{
              color: isTeal ? BRAND.teal : color,
              opacity: wordIn,
              transform: `translateY(${(1 - wordIn) * 30}px)`,
              display: 'inline-block',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/* ── Stats ── */
const stats = [
  { value: '$2B+', label: 'Revenue Under Management' },
  { value: '30+', label: 'Years Scaling Businesses' },
  { value: '#1', label: 'Amazon Bestselling Author' },
];

export const VideoAd2OriginStory: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.dark }}>
      {/* Background video layer — persistent */}
      <OffthreadVideo
        src={staticFile('assets/video-hero.mp4')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.35,
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

      {/* ── Section 1: True story... (0-90f) ── */}
      <Sequence from={0} durationInFrames={90}>
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
            const eyeIn = spring({ fps, frame: frame - 5, config: SPRING.smooth });
            return (
              <div
                style={{
                  fontFamily: BRAND.fontAccent,
                  fontSize: 48,
                  color: BRAND.rose,
                  opacity: eyeIn,
                  marginBottom: 28,
                }}
              >
                True story...
              </div>
            );
          })()}
          <WordReveal
            text="I WAS CHANGING A NAPPY WHEN I REALISED MY BUSINESS WAS GOING UNDER."
            startFrame={12}
            fontSize={66}
          />
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 2: Profitable on paper (90-300f) ── */}
      <Sequence from={90} durationInFrames={210}>
        <AbsoluteFill style={{ position: 'relative', zIndex: 1 }}>
          {/* Section-specific photo overlay */}
          <Img
            src={staticFile('assets/anna-1on1.jpg')}
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
              const f = frame - 90;
              const headIn = spring({ fps, frame: f - 5, config: SPRING.snappy });
              const bodyIn = spring({ fps, frame: f - 25, config: SPRING.smooth });
              const quoteIn = spring({ fps, frame: f - 55, config: SPRING.smooth });
              return (
                <>
                  <div
                    style={{
                      fontFamily: BRAND.fontHeading,
                      fontWeight: 900,
                      fontSize: 64,
                      color: BRAND.white,
                      textAlign: 'center',
                      lineHeight: 1.15,
                      opacity: headIn,
                      transform: `translateY(${(1 - headIn) * 40}px)`,
                      marginBottom: 36,
                    }}
                  >
                    My business looked{' '}
                    <span style={{ color: BRAND.teal }}>PROFITABLE ON PAPER.</span>
                  </div>
                  <div
                    style={{
                      fontFamily: BRAND.fontBody,
                      fontSize: 38,
                      color: BRAND.offWhite,
                      textAlign: 'center',
                      lineHeight: 1.6,
                      opacity: bodyIn,
                      transform: `translateY(${(1 - bodyIn) * 20}px)`,
                      maxWidth: 900,
                      marginBottom: 40,
                    }}
                  >
                    Revenue was growing. Clients were coming in. But I was
                    stressed, stretched thin, and wondering where all the cash
                    went.
                  </div>
                  <div
                    style={{
                      fontFamily: BRAND.fontAccent,
                      fontSize: 42,
                      color: BRAND.rose,
                      fontStyle: 'italic',
                      textAlign: 'center',
                      opacity: quoteIn,
                      transform: `translateY(${(1 - quoteIn) * 15}px)`,
                    }}
                  >
                    "I didn't know what I didn't know."
                  </div>
                </>
              );
            })()}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 3: Found the GAP (300-540f) ── */}
      <Sequence from={300} durationInFrames={240}>
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
            const f = frame - 300;
            const headIn = spring({ fps, frame: f - 5, config: SPRING.snappy });
            const bodyIn = spring({ fps, frame: f - 25, config: SPRING.smooth });
            const boxIn = spring({ fps, frame: f - 55, config: SPRING.bouncy });
            return (
              <>
                <div
                  style={{
                    fontFamily: BRAND.fontHeading,
                    fontWeight: 900,
                    fontSize: 72,
                    color: BRAND.white,
                    textAlign: 'center',
                    opacity: headIn,
                    transform: `translateY(${(1 - headIn) * 40}px)`,
                    marginBottom: 36,
                  }}
                >
                  Then I found the{' '}
                  <span style={{ color: BRAND.teal }}>GAP.</span>
                </div>
                <div
                  style={{
                    fontFamily: BRAND.fontBody,
                    fontSize: 38,
                    color: BRAND.offWhite,
                    textAlign: 'center',
                    lineHeight: 1.6,
                    opacity: bodyIn,
                    transform: `translateY(${(1 - bodyIn) * 20}px)`,
                    maxWidth: 900,
                    marginBottom: 44,
                  }}
                >
                  30 strategies most accountants never teach. I fixed my own
                  business in 90 days — and spent the next three decades teaching
                  hundreds of others to do the same.
                </div>
                <div
                  style={{
                    border: `3px solid ${BRAND.teal}`,
                    borderRadius: 16,
                    padding: '24px 40px',
                    transform: `scale(${boxIn})`,
                    opacity: boxIn,
                  }}
                >
                  <span
                    style={{
                      fontFamily: BRAND.fontHeading,
                      fontWeight: 700,
                      fontSize: 36,
                      color: BRAND.teal,
                      textAlign: 'center',
                    }}
                  >
                    Now I'm bringing it to Gold Coast
                  </span>
                </div>
              </>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 4: Results (540-720f) ── */}
      <Sequence from={540} durationInFrames={180}>
        <AbsoluteFill style={{ position: 'relative', zIndex: 1 }}>
          {/* Group photo overlay */}
          <Img
            src={staticFile('assets/group-photo.jpg')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.3,
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
                    The results speak for themselves
                  </div>
                  <div style={{ display: 'flex', gap: 48 }}>
                    {stats.map((stat, i) => {
                      const statIn = spring({
                        fps,
                        frame: f - 20 - i * 12,
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
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 5: CTA (720-900f) ── */}
      <Sequence from={720} durationInFrames={180}>
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
            const f = frame - 720;
            const eyeIn = spring({ fps, frame: f - 5, config: SPRING.smooth });
            const titleIn = spring({ fps, frame: f - 15, config: SPRING.snappy });
            const lineIn = spring({ fps, frame: f - 25, config: SPRING.smooth });
            const infoIn = spring({ fps, frame: f - 35, config: SPRING.smooth });
            const pillIn = spring({ fps, frame: f - 50, config: SPRING.bouncy });
            const urlIn = spring({ fps, frame: f - 65, config: SPRING.smooth });
            return (
              <>
                <div
                  style={{
                    fontFamily: BRAND.fontAccent,
                    fontSize: 44,
                    color: BRAND.rose,
                    opacity: eyeIn,
                    marginBottom: 16,
                  }}
                >
                  Come learn it yourself →
                </div>
                <div
                  style={{
                    fontFamily: BRAND.fontHeading,
                    fontWeight: 900,
                    fontSize: 84,
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
                {/* Teal accent line */}
                <div
                  style={{
                    height: 5,
                    width: 240,
                    backgroundColor: BRAND.teal,
                    borderRadius: 3,
                    opacity: lineIn,
                    transform: `scaleX(${lineIn})`,
                    marginBottom: 28,
                  }}
                />
                <div
                  style={{
                    fontFamily: BRAND.fontBody,
                    fontSize: 36,
                    color: BRAND.offWhite,
                    textAlign: 'center',
                    opacity: infoIn,
                    marginBottom: 36,
                  }}
                >
                  {BRAND.eventDate} · {BRAND.eventVenue}
                </div>
                <div
                  style={{
                    backgroundColor: BRAND.rose,
                    borderRadius: 50,
                    padding: '20px 48px',
                    fontFamily: BRAND.fontBody,
                    fontWeight: 700,
                    fontSize: 34,
                    color: BRAND.dark,
                    transform: `scale(${pillIn})`,
                    opacity: pillIn,
                    marginBottom: 20,
                  }}
                >
                  Only {BRAND.seats} seats · From {BRAND.ticketGA}
                </div>
                <div
                  style={{
                    fontFamily: BRAND.fontBody,
                    fontSize: 30,
                    color: BRAND.offWhite,
                    opacity: urlIn,
                  }}
                >
                  {BRAND.website}
                </div>
              </>
            );
          })()}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
