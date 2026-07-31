/**
 * Client-side read / clear state for Notification Center (Project 076).
 * Company + recipient scoped. Ready to swap for server persistence later.
 */

const STORAGE_PREFIX = "riva.os.notification-center.state.v1";

export type NotificationCenterLocalState = {
  readIds: string[];
  clearedIds: string[];
};

function storageKey(
  workspaceId: string,
  companyId: string,
  recipientId: string,
): string {
  return `${STORAGE_PREFIX}:${workspaceId}:${companyId}:${recipientId}`;
}

export function loadNotificationCenterState(
  workspaceId: string,
  companyId: string,
  recipientId: string,
): NotificationCenterLocalState {
  if (typeof window === "undefined") {
    return { readIds: [], clearedIds: [] };
  }
  try {
    const raw = window.localStorage.getItem(
      storageKey(workspaceId, companyId, recipientId),
    );
    if (!raw) return { readIds: [], clearedIds: [] };
    const parsed = JSON.parse(raw) as NotificationCenterLocalState;
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      clearedIds: Array.isArray(parsed.clearedIds) ? parsed.clearedIds : [],
    };
  } catch {
    return { readIds: [], clearedIds: [] };
  }
}

function save(
  workspaceId: string,
  companyId: string,
  recipientId: string,
  state: NotificationCenterLocalState,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(workspaceId, companyId, recipientId),
    JSON.stringify(state),
  );
}

export function markNotificationIdsRead(
  workspaceId: string,
  companyId: string,
  recipientId: string,
  ids: readonly string[],
): NotificationCenterLocalState {
  const current = loadNotificationCenterState(
    workspaceId,
    companyId,
    recipientId,
  );
  const next = {
    readIds: [...new Set([...current.readIds, ...ids])],
    clearedIds: current.clearedIds,
  };
  save(workspaceId, companyId, recipientId, next);
  return next;
}

export function markAllNotificationIdsRead(
  workspaceId: string,
  companyId: string,
  recipientId: string,
  ids: readonly string[],
): NotificationCenterLocalState {
  return markNotificationIdsRead(workspaceId, companyId, recipientId, ids);
}

export function clearReadNotificationIds(
  workspaceId: string,
  companyId: string,
  recipientId: string,
  readIds: readonly string[],
): NotificationCenterLocalState {
  const current = loadNotificationCenterState(
    workspaceId,
    companyId,
    recipientId,
  );
  const next = {
    readIds: current.readIds.filter((id) => !readIds.includes(id)),
    clearedIds: [...new Set([...current.clearedIds, ...readIds])],
  };
  save(workspaceId, companyId, recipientId, next);
  return next;
}
