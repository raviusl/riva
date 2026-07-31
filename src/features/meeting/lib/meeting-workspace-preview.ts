import type { MeetingWorkspaceModel } from "@/features/meeting/lib/meeting-types";
import { uiZh } from "@/config/ui-zh";

/**
 * UI foundation sample meeting (kept for local demos / fallbacks).
 */
export function getMeetingWorkspacePreview(
  meetingId: string,
): MeetingWorkspaceModel {
  const startsAt = new Date();
  startsAt.setHours(10, 0, 0, 0);
  const endsAt = new Date(startsAt);
  endsAt.setHours(11, 0, 0, 0);

  return {
    id: meetingId,
    title: "启动会与时间线评审",
    status: "scheduled",
    meetingType: "consultation",
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    durationMinutes: 60,
    meetingDate: startsAt.toISOString().slice(0, 10),
    meetingTime: "10:00",
    location: "工作室 A · 混合",
    googleMeetLink: null,
    projectId: null,
    projectName: null,
    clientId: null,
    clientName: null,
    vendorIds: [],
    vendorNames: [],
    ownerId: null,
    ownerLabel: null,
    participants: [
      { id: "p1", name: "Alex Chen", role: "策划", email: "alex@example.com" },
      { id: "p2", name: "Jordan Lee", role: uiZh.client, email: "jordan@example.com" },
      { id: "p3", name: "Sam Rivera", role: "协调" },
    ],
    agenda: [
      {
        id: "a1",
        order: 1,
        title: "欢迎与目标",
        durationMinutes: 10,
      },
      {
        id: "a2",
        order: 2,
        title: "时间线梳理",
        durationMinutes: 20,
        notes: "确认里程碑负责人",
      },
      {
        id: "a3",
        order: 3,
        title: "开放问题",
        durationMinutes: 15,
      },
      {
        id: "a4",
        order: 4,
        title: "下一步",
        durationMinutes: 10,
      },
    ],
    decisions: [
      {
        id: "d1",
        title: "锁定仪式开始时间",
        status: "proposed",
        owner: "Alex Chen",
      },
      {
        id: "d2",
        title: "批准供应商短名单",
        status: "accepted",
        owner: "Jordan Lee",
        notes: "摄影师与花艺已确认",
      },
      {
        id: "d3",
        title: "推迟座位图评审",
        status: "deferred",
        owner: "Sam Rivera",
      },
    ],
    notes:
      "本次会议草稿备注。\n\n在此记录讨论要点、开放问题与跟进事项。",
    internalNotes: "",
  };
}
