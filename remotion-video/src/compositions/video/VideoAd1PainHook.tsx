import {
  AbsoluteFill,
  OffthreadVideo,
  spring,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from 'remotion';
import { BRAND, SPRING } from '../../brand';

/* ── Word-by-word slam ── */
const WordSlam: React.FC<{
  text: string;
  startFrame: number;
  fontSize?: number;
}> = ({ text, startFrame, fontSize = 72 }) => {
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
        gap: '0 16px',
      }}
    >
      {words.map((word, i) => {
        const wordIn = spring({ fps, frame: frame - startFrame - i * 3, config: SPRING.snappy });
        return (
          <span
            key={i}
            style={{
              color: BRAND.white,
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

/* ── Pain items ── */
const painItems = [
  { emoji: '\uD83D\uDE30', text: 'Lying awake at 2am about payroll' },
  { emoji: '\uD83D\uDCCA', text: 'Accountant says profitable — bank says broke' },
  { emoji: '\uD83D\uDC94', text: 'Business was supposed to create freedom' },
];

/* ── Main ── */
export const VideoAd1PainHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.dark }}>
      {/* Background video layer */}
      <OffthreadVideo
        src={staticFile('assets/video-bank-lie.mp4')}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.4,
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

      {/* ── Section 1: STOP hook (0-60f) ── */}
      <Sequence from={0} durationInFrames={60}>
        <AbsoluteFill
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 64px',
          }}
        >
          {(() => {
            const waitIn = spring({ fps, frame, config: SPRING.smooth });
            return (
              <div
                style={{
                  fontFamily: BRAND.fontAccent,
                  fontSize: 48,
                  color: BRAND.rose,
                  opacity: waitIn,
                  marginBottom: 24,
                }}
              >
                Wait —
              </div>
            );
          })()}
          <WordSlam
            text="STOP SCROLLING IF YOUR BUSINESS IS PROFITABLE BUT YOU'RE STILL BROKE."
            startFrame={8}
            fontSize={72}
          />
          {/* Teal accent line */}
          {(() => {
            const lineWidth = interpolate(frame, [30, 55], [0, 100], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                style={{
                  marginTop: 28,
                  height: 5,
                  width: `${lineWidth}%`,
                  backgroundColor: BRAND.teal,
                  borderRadius: 3,
                }}
              />
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 2: Pain items (60-180f) ── */}
      <Sequence from={60} durationInFrames={120}>
        <AbsoluteFill
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 64px',
          }}
        >
          {(() => {
            const f = frame - 60;
            const headerIn = spring({ fps, frame: f, config: SPRING.smooth });
            return (
              <div
                style={{
                  fontFamily: BRAND.fontHeading,
                  fontWeight: 700,
                  fontSize: 44,
                  color: BRAND.teal,
                  opacity: headerIn,
                  marginBottom: 48,
                  textAlign: 'center',
                }}
              >
                You know the feeling...
              </div>
            );
          })()}
          {painItems.map((item, i) => {
            const f = frame - 60;
            const itemIn = spring({ fps, frame: f - 15 - i * 14, config: SPRING.snappy });
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  marginBottom: 36,
                  opacity: itemIn,
                  transform: `translateX(${(1 - itemIn) * -80}px)`,
                }}
              >
                <span style={{ fontSize: 48 }}>{item.emoji}</span>
                <span
                  style={{
                    fontFamily: BRAND.fontBody,
                    fontSize: 40,
                    color: BRAND.offWhite,
                    lineHeight: 1.3,
                  }}
                >
                  {item.text}
                </span>
              </div>
            );
          })}
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 3: The REASON (180-300f) ── */}
      <Sequence from={180} durationInFrames={120}>
        <AbsoluteFill
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 64px',
          }}
        >
          {(() => {
            const f = frame - 180;
            const headIn = spring({ fps, frame: f - 5, config: SPRING.snappy });
            const bodyIn = spring({ fps, frame: f - 30, config: SPRING.smooth });
            return (
              <>
                <div
                  style={{
                    fontFamily: BRAND.fontHeading,
                    fontWeight: 900,
                    fontSize: 76,
                    color: BRAND.white,
                    textAlign: 'center',
                    opacity: headIn,
                    transform: `translateY(${(1 - headIn) * 40}px)`,
                    marginBottom: 40,
                  }}
                >
                  There's a <span style={{ color: BRAND.teal }}>REASON</span> for
                  that.
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
                  }}
                >
                  Anna Samios has spent 30 years fixing this exact problem for
                  family businesses. She's identified the gap between profit and
                  cashflow — and she's going to show you how to close it.
                </div>
              </>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ── Section 4: CTA (300-450f) ── */}
      <Sequence from={300} durationInFrames={150}>
        <AbsoluteFill
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 64px',
          }}
        >
          {(() => {
            const f = frame - 300;
            const eyeIn = spring({ fps, frame: f - 5, config: SPRING.smooth });
            const titleIn = spring({ fps, frame: f - 15, config: SPRING.snappy });
            const infoIn = spring({ fps, frame: f - 30, config: SPRING.smooth });
            const pillIn = spring({ fps, frame: f - 45, config: SPRING.bouncy });
            const urlIn = spring({ fps, frame: f - 60, config: SPRING.smooth });
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
                  Join us live →
                </div>
                <div
                  style={{
                    fontFamily: BRAND.fontHeading,
                    fontWeight: 900,
                    fontSize: 88,
                    color: BRAND.white,
                    textAlign: 'center',
                    lineHeight: 1.05,
                    opacity: titleIn,
                    transform: `scale(${titleIn})`,
                    marginBottom: 28,
                  }}
                >
                  KICKASS
                  <br />
                  CASHFLOW LIVE
                </div>
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
                    padding: '20px 52px',
                    fontFamily: BRAND.fontBody,
                    fontWeight: 700,
                    fontSize: 36,
                    color: BRAND.dark,
                    transform: `scale(${pillIn})`,
                    opacity: pillIn,
                    marginBottom: 20,
                  }}
                >
                  Tickets from {BRAND.ticketGA}
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
