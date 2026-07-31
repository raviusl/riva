/**
 * Global Search keyboard / shortcut placeholders (Project 048).
 * No UI bindings yet.
 */

export type SearchShortcut = {
  id: string;
  label: string;
  keys: string[];
  description: string;
};

export const DEFAULT_SEARCH_SHORTCUTS: readonly SearchShortcut[] = [
  {
    id: "open",
    label: "Open search",
    keys: ["Meta", "K"],
    description: "Open Global Search palette",
  },
  {
    id: "next",
    label: "Next result",
    keys: ["ArrowDown"],
    description: "Move highlight to the next match",
  },
  {
    id: "previous",
    label: "Previous result",
    keys: ["ArrowUp"],
    description: "Move highlight to the previous match",
  },
  {
    id: "select",
    label: "Open result",
    keys: ["Enter"],
    description: "Navigate to the highlighted result",
  },
  {
    id: "close",
    label: "Close search",
    keys: ["Escape"],
    description: "Dismiss Global Search",
  },
] as const;

/** Placeholder focus index helpers for future keyboard navigation. */
export function nextFocusIndex(
  current: number,
  total: number,
): number {
  if (total <= 0) return -1;
  if (current < 0) return 0;
  return (current + 1) % total;
}

export function previousFocusIndex(
  current: number,
  total: number,
): number {
  if (total <= 0) return -1;
  if (current < 0) return total - 1;
  return (current - 1 + total) % total;
}
