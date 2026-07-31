"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import { loadNotificationCenterAction } from "@/core/actions/notification-center-actions";
import type { NotificationCenterItem } from "@/features/notification-center/derive-feed";
import {
  clearReadNotificationIds,
  loadNotificationCenterState,
  markAllNotificationIdsRead,
  markNotificationIdsRead,
} from "@/features/notification-center/local-state";

export type NotificationCenterViewItem = NotificationCenterItem & {
  isRead: boolean;
};

type NotificationCenterContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  items: NotificationCenterViewItem[];
  unreadCount: number;
  pending: boolean;
  error: string | null;
  refresh: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearRead: () => void;
};

const NotificationCenterContext =
  createContext<NotificationCenterContextValue | null>(null);

type ProviderProps = {
  workspaceId: string;
  companyId: string;
  children: ReactNode;
};

function applyLocalState(
  items: NotificationCenterItem[],
  workspaceId: string,
  companyId: string,
  recipientId: string,
): NotificationCenterViewItem[] {
  const state = loadNotificationCenterState(
    workspaceId,
    companyId,
    recipientId,
  );
  const cleared = new Set(state.clearedIds);
  const read = new Set(state.readIds);

  return items
    .filter((item) => !cleared.has(item.id))
    .map((item) => ({
      ...item,
      isRead: read.has(item.id) || item.status === "read",
      status: read.has(item.id) ? ("read" as const) : item.status,
      readAt: read.has(item.id)
        ? item.readAt ?? new Date().toISOString()
        : item.readAt,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function NotificationCenterProvider({
  workspaceId,
  companyId,
  children,
}: ProviderProps) {
  const [open, setOpen] = useState(false);
  const [rawItems, setRawItems] = useState<NotificationCenterItem[]>([]);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    startTransition(async () => {
      setError(null);
      const result = await loadNotificationCenterAction({
        workspaceId,
        companyId,
      });
      if (!result.ok) {
        setError(result.error);
        setRawItems([]);
        return;
      }
      setRecipientId(result.data.recipientId);
      setRawItems(result.data.items);
      setRevision((value) => value + 1);
    });
  }, [workspaceId, companyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  const items = useMemo(() => {
    if (!recipientId) return [];
    void revision;
    return applyLocalState(rawItems, workspaceId, companyId, recipientId);
  }, [rawItems, workspaceId, companyId, recipientId, revision]);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const markRead = useCallback(
    (id: string) => {
      if (!recipientId) return;
      markNotificationIdsRead(workspaceId, companyId, recipientId, [id]);
      setRevision((value) => value + 1);
    },
    [workspaceId, companyId, recipientId],
  );

  const markAllRead = useCallback(() => {
    if (!recipientId) return;
    markAllNotificationIdsRead(
      workspaceId,
      companyId,
      recipientId,
      items.map((item) => item.id),
    );
    setRevision((value) => value + 1);
  }, [workspaceId, companyId, recipientId, items]);

  const clearRead = useCallback(() => {
    if (!recipientId) return;
    const readIds = items.filter((item) => item.isRead).map((item) => item.id);
    clearReadNotificationIds(workspaceId, companyId, recipientId, readIds);
    setRevision((value) => value + 1);
  }, [workspaceId, companyId, recipientId, items]);

  const value = useMemo(
    () => ({
      open,
      setOpen,
      items,
      unreadCount,
      pending,
      error,
      refresh,
      markRead,
      markAllRead,
      clearRead,
    }),
    [
      open,
      items,
      unreadCount,
      pending,
      error,
      refresh,
      markRead,
      markAllRead,
      clearRead,
    ],
  );

  return (
    <NotificationCenterContext.Provider value={value}>
      {children}
    </NotificationCenterContext.Provider>
  );
}

export function useNotificationCenter() {
  const context = useContext(NotificationCenterContext);
  if (!context) {
    throw new Error(
      "useNotificationCenter must be used within NotificationCenterProvider",
    );
  }
  return context;
}

export function useNotificationCenterOptional() {
  return useContext(NotificationCenterContext);
}
