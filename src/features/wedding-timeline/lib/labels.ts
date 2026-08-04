import { uiZh } from "@/config/ui-zh";
import type {
  WeddingTimelineCategory,
  WeddingTimelinePriority,
  WeddingTimelineStatus,
} from "@/core/wedding-timeline/constants";

export function formatTimelineCategory(
  category: string | null | undefined,
): string {
  if (!category) return uiZh.emDash;
  const map: Record<string, string> = {
    preparation: uiZh.tlCatPreparation,
    makeup: uiZh.tlCatMakeup,
    hair: uiZh.tlCatHair,
    tea_ceremony: uiZh.tlCatTeaCeremony,
    rom: uiZh.tlCatRom,
    lunch: uiZh.tlCatLunch,
    registration: uiZh.tlCatRegistration,
    grand_entrance: uiZh.tlCatGrandEntrance,
    speech: uiZh.tlCatSpeech,
    performance: uiZh.tlCatPerformance,
    cake_cutting: uiZh.tlCatCakeCutting,
    champagne: uiZh.tlCatChampagne,
    first_march_out: uiZh.tlCatFirstMarchOut,
    second_march_in: uiZh.tlCatSecondMarchIn,
    photo_session: uiZh.tlCatPhotoSession,
    sde: uiZh.tlCatSde,
    lucky_draw: uiZh.tlCatLuckyDraw,
    dinner: uiZh.tlCatDinner,
    after_party: uiZh.tlCatAfterParty,
    others: uiZh.tlCatOthers,
  };
  return map[category] ?? category;
}

export function formatTimelineStatus(
  status: WeddingTimelineStatus | string,
): string {
  switch (status) {
    case "not_started":
      return uiZh.tlStatusNotStarted;
    case "ready":
      return uiZh.tlStatusReady;
    case "in_progress":
      return uiZh.tlStatusInProgress;
    case "completed":
      return uiZh.tlStatusCompleted;
    case "delayed":
      return uiZh.tlStatusDelayed;
    case "cancelled":
      return uiZh.tlStatusCancelled;
    default:
      return status;
  }
}

export function formatTimelinePriority(
  priority: WeddingTimelinePriority | string,
): string {
  switch (priority) {
    case "low":
      return uiZh.tlPriorityLow;
    case "normal":
      return uiZh.tlPriorityNormal;
    case "high":
      return uiZh.tlPriorityHigh;
    case "critical":
      return uiZh.tlPriorityCritical;
    default:
      return priority;
  }
}

export function categoryOptions(): Array<{
  value: WeddingTimelineCategory;
  label: string;
}> {
  return [
    "preparation",
    "makeup",
    "hair",
    "tea_ceremony",
    "rom",
    "lunch",
    "registration",
    "grand_entrance",
    "speech",
    "performance",
    "cake_cutting",
    "champagne",
    "first_march_out",
    "second_march_in",
    "photo_session",
    "sde",
    "lucky_draw",
    "dinner",
    "after_party",
    "others",
  ].map((value) => ({
    value: value as WeddingTimelineCategory,
    label: formatTimelineCategory(value),
  }));
}

export function countdownFromWeddingDate(
  weddingDate: string | null | undefined,
): string {
  if (!weddingDate) return uiZh.emDash;
  const target = new Date(`${weddingDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return uiZh.emDash;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff < 0) return uiZh.weddingPassed;
  return uiZh.daysUntilWedding(diff);
}

export function timelineProgress(items: Array<{ status: string }>): number {
  if (items.length === 0) return 0;
  const done = items.filter(
    (row) => row.status === "completed" || row.status === "cancelled",
  ).length;
  return Math.round((done / items.length) * 100);
}
