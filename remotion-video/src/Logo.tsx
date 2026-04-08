import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: {
      damping: 100,
    },
  });

  return (
    <div
      style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "#4290f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: `scale(${scale})`,
        boxShadow: "0 4px 20px rgba(66, 144, 245, 0.4)",
      }}
    >
      <svg
        width="60"
        height="60"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </div>
  );
};
