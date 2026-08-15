/**
 * Project 101 — Wedding Timeline permissions helpers.
 */

import type { PlatformPermission } from "@/core/permission";

export const WEDDING_TIMELINE_STRUCTURE_PERMISSION =
  "timeline.structure.write" as const satisfies PlatformPermission;

export const WEDDING_TIMELINE_EXECUTE_PERMISSION =
  "timeline.execute" as const satisfies PlatformPermission;

export const WEDDING_TIMELINE_COMMENT_PERMISSION =
  "timeline.comment" as const satisfies PlatformPermission;

export const WEDDING_TIMELINE_ARCHIVE_PERMISSION =
  "timeline.archive" as const satisfies PlatformPermission;

export const WEDDING_TIMELINE_RESTORE_PERMISSION =
  "timeline.restore" as const satisfies PlatformPermission;

export const WEDDING_TIMELINE_STATE_CHANGE_PERMISSION =
  "timeline.state.change" as const satisfies PlatformPermission;

/** Internal notes: structure or execute (not Sales-only read). */
export function canAccessTimelineInternalNotes(
  permissions: ReadonlySet<string> | Iterable<string>,
): boolean {
  const set =
    permissions instanceof Set ? permissions : new Set(permissions);
  return (
    set.has(WEDDING_TIMELINE_STRUCTURE_PERMISSION) ||
    set.has(WEDDING_TIMELINE_EXECUTE_PERMISSION)
  );
}

/** Coarse UI write affordance: structure or execute. */
export function canWriteTimelineSurface(
  permissions: ReadonlySet<string> | Iterable<string>,
): boolean {
  const set =
    permissions instanceof Set ? permissions : new Set(permissions);
  return (
    set.has(WEDDING_TIMELINE_STRUCTURE_PERMISSION) ||
    set.has(WEDDING_TIMELINE_EXECUTE_PERMISSION)
  );
}
