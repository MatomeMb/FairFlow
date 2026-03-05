import { useState, useEffect } from 'react';

/**
 * FAIRFLOW BRAND IDENTITY SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * The mark is a stylized "ff" monogram derived from the ∬ (double integral) symbol.
 * This is the conceptual core: mathematical elegance, continuity, and rhythm.
 * 
 * OPTICAL CORRECTION & RENDERING PRINCIPLES:
 * ───────────────────────────────────────────────────────────────────────────────
 * 1. BASE STROKE: 2.0–2.6 for 48-unit viewBox. Scales linearly with markHeight.
 *    Optimized for legibility at 16×16px (favicon) and presence at 96×96px (header).
 * 
 * 2. HORIZONTAL STROKE CORRECTION: Horizontal crossbars are 0.8× vertical weight.
 *    This corrects the human visual bias that perceives horizontal strokes as 10% heavier.
 * 
 * 3. VERTICAL ALIGNMENT: Wordmark aligns to x-height (≈0.72em), not cap-height.
 *    This creates visual balance with the mark's optical midpoint.
 * 
 * 4. MARK-TO-TEXT GAP: Derived as 0.5× the wordmark's cap-height, not a fixed pixel.
 *    This ensures the lockup scales proportionally across all sizes.
 * 
 * 5. PATH CONTINUITY: All curves use cubic Bezier (C command) with continuous tangents.
 *    No abrupt directional shifts at anchor points. Tight corners use round line joins.
 * 
 * VARIANT DESIGN INTENT:
 * ───────────────────────────────────────────────────────────────────────────────
 * • Luxury:       Swiss watchmaking aesthetic. Square caps, max weight, wide sweep.
 * • Geo-Tech:     Engineering CAD. Straight segments, angled turns, precise anchors.
 * • Soft-Premium: Modern SaaS. Rounded caps, lighter weight, smooth curves.
 * • Executive:    Financial gravity. Compressed width, tall height, heavy weight.
 * • Precision:    Scientific instruments. Light weight, micro-dash terminals.
 * • Aero:         Aerospace/mobility. Wide curves, horizontal lean, dynamic motion.
 * • Bold-Minimal: Brutalist geometry. Two rectangles, no curves, maximum reduction.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type LogoStyle = 'luxury' | 'geo-tech' | 'soft-premium' | 'executive' | 'precision' | 'aero' | 'bold-minimal' | 'derivative';

export const LOGO_STYLES: Array<{ id: LogoStyle; label: string; description: string }> = [
  { id: 'luxury', label: 'Luxury', description: 'Swiss watchmaking. Square terminals, maximum weight.' },
  { id: 'geo-tech', label: 'Geo-Tech', description: 'Engineering CAD. Geometric precision, angled forms.' },
  { id: 'soft-premium', label: 'Soft Premium', description: 'Modern SaaS. Rounded caps, elegant curves.' },
  { id: 'executive', label: 'Executive', description: 'Financial gravity. Compressed, tall, authoritative.' },
  { id: 'precision', label: 'Precision', description: 'Scientific instruments. Light weight, micro-details.' },
  { id: 'aero', label: 'Aero', description: 'Aerospace/mobility. Dynamic, horizontal lean.' },
  { id: 'bold-minimal', label: 'Bold Minimal', description: 'Brutalist geometry. Maximum reduction.' },
  { id: 'derivative', label: 'Derivative', description: 'Mathematical elegance. Twin S-curves (integral signs).' },
];

interface FairflowLogoProps {
  markHeight?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  style?: LogoStyle;
}

/**
 * LogoMark: The "ff" monogram in 7 professional variants.
 * All variants designed to maintain vertical symmetry and optical harmony.
 */
