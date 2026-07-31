"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/core/task";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import {
  taskPriorityLabel,
  taskStatusLabel,
} from "@/features/task/lib/task-labels";
import type { TaskWorkspaceItem } from "@/features/task/lib/task-types";
import { uiZh } from "@/config/ui-zh";

const taskFormSchema = z.object({
  title: z.string().min(1, uiZh.taskTitleRequired).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  completedDate: z.string().optional(),
  ownerId: z.string().optional(),
  assigneeId: z.string().optional(),
  followersRaw: z.string().optional(),
  relatedProjectId: z.string().optional(),
  relatedClientId: z.string().optional(),
  relatedVendorId: z.string().optional(),
  relatedMeetingId: z.string().optional(),
  tagsRaw: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

type RelationOption = { id: string; name: string };
type MemberOption = { userId: string; fullName: string };

type TaskWorkspaceFormProps = {
  mode: "create" | "edit";
  initial?: TaskWorkspaceItem | null;
  projects: RelationOption[];
  clients: RelationOption[];
  vendors: RelationOption[];
  meetings?: RelationOption[];
  members: MemberOption[];
  canAssign?: boolean;
  pending?: boolean;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => void;
};

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function emptyToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseTagList(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ].slice(0, 20);
}

export function parseFollowerIds(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return [
    ...new Set(
      raw
        .split(/[\n,]/)
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ].slice(0, 40);
}

export function TaskWorkspaceForm({
  mode,
  initial,
  projects,
  clients,
  vendors,
  meetings = [],
  members,
  canAssign = false,
  pending = false,
  onCancel,
  onSubmit,
}: TaskWorkspaceFormProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      status: initial?.status ?? "todo",
      priority: initial?.priority ?? "normal",
      startDate: toDateInputValue(initial?.startDate),
      dueDate: toDateInputValue(initial?.dueDate),
      completedDate: toDateInputValue(initial?.completedDate),
      ownerId: initial?.ownerId ?? "",
      assigneeId: initial?.assigneeId ?? "",
      followersRaw: (initial?.followers ?? []).join("\n"),
      relatedProjectId: initial?.relatedProjectId ?? "",
      relatedClientId: initial?.relatedClientId ?? "",
      relatedVendorId: initial?.relatedVendorId ?? "",
      relatedMeetingId: initial?.relatedMeetingId ?? "",
      tagsRaw: (initial?.tags ?? []).join(", "),
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
    >
      <div className="space-y-2">
        <Label htmlFor="task-title">{uiZh.titleLabel}</Label>
        <Input
          id="task-title"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">{uiZh.description}</Label>
        <Textarea
          id="task-description"
          className="min-h-24 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-sm text-white"
          disabled={pending}
          {...form.register("description")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-status">{uiZh.status}</Label>
          <select
            id="task-status"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("status")}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[#121214]">
                {taskStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-priority">{uiZh.priority}</Label>
          <select
            id="task-priority"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("priority")}
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority} className="bg-[#121214]">
                {taskPriorityLabel(priority)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="task-start-date">{uiZh.startDate}</Label>
          <Input
            id="task-start-date"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("startDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-due-date">{uiZh.dueDate}</Label>
          <Input
            id="task-due-date"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("dueDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-completed-date">{uiZh.completedDate}</Label>
          <Input
            id="task-completed-date"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("completedDate")}
          />
        </div>
      </div>

      {canAssign ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="task-owner">{uiZh.assignedOwner}</Label>
            <select
              id="task-owner"
              className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
              disabled={pending}
              {...form.register("ownerId")}
            >
              <option value="" className="bg-[#121214]">
                Unassigned
              </option>
              {members.map((member) => (
                <option
                  key={member.userId}
                  value={member.userId}
                  className="bg-[#121214]"
                >
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-assignee">{uiZh.assignee}</Label>
            <select
              id="task-assignee"
              className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
              disabled={pending}
              {...form.register("assigneeId")}
            >
              <option value="" className="bg-[#121214]">
                Unassigned
              </option>
              {members.map((member) => (
                <option
                  key={member.userId}
                  value={member.userId}
                  className="bg-[#121214]"
                >
                  {member.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label>{uiZh.assignedOwner}</Label>
          <p className="text-xs text-white/35">
            Assignment requires the task.assign permission.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="task-followers">{uiZh.followers}</Label>
        <div className="max-h-36 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-3">
          {members.map((member) => {
            const selected = (form.watch("followersRaw") ?? "")
              .split(/[\n,]/)
              .map((id) => id.trim())
              .filter(Boolean);
            const checked = selected.includes(member.userId);
            return (
              <label
                key={member.userId}
                className="flex items-center gap-2 text-sm text-white/80"
              >
                <input
                  type="checkbox"
                  className="rounded border-white/20"
                  checked={checked}
                  disabled={pending || !canAssign}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selected, member.userId]
                      : selected.filter((id) => id !== member.userId);
                    form.setValue("followersRaw", next.join("\n"), {
                      shouldDirty: true,
                    });
                  }}
                />
                {member.fullName}
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-tags">{uiZh.tags}</Label>
        <Input
          id="task-tags"
          className={authFieldClassName}
          disabled={pending}
          placeholder={uiZh.commaSeparatedTags}
          {...form.register("tagsRaw")}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4">
        <p className="text-xs font-medium text-white/70">{uiZh.relatedEntities}</p>

        <div className="space-y-2">
          <Label htmlFor="task-related-project">{uiZh.relatedProject}</Label>
          <select
            id="task-related-project"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("relatedProjectId")}
          >
            <option value="" className="bg-[#121214]">
              None
            </option>
            {projects.map((project) => (
              <option
                key={project.id}
                value={project.id}
                className="bg-[#121214]"
              >
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-related-client">{uiZh.client}</Label>
          <select
            id="task-related-client"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("relatedClientId")}
          >
            <option value="" className="bg-[#121214]">
              None
            </option>
            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
                className="bg-[#121214]"
              >
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-related-vendor">{uiZh.vendors}</Label>
          <select
            id="task-related-vendor"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("relatedVendorId")}
          >
            <option value="" className="bg-[#121214]">
              None
            </option>
            {vendors.map((vendor) => (
              <option
                key={vendor.id}
                value={vendor.id}
                className="bg-[#121214]"
              >
                {vendor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-related-meeting">{uiZh.meetings}</Label>
          {meetings.length > 0 ? (
            <select
              id="task-related-meeting"
              className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
              disabled={pending}
              {...form.register("relatedMeetingId")}
            >
              <option value="" className="bg-[#121214]">
                None
              </option>
              {meetings.map((meeting) => (
                <option
                  key={meeting.id}
                  value={meeting.id}
                  className="bg-[#121214]"
                >
                  {meeting.name}
                </option>
              ))}
            </select>
          ) : (
            <Input
              id="task-related-meeting"
              className={authFieldClassName}
              disabled={pending}
              placeholder={uiZh.meetingIdOptional}
              {...form.register("relatedMeetingId")}
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" size="sm" disabled={pending}>
          {mode === "create" ? uiZh.createTask : uiZh.saveChanges}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function useOpenTaskCount(tasks: TaskWorkspaceItem[]) {
  return tasks.filter(
    (task) =>
      !task.archivedAt &&
      task.status !== "completed" &&
      task.status !== "cancelled",
  ).length;
}
