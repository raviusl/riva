import type {
  TimelineAggregationResult,
  TimelineFeedItem,
} from "@/core/timeline";

export type TimelineWorkspaceModel = {
  id: string;
  title: string;
  description: string;
  workspaceId: string;
  companyId: string;
  feed: TimelineAggregationResult;
};

export type { TimelineFeedItem };
