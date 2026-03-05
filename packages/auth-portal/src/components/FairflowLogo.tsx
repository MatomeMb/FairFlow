/**
 * Optical note:
 * Crossbars are drawn slightly lighter than the main stems so the mark keeps a
 * balanced weight at small sizes. This avoids horizontal strokes appearing too heavy.
 */
export type LogoStyle =
  | 'luxury'
  | 'geo-tech'
  | 'soft-premium'
  | 'executive'
  | 'precision'
  | 'aero'
  | 'bold-minimal'
  | 'derivative';

export const LOGO_STYLES: Array<{ id: LogoStyle; label: string; description: string }> = [
  { id: 'luxury', label: 'Luxury', description: 'Elegant sweep with sharp, premium terminals.' },
  { id: 'geo-tech', label: 'Geo-Tech', description: 'Structured technical geometry for product interfaces.' },
  { id: 'soft-premium', label: 'Soft Premium', description: 'Rounded and friendly while staying premium.' },
  { id: 'executive', label: 'Executive', description: 'High-authority lockup with dense weight.' },
  { id: 'precision', label: 'Precision', description: 'Controlled linework with reduced visual noise.' },
  { id: 'aero', label: 'Aero', description: 'Lean horizontal flow with modern mobility energy.' },
  { id: 'bold-minimal', label: 'Bold Minimal', description: 'Strong brutalist reduction for tiny surfaces.' },
  { id: 'derivative', label: 'Derivative', description: 'Mathematical integral-inspired monogram (same direction).' },
];

interface FairflowLogoProps {
  markHeight?: number;
  showWordmark?: boolean;
  variant?: 'light' | 'dark';
  style?: LogoStyle;
}

const STYLE_LOOKUP = new Set<LogoStyle>(LOGO_STYLES.map((entry) => entry.id));

function isLogoStyle(value: string | null): value is LogoStyle {
  return value !== null && STYLE_LOOKUP.has(value as LogoStyle);
}

