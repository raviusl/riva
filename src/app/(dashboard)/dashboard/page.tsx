import { requireDashboardContext } from "@/core/auth/context";
import { listClientsByCompany } from "@/core/client/client";
import { listMeetingsByCompany } from "@/core/meeting/meeting";
import {
  createInMemoryPlatformEventBus,
  derivePlatformEvents,
  aiDailyBriefConsumer,
} from "@/core/platform-events";
import { listProjectsByCompany } from "@/core/project/project";
import { listTaskActivities, listTasks } from "@/core/task/service";
import { listVendorsByCompany } from "@/core/vendor/vendor";
import { CommandCenterHome } from "@/components/command-center/command-center-home";
import type { TodaysFocusGroups } from "@/components/command-center/todays-focus";
import { uiZh } from "@/config/ui-zh";
import {
  resolveAiDailyBriefMessage,
} from "@/features/activity-feed/ai-brief";
import { consumeActivityFeedFromEvents } from "@/features/activity-feed/from-platform-events";
import { toWorkspaceActivityItems } from "@/features/activity-feed/derive-feed";
import { buildCompanyMilestoneProjections } from "@/features/timeline-engine/build-projections";
import { createClient } from "@/lib/supabase/server";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

function todayDateString(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function isSameCalendarDay(iso: string, date = new Date()) {
  return iso.slice(0, 10) === todayDateString(date);
}

function formatTimeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-CN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

async function resolveDisplayName(fallback: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fallback;
  return (
    (typeof user.user_metadata?.display_name === "string" &&
      user.user_metadata.display_name) ||
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name) ||
    user.email?.split("@")[0] ||
    fallback
  );
}

export default async function DashboardPage() {
  const context = await requireDashboardContext();
  const canReadTasks = context.permissions.has("task.read");
  const canReadMeetings = context.permissions.has("meeting.read");
  const canReadProjects = context.permissions.has("project.read");
  const canReadClients = context.permissions.has("client.read");
  const canReadVendors = context.permissions.has("vendor.read");
  const canReadTimeline = context.permissions.has("timeline.read");
  const now = new Date();
  const today = todayDateString(now);

  const [tasks, taskActivities, meetings, projects, clients, vendors, displayName] =
    await Promise.all([
      canReadTasks
        ? listTasks({
            workspaceId: context.workspace.id,
            companyId: context.company.id,
          })
        : Promise.resolve([]),
      canReadTasks
        ? listTaskActivities({
            workspaceId: context.workspace.id,
            companyId: context.company.id,
            limit: 40,
          })
        : Promise.resolve([]),
      canReadMeetings
        ? listMeetingsByCompany(context.workspace.id, context.company.id)
        : Promise.resolve([]),
      canReadProjects || canReadTimeline
        ? listProjectsByCompany(context.workspace.id, context.company.id)
        : Promise.resolve([]),
      canReadClients
        ? listClientsByCompany(context.workspace.id, context.company.id)
        : Promise.resolve([]),
      canReadVendors
        ? listVendorsByCompany(context.workspace.id, context.company.id)
        : Promise.resolve([]),
      resolveDisplayName(uiZh.greetingGuest),
    ]);

  const milestones = canReadTimeline
    ? buildCompanyMilestoneProjections({
        projects,
        tasks: canReadTasks ? tasks : [],
        meetings: canReadMeetings ? meetings : [],
      })
    : [];

  const events = derivePlatformEvents({
    companyId: context.company.id,
    workspaceId: context.workspace.id,
    recipientId: context.userId,
    now,
    projects: canReadProjects || canReadTimeline ? projects : [],
    clients: canReadClients ? clients : [],
    vendors: canReadVendors ? vendors : [],
    meetings: canReadMeetings ? meetings : [],
    tasks: canReadTasks ? tasks : [],
    taskActivities: canReadTasks ? taskActivities : [],
    milestones,
    includePlaceholders: false,
  });

  const bus = createInMemoryPlatformEventBus();
  bus.publish(events);
  const briefSignals = aiDailyBriefConsumer.consume(
    bus.list({ channel: "ai_brief" }),
  );

  const feedItems = consumeActivityFeedFromEvents(events, { limit: 6 });
  const activity = toWorkspaceActivityItems(feedItems);

  const openTasks = tasks.filter(
    (task) =>
      !task.archivedAt &&
      task.status !== "completed" &&
      task.status !== "cancelled",
  );

  const todaysTasks = openTasks
    .filter((task) => task.dueDate === today)
    .slice(0, 5)
    .map((task) => ({
      id: `task:${task.id}`,
      title: task.title,
      meta: uiZh.dueToday,
      href: `/dashboard/tasks/${task.id}`,
    }));

  const todaysMeetings = meetings
    .filter(
      (meeting) =>
        meeting.status !== "cancelled" &&
        isSameCalendarDay(meeting.starts_at, now),
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5)
    .map((meeting) => ({
      id: `meeting:${meeting.id}`,
      title: meeting.title,
      meta: formatTimeLabel(meeting.starts_at),
      href: buildWorkspaceOverviewHref("meeting", meeting.id),
    }));

  const todaysDeadlines = openTasks
    .filter((task) => task.dueDate != null && task.dueDate < today)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 5)
    .map((task) => ({
      id: `deadline:${task.id}`,
      title: task.title,
      meta: uiZh.overdue,
      href: `/dashboard/tasks/${task.id}`,
    }));

  const focus: TodaysFocusGroups = {
    tasks: todaysTasks,
    meetings: todaysMeetings,
    deadlines: todaysDeadlines,
  };

  const afternoonStart = new Date(now);
  afternoonStart.setHours(12, 0, 0, 0);

  const meetingsThisAfternoon = meetings.filter((meeting) => {
    if (meeting.status === "cancelled") return false;
    if (!isSameCalendarDay(meeting.starts_at, now)) return false;
    return new Date(meeting.starts_at) >= afternoonStart;
  }).length;

  return (
    <CommandCenterHome
      displayName={displayName}
      focus={focus}
      activity={activity}
      briefMessage={resolveAiDailyBriefMessage(
        briefSignals,
        meetingsThisAfternoon,
      )}
    />
  );
}
