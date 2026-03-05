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
  const stroke = Math.max(2, size * 0.09);
  const barStroke = Math.max(1.6, size * 0.065);

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
        d="M14 6 C 10 14 10 22 14 30 C 10 38 10 44 14 42"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M34 6 C 38 14 38 22 34 30 C 38 38 38 44 34 42"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="12"
        y1="21.5"
        x2="20"
        y2="21.5"
        stroke={color}
        strokeWidth={barStroke}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="28"
        y1="21.5"
        x2="36"
        y2="21.5"
        stroke={color}
        strokeWidth={barStroke}
        strokeLinecap="round"
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
  const wordSize = Math.round(markHeight * 0.42);
  const markColor = variant === "dark" ? "#F4F1EB" : "#1B2330";
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
            fontWeight: 600,
            fontSize: wordSize,
            letterSpacing: "-0.02em",
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
