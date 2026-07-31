/**
 * Activity Feed Engine item shape — unified platform event stream.
 */

import type {
  ActivityEntity,
  ActivityTimeGroup,
  ActivityType,
} from "@/features/activity-feed/kinds";

export type ActivityFeedItem = {
  id: string;
  type: ActivityType;
  entity: ActivityEntity;
  entityId: string;
  title: string;
  description: string;
  userId: string | null;
  userLabel: string | null;
  companyId: string;
  workspaceId: string;
  timestamp: string;
  href: string | null;
};

export type ActivityFeedGroup = {
  id: ActivityTimeGroup;
  label: string;
  items: ActivityFeedItem[];
};
