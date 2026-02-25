interface FairflowLogoProps {
  markHeight?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
}

export function FairflowLogo({
  markHeight = 48,
  showWordmark = true,
  variant = "light",
}: FairflowLogoProps) {
  const wordSize = Math.round(markHeight * 0.42);
  const wordColor = variant === "dark" ? "#F4F1EB" : "#1B2330";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src="/fairflow-logo.png"
        alt="fairflow"
        style={{
          height: markHeight,
          width: "auto",
          display: "block",
          filter: "none",
        }}
      />
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Sora', 'IBM Plex Sans', system-ui, sans-serif",
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
