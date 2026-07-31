/**
 * Shared OS entry visuals — aligned with Project 064 brand system.
 */

import { uiZh } from "@/config/ui-zh";

export const osShellClassName =
  "relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-16 text-white sm:px-8";

export const osAtmosphereClassName =
  "pointer-events-none absolute inset-0";

export const osStageClassName =
  "os-enter relative z-10 mx-auto w-full max-w-lg text-center";

export const osStageWideClassName =
  "os-enter relative z-10 mx-auto w-full max-w-2xl text-center";

export const osGreetingClassName =
  "text-[15px] font-normal tracking-tight text-white/45 sm:text-base";

export const osDisplayNameClassName =
  "mt-2 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl md:text-[3.25rem]";

export const osTitleClassName =
  "text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl";

export const osSubtitleClassName =
  "mt-3 text-[15px] leading-relaxed text-white/40 sm:text-base";

export const osBodyClassName =
  "mt-5 text-[15px] leading-relaxed text-white/40 sm:text-base";

export const osPrimaryButtonClassName =
  "inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-white px-10 text-[15px] font-medium tracking-tight text-black transition duration-200 ease-[var(--riva-ease)] hover:bg-white/92 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

export const osChoiceCardClassName =
  "group relative flex w-full flex-col items-start gap-1.5 rounded-[22px] border border-white/[0.07] bg-white/[0.03] px-6 py-6 text-left shadow-[var(--riva-shadow-soft)] backdrop-blur-xl transition duration-200 ease-[var(--riva-ease)] hover:-translate-y-0.5 hover:border-white/[0.14] hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-40 data-[selected=true]:border-white/25 data-[selected=true]:bg-white/[0.07]";

export const osChoiceNameClassName =
  "text-lg font-medium tracking-tight text-white sm:text-xl";

export const osChoiceMetaClassName =
  "text-sm tracking-tight text-white/35";

const COMPANY_TYPE_LABELS: Record<string, string> = {
  agency: "机构",
  brand: "品牌",
  venue: "场地",
  corporate: "企业",
  wedding: "婚礼",
  other: "其他",
};

export function formatCompanyTypeLabel(
  type: string | null | undefined,
): string | null {
  if (!type) return null;
  return COMPANY_TYPE_LABELS[type] ?? type;
}

export function resolveDayGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return uiZh.goodMorning;
  if (hour < 18) return uiZh.goodAfternoon;
  return uiZh.goodEvening;
}
