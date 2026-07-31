/**
 * AI Daily Brief adapter — consumes ai_brief channel only.
 */

import {
  aiDailyBriefConsumer,
  type AiDailyBriefSignals,
} from "@/core/platform-events/consumers";
import type { PlatformEvent } from "@/core/platform-events/types";
import { uiZh } from "@/config/ui-zh";

export type { AiDailyBriefSignals };

export function consumeAiDailyBriefFromEvents(
  events: readonly PlatformEvent[],
): AiDailyBriefSignals {
  return aiDailyBriefConsumer.consume(events);
}

/**
 * Resolve calm brief copy from Event Bus signals (no KPI language).
 */
export function resolveAiDailyBriefMessage(
  signals: AiDailyBriefSignals,
  meetingsThisAfternoon: number,
): string {
  if (signals.overdueTaskCount > 0) {
    return uiZh.overdueTasks(signals.overdueTaskCount);
  }
  if (meetingsThisAfternoon === 0) {
    return uiZh.noMeetingsAfternoon;
  }
  return uiZh.clientNoReply;
}
