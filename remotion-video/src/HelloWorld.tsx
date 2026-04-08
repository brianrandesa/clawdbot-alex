import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Logo } from "./Logo";
import { Subtitle } from "./Subtitle";
import { Title } from "./Title";

export type HelloWorldProps = {
  titleText: string;
  titleColor: string;
};

export const HelloWorld: React.FC<HelloWorldProps> = ({
  titleText,
  titleColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoTranslation = interpolate(
    frame,
    [0, fps * 1.5],
    [-(fps * 1.5), 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const titleOpacity = spring({
    fps,
    frame: frame - 30,
    config: {
      damping: 200,
    },
  });

  const subtitleOpacity = spring({
    fps,
    frame: frame - 60,
    config: {
      damping: 200,
    },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ transform: `translateY(${logoTranslation}px)` }}>
        <Logo />
      </div>
      <div style={{ opacity: titleOpacity }}>
        <Title titleText={titleText} titleColor={titleColor} />
      </div>
      <div style={{ opacity: subtitleOpacity }}>
        <Subtitle />
      </div>
    </AbsoluteFill>
  );
};
