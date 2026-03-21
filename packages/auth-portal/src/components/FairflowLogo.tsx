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

export function FairflowLogo({
  markHeight = 56,
  showWordmark = true,
  variant = 'light',
  style = 'geo-tech',
}: FairflowLogoProps) {
  const markColor = variant === 'dark' ? '#F5F5F0' : '#1B2330';
  const markBg = '#1a9e4a';
  const wordSize = Math.round(markHeight * 0.38);
  const fontWeight = style === 'soft-premium' || style === 'aero' ? 600 : 700;

  return (
    <div
      className="fairflow-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: markHeight,
        height: markHeight,
        borderRadius: Math.max(8, Math.round(markHeight * 0.2)),
        backgroundColor: markBg,
        color: markColor,
        isolation: 'isolate',
        fontFamily: "'Sora', 'Instrument Sans', system-ui, sans-serif",
        fontWeight,
        fontSize: wordSize,
        letterSpacing: '-0.015em',
        lineHeight: 1,
        WebkitFontSmoothing: 'antialiased',
        userSelect: 'none',
      }}
    >
      {showWordmark ? 'ff.' : null}
    </div>
  );
}
