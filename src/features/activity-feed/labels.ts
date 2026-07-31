/**
 * Chinese labels for Activity Feed Engine.
 */

import type {
  ActivityEntity,
  ActivityFilter,
  ActivityType,
} from "@/features/activity-feed/kinds";
import { uiZh } from "@/config/ui-zh";

export function formatActivityEntity(entity: ActivityEntity): string {
  switch (entity) {
    case "project":
      return uiZh.projects;
    case "client":
      return uiZh.clients;
    case "vendor":
      return uiZh.vendors;
    case "meeting":
      return uiZh.meetings;
    case "task":
      return uiZh.tasks;
    case "timeline":
      return uiZh.timeline;
    case "notification":
      return uiZh.notifications;
    case "finance":
      return uiZh.finance;
    case "documents":
      return uiZh.documents;
    case "calendar":
      return uiZh.calendar;
    default: {
      const _exhaustive: never = entity;
      return _exhaustive;
    }
  }
}

export function formatActivityFilter(filter: ActivityFilter): string {
  switch (filter) {
    case "all":
      return uiZh.all;
    case "projects":
      return uiZh.projects;
    case "clients":
      return uiZh.clients;
    case "meetings":
      return uiZh.meetings;
    case "tasks":
      return uiZh.tasks;
    case "timeline":
      return uiZh.timeline;
    case "notifications":
      return uiZh.notifications;
    default: {
      const _exhaustive: never = filter;
      return _exhaustive;
    }
  }
}

export function formatActivityType(type: ActivityType): string {
  switch (type) {
    case "created":
      return uiZh.activityTypeCreated;
    case "updated":
      return uiZh.activityTypeUpdated;
    case "assigned":
      return uiZh.activityTypeAssigned;
    case "completed":
      return uiZh.activityTypeCompleted;
    case "cancelled":
      return uiZh.activityTypeCancelled;
    case "scheduled":
      return uiZh.activityTypeScheduled;
    case "status_changed":
      return uiZh.activityTypeStatusChanged;
    case "reminder":
      return uiZh.activityTypeReminder;
    case "published":
      return uiZh.activityTypePublished;
    case "placeholder":
      return uiZh.activityTypePlaceholder;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
