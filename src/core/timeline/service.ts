import type {
  CreateTimelineEntryInput,
  ListTimelineEntriesQuery,
  TimelineEntryIdInput,
  UpdateTimelineEntryInput,
} from "@/core/timeline/schema";
import type { TimelineEntry } from "@/core/timeline/types";

export interface TimelineService {
  getTimelineEntry(input: TimelineEntryIdInput): Promise<TimelineEntry>;
  listTimelineEntries(
    query?: ListTimelineEntriesQuery,
  ): Promise<TimelineEntry[]>;
  createTimelineEntry(
    input: CreateTimelineEntryInput,
  ): Promise<TimelineEntry>;
  updateTimelineEntry(
    input: UpdateTimelineEntryInput,
  ): Promise<TimelineEntry>;
  deleteTimelineEntry(input: TimelineEntryIdInput): Promise<void>;
}
