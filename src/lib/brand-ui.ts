/**
 * RIVA OS Design Language v1.0 — shared visual tokens.
 * UI-only. Every module should inherit these classes.
 */

/* —— Surfaces —— */
export const brandCanvasClassName =
  "relative isolate min-h-svh text-white";

export const brandSurfaceClassName =
  "riva-surface rounded-[var(--riva-radius-lg)]";

export const brandSurfaceSoftClassName =
  "riva-surface-soft rounded-[var(--riva-radius-lg)]";

export const brandGlassPanelClassName =
  "riva-glass border border-[var(--riva-border)] shadow-[var(--riva-shadow-soft)] backdrop-blur-xl";

export const brandCardClassName =
  "riva-card rounded-[var(--riva-radius-lg)]";

/* —— Typography scale —— */
export const brandDisplayClassName =
  "text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl";

export const brandTitleClassName =
  "text-2xl font-semibold tracking-[-0.03em] text-white sm:text-[1.75rem]";

export const brandSubtitleClassName =
  "text-base font-medium tracking-tight text-white/80";

export const brandBodyClassName =
  "text-sm leading-relaxed text-white/45";

export const brandLabelClassName =
  "text-[11px] font-medium tracking-[0.12em] text-white/30 uppercase";

export const brandCaptionClassName =
  "text-xs tracking-tight text-white/35";

/* —— Icons —— */
export const brandIconSizeClassName = "size-[18px] stroke-[1.75]";

export const brandIconButtonClassName =
  "inline-flex size-9 items-center justify-center rounded-xl text-white/45 transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] hover:bg-white/[0.05] hover:text-white/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

/* —— Buttons —— */
export const brandPrimaryButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-medium tracking-tight text-black transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] hover:bg-white/92 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

export const brandSecondaryButtonClassName =
  "inline-flex h-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] px-5 text-sm font-medium tracking-tight text-white/80 transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

export const brandGhostButtonClassName =
  "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium tracking-tight text-white/55 transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] hover:bg-white/[0.05] hover:text-white active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

export const brandDangerButtonClassName =
  "inline-flex h-10 items-center justify-center rounded-full bg-red-500/15 px-5 text-sm font-medium tracking-tight text-red-200 transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] hover:bg-red-500/25 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

/* —— Forms —— */
export const brandFieldClassName =
  "riva-field h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-white placeholder:text-white/30 outline-none transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-red-400/50 aria-invalid:ring-red-400/20";

export const brandTextareaClassName =
  "riva-field min-h-[96px] w-full resize-y rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-white placeholder:text-white/30 outline-none transition duration-[var(--riva-motion)] ease-[var(--riva-ease)] focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-red-400/50 aria-invalid:ring-red-400/20";

export const brandFieldLabelClassName =
  "text-sm font-medium tracking-tight text-white/70";

/* —— Layout —— */
export const brandPageClassName = "mx-auto w-full";

export const brandSectionGapClassName = "space-y-16";
