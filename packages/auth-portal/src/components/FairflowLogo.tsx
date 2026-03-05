interface FairflowLogoProps {
  markHeight?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
}

interface LogoMarkProps {
  size: number;
  color: string;
}

/** Stylized "ff" as crossed double integral mark for fairflow. */
function LogoMark({ size, color }: LogoMarkProps) {
  const stroke = Math.max(2.5, size * 0.11);
  const barStroke = Math.max(2, size * 0.08);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      style={{
        display: "block",
        filter: "none",
        mixBlendMode: "normal",
        shapeRendering: "geometricPrecision",
      }}
    >
      <path
        d="M15 5 C 11 10 10 17 12 24 C 13.5 29.5 12.5 35.5 9.5 41.5"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M33 5 C 37 10 38 17 36 24 C 34.5 29.5 35.5 35.5 38.5 41.5"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="11.5"
        y1="21.8"
        x2="21.2"
        y2="21.8"
        stroke={color}
        strokeWidth={barStroke}
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="26.8"
        y1="21.8"
        x2="36.5"
        y2="21.8"
        stroke={color}
        strokeWidth={barStroke}
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function FairflowLogo({
  markHeight = 48,
  showWordmark = true,
  variant = "light",
}: FairflowLogoProps) {
  const wordSize = Math.round(markHeight * 0.44);
  const markColor = variant === "dark" ? "#F8F6F1" : "#1B2330";
  const wordColor = markColor;

  return (
    <div
      className="fairflow-logo"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        isolation: "isolate",
      }}
    >
      <div
        aria-label="fairflow"
        role="img"
        style={{
          filter: "none",
          mixBlendMode: "normal",
        }}
      >
        <LogoMark size={markHeight} color={markColor} />
      </div>
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Sora', 'Instrument Sans', 'IBM Plex Sans', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: wordSize,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            color: wordColor,
            textRendering: "geometricPrecision",
            WebkitFontSmoothing: "antialiased",
          }}
        >
          fairflow
        </span>
      )}
    </div>
  );
}
