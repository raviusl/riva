/**
 * In-memory Platform Event Bus abstraction (Project 088).
 * Engines subscribe by channel — they must not call each other.
 */

import type {
  PlatformEvent,
  PlatformEventChannel,
} from "@/core/platform-events/types";

export type PlatformEventHandler = (
  event: PlatformEvent,
) => void | Promise<void>;

export type PlatformEventBus = {
  publish(event: PlatformEvent | readonly PlatformEvent[]): void;
  subscribe(
    channel: PlatformEventChannel | "*",
    handler: PlatformEventHandler,
  ): () => void;
  /** Snapshot of published events (newest last). */
  list(filter?: {
    companyId?: string;
    workspaceId?: string;
    channel?: PlatformEventChannel;
  }): PlatformEvent[];
  clear(): void;
};

type Subscription = {
  channel: PlatformEventChannel | "*";
  handler: PlatformEventHandler;
};

/**
 * Create a process-local event bus.
 * Ready to swap for a durable / realtime implementation later.
 */
export function createInMemoryPlatformEventBus(): PlatformEventBus {
  const events: PlatformEvent[] = [];
  const subscriptions: Subscription[] = [];

  function matchesChannel(
    event: PlatformEvent,
    channel: PlatformEventChannel | "*",
  ): boolean {
    if (channel === "*") return true;
    return event.channels.includes(channel);
  }

  return {
    publish(input) {
      const batch = Array.isArray(input) ? input : [input];
      for (const event of batch) {
        events.push(event);
        for (const sub of subscriptions) {
          if (matchesChannel(event, sub.channel)) {
            void sub.handler(event);
          }
        }
      }
    },

    subscribe(channel, handler) {
      const sub: Subscription = { channel, handler };
      subscriptions.push(sub);
      return () => {
        const index = subscriptions.indexOf(sub);
        if (index >= 0) subscriptions.splice(index, 1);
      };
    },

    list(filter) {
      return events.filter((event) => {
        if (filter?.companyId && event.companyId !== filter.companyId) {
          return false;
        }
        if (filter?.workspaceId && event.workspaceId !== filter.workspaceId) {
          return false;
        }
        if (filter?.channel && !event.channels.includes(filter.channel)) {
          return false;
        }
        return true;
      });
    },

    clear() {
      events.length = 0;
    },
  };
}

/** Shared singleton for server-action orchestration within a process. */
let sharedBus: PlatformEventBus | null = null;

export function getSharedPlatformEventBus(): PlatformEventBus {
  if (!sharedBus) {
    sharedBus = createInMemoryPlatformEventBus();
  }
  return sharedBus;
}
