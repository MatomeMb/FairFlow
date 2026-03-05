interface FairflowLogoProps {
  markHeight?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  style?: FairflowLogoStyle;
}

export const FAIRFLOW_LOGO_STYLES = [
  "luxury",
  "geo-tech",
  "soft-premium",
  "executive",
  "precision",
  "aero",
  "bold-minimal",
] as const;

export type FairflowLogoStyle = (typeof FAIRFLOW_LOGO_STYLES)[number];

interface LogoMarkProps {
  size: number;
  color: string;
  style: FairflowLogoStyle;
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
  style: FairflowLogoStyle,
  size: number,
): LogoStyleConfig {
  switch (style) {
    case "luxury":
      return {
        stroke: Math.max(2.25, size * 0.095),
        barStroke: Math.max(1.8, size * 0.07),
        lineCap: "round",
        leftPath: "M15 5 C 12 9 10.5 14.5 11.8 20.6 C 13.2 27 12.7 33.8 9.8 41.2",
        rightPath: "M33 5 C 36 9 37.5 14.5 36.2 20.6 C 34.8 27 35.3 33.8 38.2 41.2",
        leftBar: { x1: 11.8, y1: 21.2, x2: 20.4, y2: 21.2 },
        rightBar: { x1: 27.6, y1: 21.2, x2: 36.2, y2: 21.2 },
      };
    case "soft-premium":
      return {
        stroke: Math.max(2.7, size * 0.112),
        barStroke: Math.max(2.15, size * 0.083),
        lineCap: "round",
        leftPath: "M14.5 5.5 C 10.5 10.5 10 16.5 12.4 23 C 14.1 28.2 13.2 34.4 10.4 41.4",
        rightPath: "M33.5 5.5 C 37.5 10.5 38 16.5 35.6 23 C 33.9 28.2 34.8 34.4 37.6 41.4",
        leftBar: { x1: 11.1, y1: 22, x2: 21, y2: 22 },
        rightBar: { x1: 27, y1: 22, x2: 36.9, y2: 22 },
      };
    case "executive":
      return {
        stroke: Math.max(2.55, size * 0.105),
        barStroke: Math.max(2.05, size * 0.08),
        lineCap: "round",
        leftPath: "M14.8 5 C 11.2 10.2 10.5 16.6 12.5 23.1 C 14 28.3 13.6 34.1 11.1 41.1",
        rightPath: "M33.2 5 C 36.8 10.2 37.5 16.6 35.5 23.1 C 34 28.3 34.4 34.1 36.9 41.1",
        leftBar: { x1: 11.8, y1: 21.6, x2: 21, y2: 21.6 },
        rightBar: { x1: 27, y1: 21.6, x2: 36.2, y2: 21.6 },
      };
    case "precision":
      return {
        stroke: Math.max(2.35, size * 0.098),
        barStroke: Math.max(1.9, size * 0.073),
        lineCap: "square",
        leftPath: "M15.3 5 C 11.5 9.8 10.8 16.4 12.4 23.7 C 13.6 29.2 12.7 35.2 10.2 41.4",
        rightPath: "M32.7 5 C 36.5 9.8 37.2 16.4 35.6 23.7 C 34.4 29.2 35.3 35.2 37.8 41.4",
        leftBar: { x1: 11.7, y1: 21.4, x2: 20.8, y2: 21.4 },
        rightBar: { x1: 27.2, y1: 21.4, x2: 36.3, y2: 21.4 },
      };
    case "aero":
      return {
        stroke: Math.max(2.45, size * 0.102),
        barStroke: Math.max(1.95, size * 0.075),
        lineCap: "round",
        leftPath: "M14.3 5.2 C 10.1 10.7 10.4 16.8 13 22.9 C 14.9 27.5 14 34 11 41.5",
        rightPath: "M33.7 5.2 C 37.9 10.7 37.6 16.8 35 22.9 C 33.1 27.5 34 34 37 41.5",
        leftBar: { x1: 10.8, y1: 22.2, x2: 20.8, y2: 22.2 },
        rightBar: { x1: 27.2, y1: 22.2, x2: 37.2, y2: 22.2 },
      };
    case "bold-minimal":
      return {
        stroke: Math.max(2.95, size * 0.12),
        barStroke: Math.max(2.3, size * 0.09),
        lineCap: "square",
        leftPath: "M15 5.3 C 11.3 10.7 10.7 16.9 12.8 23.4 C 14.2 28.2 13.4 34.4 10.1 41.2",
        rightPath: "M33 5.3 C 36.7 10.7 37.3 16.9 35.2 23.4 C 33.8 28.2 34.6 34.4 37.9 41.2",
        leftBar: { x1: 11.4, y1: 21.9, x2: 21.4, y2: 21.9 },
        rightBar: { x1: 26.6, y1: 21.9, x2: 36.6, y2: 21.9 },
      };
    case "geo-tech":
    default:
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
}

export function isFairflowLogoStyle(value: string | null): value is FairflowLogoStyle {
  return value !== null && FAIRFLOW_LOGO_STYLES.includes(value as FairflowLogoStyle);
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
  const urlStyle =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("logoStyle")
      : null;
  const activeStyle = isFairflowLogoStyle(urlStyle) ? urlStyle : style;

  const typography: Record<FairflowLogoStyle, { ratio: number; weight: 600 | 700; tracking: string }> = {
    luxury: { ratio: 0.435, weight: 700, tracking: "-0.014em" },
    "geo-tech": { ratio: 0.44, weight: 700, tracking: "-0.01em" },
    "soft-premium": { ratio: 0.445, weight: 600, tracking: "-0.008em" },
    executive: { ratio: 0.438, weight: 700, tracking: "-0.012em" },
    precision: { ratio: 0.436, weight: 700, tracking: "-0.009em" },
    aero: { ratio: 0.442, weight: 600, tracking: "-0.007em" },
    "bold-minimal": { ratio: 0.448, weight: 700, tracking: "-0.006em" },
  };
  const activeTypography = typography[activeStyle];

  const wordSize = Math.round(markHeight * activeTypography.ratio);
  const markColor = variant === "dark" ? "#F8F6F1" : "#1B2330";
  const wordColor = markColor;
  const wordWeight = activeTypography.weight;
  const wordTracking = activeTypography.tracking;

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
        <LogoMark size={markHeight} color={markColor} style={activeStyle} />
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