function LogoMark({
  size,
  color,
  style = 'geo-tech',
}: {
  size: number;
  color: string;
  style?: LogoStyle;
}) {
  // STROKE WEIGHT OPTIMIZATION: Base 4.8 (increased for bold presence).
  // This ensures strong visual weight at all scales: 16px, 40px, 96px+.
  const baseStroke = Math.max(4.8, size * 0.1);
  
  // Optical correction: horizontal strokes are 0.75× the vertical weight.
  const verticalStroke = baseStroke;
  const horizontalStroke = baseStroke * 0.75;
  
  // Refined color: off-white avoids the optical vibration of pure #FFFFFF on dark.
  const refinedColor = color.toUpperCase() === '#FFFFFF' ? '#F5F5F0' : color;

  /**
   * VARIANT RENDERING: Enhanced creative designs with stronger visual presence.
   * Each variant now features more distinctive geometry and visual hierarchy.
   */
  const renderPath = () => {
    switch (style) {
      case 'luxury': {
        return (
          <>
            <path d="M 12 5 C 9 10 9 16 12 21 C 9 27 9 34 12 43" stroke={refinedColor} strokeWidth={verticalStroke * 1.05} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="8" y1="11" x2="16" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke} strokeLinecap="round" />
            <path d="M 30 5 C 27 10 27 16 30 21 C 27 27 27 34 30 43" stroke={refinedColor} strokeWidth={verticalStroke * 1.05} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="26" y1="11" x2="34" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke} strokeLinecap="round" />
          </>
        );
      }

      case 'geo-tech': {
        return (
          <>
            <path d="M 12 4 L 12 44" stroke={refinedColor} strokeWidth={verticalStroke} strokeLinecap="square" fill="none" />
            <line x1="7" y1="9" x2="16" y2="9" stroke={refinedColor} strokeWidth={horizontalStroke} strokeLinecap="square" />
            <line x1="7" y1="24" x2="15" y2="24" stroke={refinedColor} strokeWidth={horizontalStroke} strokeLinecap="square" />
            <path d="M 30 4 L 30 44" stroke={refinedColor} strokeWidth={verticalStroke} strokeLinecap="square" fill="none" />
            <line x1="25" y1="9" x2="34" y2="9" stroke={refinedColor} strokeWidth={horizontalStroke} strokeLinecap="square" />
            <line x1="25" y1="24" x2="33" y2="24" stroke={refinedColor} strokeWidth={horizontalStroke} strokeLinecap="square" />
          </>
        );
      }

      case 'soft-premium': {
        return (
          <>
            <path d="M 12 5 C 8.5 10.5 8.5 18 12 23 C 8.5 28 8.5 35.5 12 43" stroke={refinedColor} strokeWidth={verticalStroke * 0.95} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="8" y1="11" x2="15" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke * 0.95} strokeLinecap="round" />
            <path d="M 30 5 C 26.5 10.5 26.5 18 30 23 C 26.5 28 26.5 35.5 30 43" stroke={refinedColor} strokeWidth={verticalStroke * 0.95} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="26" y1="11" x2="33" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke * 0.95} strokeLinecap="round" />
          </>
        );
      }

      case 'executive': {
        return (
          <>
            <line x1="12" y1="4" x2="12" y2="44" stroke={refinedColor} strokeWidth={verticalStroke * 1.2} strokeLinecap="round" />
            <line x1="7" y1="10" x2="18" y2="10" stroke={refinedColor} strokeWidth={horizontalStroke * 1.15} strokeLinecap="round" />
            <line x1="7" y1="24" x2="17" y2="24" stroke={refinedColor} strokeWidth={horizontalStroke * 1.1} strokeLinecap="round" />
            <line x1="30" y1="4" x2="30" y2="44" stroke={refinedColor} strokeWidth={verticalStroke * 1.2} strokeLinecap="round" />
            <line x1="25" y1="10" x2="36" y2="10" stroke={refinedColor} strokeWidth={horizontalStroke * 1.15} strokeLinecap="round" />
            <line x1="25" y1="24" x2="35" y2="24" stroke={refinedColor} strokeWidth={horizontalStroke * 1.1} strokeLinecap="round" />
          </>
        );
      }

      case 'precision': {
        return (
          <>
            <path d="M 12 5 C 10 11 10 17 12 23 C 10 29 10 36 12 43" stroke={refinedColor} strokeWidth={verticalStroke * 0.78} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="8.5" y1="11" x2="14.5" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke * 0.78} strokeLinecap="round" />
            <path d="M 30 5 C 28 11 28 17 30 23 C 28 29 28 36 30 43" stroke={refinedColor} strokeWidth={verticalStroke * 0.78} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="26.5" y1="11" x2="32.5" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke * 0.78} strokeLinecap="round" />
          </>
        );
      }

      case 'aero': {
        return (
          <>
            <path d="M 12 5 C 7.5 11 8 18 12 23 C 8 28 7.5 35 12 43" stroke={refinedColor} strokeWidth={verticalStroke * 0.95} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="8" y1="11" x2="16" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke * 0.9} strokeLinecap="round" />
            <path d="M 30 5 C 25.5 11 26 18 30 23 C 26 28 25.5 35 30 43" stroke={refinedColor} strokeWidth={verticalStroke * 0.95} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <line x1="26" y1="11" x2="34" y2="11" stroke={refinedColor} strokeWidth={horizontalStroke * 0.9} strokeLinecap="round" />
          </>
        );
      }

      case 'bold-minimal': {
        return (
          <>
            <rect x="8" y="4" width="8" height="40" fill={refinedColor} rx="2" />
            <rect x="4" y="8" width="12" height="5" fill={refinedColor} rx="2" />
            <rect x="4" y="22" width="11" height="5" fill={refinedColor} rx="2" />
            <rect x="26" y="4" width="8" height="40" fill={refinedColor} rx="2" />
            <rect x="22" y="8" width="12" height="5" fill={refinedColor} rx="2" />
            <rect x="22" y="22" width="11" height="5" fill={refinedColor} rx="2" />
          </>
        );
      }

      case 'derivative': {
        return (
          <>
            <path d="M 16 12 C 22 20 10 52 16 60" fill="none" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 36 12 C 42 20 30 52 36 60" fill="none" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="30" x2="24" y2="30" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="28" y1="30" x2="46" y2="30" stroke="currentColor" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="10" r="4.5" fill="currentColor" />
            <circle cx="12" cy="62" r="4.5" fill="currentColor" />
            <circle cx="40" cy="10" r="4.5" fill="currentColor" />
            <circle cx="32" cy="62" r="4.5" fill="currentColor" />
          </>
        );
      }

      default:
        return null;
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={style === 'derivative' ? '0 0 64 72' : '0 0 48 48'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        display: 'block',
        flexShrink: 0,
        color: refinedColor,
        filter: 'none',
        mixBlendMode: 'normal',
      }}
    >
      {renderPath()}
    </svg>
  );
}

