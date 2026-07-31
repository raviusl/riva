import type {
  CreateTimelineEntryInput,
  ListTimelineEntriesQuery,
  UpdateTimelineEntryInput,
} from "@/core/timeline/schema";
import type { TimelineEntry, TimelineEntryId } from "@/core/timeline/types";

export interface TimelineRepository {
  findById(timelineEntryId: TimelineEntryId): Promise<TimelineEntry | null>;
  list(query?: ListTimelineEntriesQuery): Promise<TimelineEntry[]>;
  insert(input: CreateTimelineEntryInput): Promise<TimelineEntry>;
  update(input: UpdateTimelineEntryInput): Promise<TimelineEntry>;
  delete(timelineEntryId: TimelineEntryId): Promise<void>;
}