function LogoMark({ size, color, style }: { size: number; color: string; style: LogoStyle }) {
  const stroke = Math.max(2.2, size * 0.08);
  const barStroke = Math.max(1.7, stroke * 0.78);
  const heavyStroke = stroke * 1.16;

  const lineColor = color;
  const markStyle = {
    vectorEffect: 'non-scaling-stroke' as const,
    fill: 'none',
    stroke: lineColor,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
      style={{ display: 'block', flexShrink: 0 }}
    >
      {style === 'luxury' && (
        <>
          <path {...markStyle} d="M14 5 C10.5 10.5 10.5 18 14 23.5 C10.5 29 10.5 36.5 14 43" strokeWidth={heavyStroke} strokeLinecap="square" strokeLinejoin="round" />
          <path {...markStyle} d="M30 5 C26.5 10.5 26.5 18 30 23.5 C26.5 29 26.5 36.5 30 43" strokeWidth={heavyStroke} strokeLinecap="square" strokeLinejoin="round" />
          <line x1="8.5" y1="12" x2="18.5" y2="12" stroke={lineColor} strokeWidth={barStroke} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="24.5" y1="12" x2="34.5" y2="12" stroke={lineColor} strokeWidth={barStroke} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
        </>
      )}

      {style === 'geo-tech' && (
        <>
          <path {...markStyle} d="M14 5 C12 9.5 12 14.5 14 19.5 L14 43" strokeWidth={stroke} strokeLinecap="square" strokeLinejoin="miter" />
          <path {...markStyle} d="M30 5 C28 9.5 28 14.5 30 19.5 L30 43" strokeWidth={stroke} strokeLinecap="square" strokeLinejoin="miter" />
          <line x1="8.5" y1="11.5" x2="18" y2="11.5" stroke={lineColor} strokeWidth={barStroke} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="24.5" y1="11.5" x2="34" y2="11.5" stroke={lineColor} strokeWidth={barStroke} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="10" y1="24" x2="17" y2="24" stroke={lineColor} strokeWidth={barStroke * 0.92} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="26" y1="24" x2="33" y2="24" stroke={lineColor} strokeWidth={barStroke * 0.92} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
        </>
      )}

      {style === 'soft-premium' && (
        <>
          <path {...markStyle} d="M14 5 C9.5 11 9.5 18.5 13.5 24 C9.5 29.5 9.5 37 14 43" strokeWidth={stroke * 0.92} strokeLinecap="round" strokeLinejoin="round" />
          <path {...markStyle} d="M30 5 C25.5 11 25.5 18.5 29.5 24 C25.5 29.5 25.5 37 30 43" strokeWidth={stroke * 0.92} strokeLinecap="round" strokeLinejoin="round" />
          <line x1="9" y1="12" x2="17" y2="12" stroke={lineColor} strokeWidth={barStroke * 0.88} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <line x1="25" y1="12" x2="33" y2="12" stroke={lineColor} strokeWidth={barStroke * 0.88} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </>
      )}

      {style === 'executive' && (
        <>
          <path {...markStyle} d="M15 4.5 C12.5 10 12.5 17 15 23 C12.5 29 12.5 36 15 43.5" strokeWidth={heavyStroke * 1.08} strokeLinecap="square" strokeLinejoin="round" />
          <path {...markStyle} d="M28.5 4.5 C26 10 26 17 28.5 23 C26 29 26 36 28.5 43.5" strokeWidth={heavyStroke * 1.08} strokeLinecap="square" strokeLinejoin="round" />
          <line x1="9.5" y1="11.5" x2="19.5" y2="11.5" stroke={lineColor} strokeWidth={barStroke * 1.02} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="23" y1="11.5" x2="33" y2="11.5" stroke={lineColor} strokeWidth={barStroke * 1.02} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="11" y1="23.8" x2="18" y2="23.8" stroke={lineColor} strokeWidth={barStroke * 0.95} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="24.5" y1="23.8" x2="31.5" y2="23.8" stroke={lineColor} strokeWidth={barStroke * 0.95} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
        </>
      )}

      {style === 'precision' && (
        <>
          <path {...markStyle} d="M14 5 C11.5 10.5 11.5 17.5 14 23.5 C11.5 29.5 11.5 36.5 14 43" strokeWidth={stroke * 0.86} strokeLinecap="round" strokeLinejoin="round" />
          <path {...markStyle} d="M30 5 C27.5 10.5 27.5 17.5 30 23.5 C27.5 29.5 27.5 36.5 30 43" strokeWidth={stroke * 0.86} strokeLinecap="round" strokeLinejoin="round" />
          <line x1="9.5" y1="12" x2="17" y2="12" stroke={lineColor} strokeWidth={barStroke * 0.82} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
          <line x1="25.5" y1="12" x2="33" y2="12" stroke={lineColor} strokeWidth={barStroke * 0.82} strokeLinecap="square" vectorEffect="non-scaling-stroke" />
        </>
      )}

      {style === 'aero' && (
        <>
          <path {...markStyle} d="M13 5 C8.5 10.5 9 17.5 13.5 23.5 C9.5 29.5 9 36.5 14 43" strokeWidth={stroke * 0.95} strokeLinecap="round" strokeLinejoin="round" />
          <path {...markStyle} d="M29 5 C24.5 10.5 25 17.5 29.5 23.5 C25.5 29.5 25 36.5 30 43" strokeWidth={stroke * 0.95} strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8.5" y1="12" x2="17.5" y2="12" stroke={lineColor} strokeWidth={barStroke * 0.9} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <line x1="24.5" y1="12" x2="33.5" y2="12" stroke={lineColor} strokeWidth={barStroke * 0.9} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </>
      )}

      {style === 'bold-minimal' && (
        <>
          <rect x="10" y="5" width="7" height="38" rx="1.6" fill={lineColor} />
          <rect x="26" y="5" width="7" height="38" rx="1.6" fill={lineColor} />
          <rect x="6" y="10" width="11" height="4.4" rx="1.2" fill={lineColor} />
          <rect x="22" y="10" width="11" height="4.4" rx="1.2" fill={lineColor} />
          <rect x="8" y="22" width="9" height="4" rx="1.1" fill={lineColor} />
          <rect x="24" y="22" width="9" height="4" rx="1.1" fill={lineColor} />
        </>
      )}

      {style === 'derivative' && (
        <>
          <path {...markStyle} d="M15 6 C20 12 12 33 15 42" strokeWidth={heavyStroke} strokeLinecap="round" strokeLinejoin="round" />
          <path {...markStyle} d="M27 6 C32 12 24 33 27 42" strokeWidth={heavyStroke} strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8.5" y1="23.5" x2="21.5" y2="23.5" stroke={lineColor} strokeWidth={barStroke * 1.05} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <line x1="24.5" y1="23.5" x2="37.5" y2="23.5" stroke={lineColor} strokeWidth={barStroke * 1.05} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </>
      )}
    </svg>
  );
}

export function FairflowLogo({
  markHeight = 56,
  showWordmark = true,
  variant = 'light',
  style = 'geo-tech',
}: FairflowLogoProps) {
  const urlStyle = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('logoStyle') : null;
  const currentStyle = isLogoStyle(urlStyle) ? urlStyle : style;

  const markColor = variant === 'dark' ? '#F5F5F0' : '#1B2330';
  const wordColor = markColor;
  const wordSize = Math.round(markHeight * 0.4);
  const gap = Math.max(4, Math.round(wordSize * 0.22));
  const fontWeight = currentStyle === 'soft-premium' || currentStyle === 'aero' ? 600 : 700;

  return (
    <div
      className="fairflow-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap,
        color: wordColor,
        isolation: 'isolate',
      }}
    >
      <LogoMark size={markHeight} color={markColor} style={currentStyle} />
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Sora', 'Instrument Sans', system-ui, sans-serif",
            fontWeight,
            fontSize: wordSize,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: wordColor,
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          fairflow
        </span>
      )}
    </div>
  );
}