/**
 * FairflowLogo: Full brand lockup with mark and wordmark.
 * Implements professional mark-to-text spacing and vertical alignment.
 */
export function FairflowLogo({
  markHeight = 56,
  showWordmark = true,
  variant = 'light',
  style = 'geo-tech',
}: FairflowLogoProps) {
  const [currentStyle, setCurrentStyle] = useState<LogoStyle>(style);

  // URL override: ?logoStyle=luxury (or any valid style)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const styleParam = params.get('logoStyle') as LogoStyle | null;
    if (styleParam && LOGO_STYLES.some((s) => s.id === styleParam)) {
      setCurrentStyle(styleParam);
    }
  }, []);

  // WORDMARK SIZING: Proportional to mark height.
  // wordSize = 0.42× markHeight for a tighter, more mark-forward lockup.
  const wordSize = Math.round(markHeight * 0.42);
  
  // MARK-TO-TEXT GAP: Derived as 0.5× the cap-height of the wordmark.
  // Cap-height ≈ 0.72× font size. Gap = 0.5 × 0.72 × wordSize ≈ 0.36 × wordSize.
  // Simplified to 5px for most cases (maintains professional lockup spacing).
  const gapSize = Math.max(5, Math.round(wordSize * 0.36));

  const markColor = variant === 'dark' ? '#FFFFFF' : '#1B2330';
  const wordColor = variant === 'dark' ? '#FFFFFF' : '#1B2330';

  // WORDMARK FONT WEIGHT: Lighter for soft variants (600), heavier for logo-forward variants (700).
  const fontWeight = currentStyle === 'luxury' || currentStyle === 'bold-minimal' ? 700 : 600;

  // TEXT VERTICAL ALIGNMENT: Align to x-height (≈0.72em) for optical balance with mark.
  // translateY shifts the baseline down by ~0.14 × font-size to center on x-height.
  const textOffsetY = Math.round(wordSize * 0.14);

  return (
    <div
      className="fairflow-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: Math.max(2, gapSize - 3),
        color: wordColor,
        isolation: 'isolate',
        filter: 'none',
        mixBlendMode: 'normal',
      }}
    >
      <div style={{ marginRight: currentStyle === 'derivative' ? -12 : 0 }}>
        <LogoMark size={markHeight} color={markColor} style={currentStyle} />
      </div>
      
      {showWordmark && (
        <span
          style={{
            fontFamily: "'Sora', 'Instrument Sans', system-ui, sans-serif",
            fontWeight,
            fontSize: wordSize,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: wordColor,
            textRendering: 'geometricPrecision',
            WebkitFontSmoothing: 'antialiased',
            transform: `translate(-2px, ${textOffsetY + 3}px)`,
          }}
        >
          fairflow
        </span>
      )}
    </div>
  );
}
