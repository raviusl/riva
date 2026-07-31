/**
 * Parse participant lines: "Name" or "Name | role | email"
 */

import type { MeetingParticipant } from "@/core/meeting/types";
import { uiZh } from "@/config/ui-zh";

export function parseParticipantLines(raw: string): MeetingParticipant[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, role, email] = line.split("|").map((part) => part.trim());
      return {
        id: `participant-${index + 1}`,
        name: name || uiZh.participantN(index + 1),
        role: role || undefined,
        email: email || undefined,
      };
    });
}

export function serializeParticipants(
  participants: readonly MeetingParticipant[],
): string {
  return participants
    .map((participant) =>
      [participant.name, participant.role, participant.email]
        .filter(Boolean)
        .join(" | "),
    )
    .join("\n");
}
