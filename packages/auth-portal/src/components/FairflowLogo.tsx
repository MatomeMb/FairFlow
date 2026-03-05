interface FairflowLogoProps {
  markHeight?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  style?: "luxury" | "geo-tech" | "soft-premium";
}

interface LogoMarkProps {
  size: number;
  color: string;
  style: "luxury" | "geo-tech" | "soft-premium";
}

interface LogoStyleConfig {
  stroke: number;
  barStroke: number;
  lineCap: "round" | "square" | "butt";
  leftPath: string;
  rightPath: string;
  leftBar: { x1: number; y1: number; x2: number; y2: number };
  rightBar: { x1: number; y1: number; x2: number; y2: number };
}

function getLogoStyleConfig(
  style: "luxury" | "geo-tech" | "soft-premium",
  size: number,
): LogoStyleConfig {
  if (style === "luxury") {
    return {
      stroke: Math.max(2.25, size * 0.095),
      barStroke: Math.max(1.8, size * 0.07),
      lineCap: "round",
      leftPath: "M15 5 C 12 9 10.5 14.5 11.8 20.6 C 13.2 27 12.7 33.8 9.8 41.2",
      rightPath: "M33 5 C 36 9 37.5 14.5 36.2 20.6 C 34.8 27 35.3 33.8 38.2 41.2",
      leftBar: { x1: 11.8, y1: 21.2, x2: 20.4, y2: 21.2 },
      rightBar: { x1: 27.6, y1: 21.2, x2: 36.2, y2: 21.2 },
    };
  }

  if (style === "soft-premium") {
    return {
      stroke: Math.max(2.7, size * 0.112),
      barStroke: Math.max(2.15, size * 0.083),
      lineCap: "round",
      leftPath: "M14.5 5.5 C 10.5 10.5 10 16.5 12.4 23 C 14.1 28.2 13.2 34.4 10.4 41.4",
      rightPath: "M33.5 5.5 C 37.5 10.5 38 16.5 35.6 23 C 33.9 28.2 34.8 34.4 37.6 41.4",
      leftBar: { x1: 11.1, y1: 22, x2: 21, y2: 22 },
      rightBar: { x1: 27, y1: 22, x2: 36.9, y2: 22 },
    };
  }

  return {
    stroke: Math.max(2.5, size * 0.11),
    barStroke: Math.max(2, size * 0.08),
    lineCap: "square",
    leftPath: "M15 5 C 11 10 10 17 12 24 C 13.5 29.5 12.5 35.5 9.5 41.5",
    rightPath: "M33 5 C 37 10 38 17 36 24 C 34.5 29.5 35.5 35.5 38.5 41.5",
    leftBar: { x1: 11.5, y1: 21.8, x2: 21.2, y2: 21.8 },
    rightBar: { x1: 26.8, y1: 21.8, x2: 36.5, y2: 21.8 },
  };
}

/** Stylized "ff" as crossed double-integral mark for fairflow. */
function LogoMark({ size, color, style }: LogoMarkProps) {
  const cfg = getLogoStyleConfig(style, size);

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
        d={cfg.leftPath}
        stroke={color}
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={cfg.rightPath}
        stroke={color}
        strokeWidth={cfg.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cfg.leftBar.x1}
        y1={cfg.leftBar.y1}
        x2={cfg.leftBar.x2}
        y2={cfg.leftBar.y2}
        stroke={color}
        strokeWidth={cfg.barStroke}
        strokeLinecap={cfg.lineCap}
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1={cfg.rightBar.x1}
        y1={cfg.rightBar.y1}
        x2={cfg.rightBar.x2}
        y2={cfg.rightBar.y2}
        stroke={color}
        strokeWidth={cfg.barStroke}
        strokeLinecap={cfg.lineCap}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function FairflowLogo({
  markHeight = 48,
  showWordmark = true,
  variant = "light",
  style = "geo-tech",
}: FairflowLogoProps) {
  const wordSize = Math.round(
    markHeight * (style === "luxury" ? 0.435 : style === "soft-premium" ? 0.445 : 0.44),
  );
  const markColor = variant === "dark" ? "#F8F6F1" : "#1B2330";
  const wordColor = markColor;
  const wordWeight = style === "soft-premium" ? 600 : 700;
  const wordTracking = style === "luxury" ? "-0.014em" : style === "soft-premium" ? "-0.008em" : "-0.01em";

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
        <LogoMark size={markHeight} color={markColor} style={style} />
      </div>
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Sora', 'Instrument Sans', 'IBM Plex Sans', system-ui, sans-serif",
            fontWeight: wordWeight,
            fontSize: wordSize,
            letterSpacing: wordTracking,
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
