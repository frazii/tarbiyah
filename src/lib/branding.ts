import type { CSSProperties } from "react";

/**
 * Per-center theme override. Remaps the primary color tokens for everything
 * rendered inside the styled element; derived shades come from color-mix so a
 * single hex is enough.
 */
/** WCAG contrast ratio of white text on the given hex background. */
export function contrastWithWhite(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return 1.05 / (lum + 0.05);
}

export function brandStyle(brandColor?: string | null): CSSProperties | undefined {
  if (!brandColor || !/^#[0-9a-fA-F]{6}$/.test(brandColor)) return undefined;
  return {
    "--color-primary": brandColor,
    "--color-primary-dark": `color-mix(in oklab, ${brandColor}, black 30%)`,
    "--color-primary-soft": `color-mix(in oklab, ${brandColor}, white 90%)`,
  } as CSSProperties;
}
