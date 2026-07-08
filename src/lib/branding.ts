import type { CSSProperties } from "react";

/**
 * Per-center theme override. Remaps the primary color tokens for everything
 * rendered inside the styled element; derived shades come from color-mix so a
 * single hex is enough.
 */
export function brandStyle(brandColor?: string | null): CSSProperties | undefined {
  if (!brandColor || !/^#[0-9a-fA-F]{6}$/.test(brandColor)) return undefined;
  return {
    "--color-primary": brandColor,
    "--color-primary-dark": `color-mix(in oklab, ${brandColor}, black 30%)`,
    "--color-primary-soft": `color-mix(in oklab, ${brandColor}, white 90%)`,
  } as CSSProperties;
}
