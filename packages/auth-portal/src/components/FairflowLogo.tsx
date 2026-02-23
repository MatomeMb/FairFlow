import logoMark from "/fairflow-logo.png";

interface FairflowLogoProps {
  markHeight?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  useBlendMode?: boolean;
}

export function FairflowLogo({
  markHeight = 48,
  showWordmark = true,
  variant = "light",
  useBlendMode = false,
}: FairflowLogoProps) {
  const wordSize = Math.round(markHeight * 0.6);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <img
        src={logoMark}
        alt="fairflow"
        style={{
          height: markHeight,
          width: "auto",
          filter: variant === "dark" ? "invert(1) brightness(3)" : "none",
          mixBlendMode: useBlendMode ? "multiply" : "normal",
        }}
      />
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 500,
            fontSize: wordSize,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: variant === "dark" ? "#F4F1EB" : "#1B2330",
          }}
        >
          fairflow
        </span>
      )}
    </div>
  );
}
