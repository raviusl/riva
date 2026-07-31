/**
 * Timeline Workspace feed item (aggregation layer — Project 032).
 * No persistence; composed from Meeting preview + Task + Task Activity.
 */

export const TIMELINE_FEED_KINDS = [
  "meeting",
  "task",
  "task_activity",
  "future_event",
] as const;

export type TimelineFeedKind = (typeof TIMELINE_FEED_KINDS)[number];

export type TimelineFeedItem = {
  id: string;
  kind: TimelineFeedKind;
  title: string;
  entityLabel: string;
  status: string | null;
  occurredAt: string;
  relatedProjectId: string | null;
  relatedProjectName: string | null;
  relatedClientId: string | null;
  relatedClientName: string | null;
  relatedVendorId: string | null;
  relatedVendorName: string | null;
  /** Deep link into the source workspace. */
  href: string;
};

export type TimelineAggregationQuery = {
  workspaceId: string;
  companyId: string;
};

export type TimelineAggregationResult = {
  items: TimelineFeedItem[];
  upcoming: TimelineFeedItem[];
  past: TimelineFeedItem[];
};
