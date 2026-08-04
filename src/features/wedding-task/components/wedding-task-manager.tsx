"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";
import {
  addWeddingTaskAttachmentAction,
  addWeddingTaskCommentAction,
  archiveWeddingTaskAction,
  bulkWeddingTasksAction,
  completeWeddingTaskAction,
  createWeddingTaskAction,
  deleteWeddingTaskAction,
  duplicateWeddingTaskAction,
  loadWeddingTasksAction,
  restoreWeddingTaskAction,
  updateWeddingTaskAction,
} from "@/core/actions/wedding-task-actions";
import type { Client, Project, Vendor } from "@/core/types";
import {
  WEDDING_TASK_KANBAN_COLUMNS,
  WEDDING_TASK_PRIORITIES,
  WEDDING_TASK_REMINDERS,
  WEDDING_TASK_SORTS,
  WEDDING_TASK_STATUSES,
  type WeddingTaskSort,
  type WeddingTaskStatus,
  type WeddingTaskView,
} from "@/core/wedding-task/constants";
import type { WeddingProjectTask } from "@/core/wedding-task/types";
import {
  daysUntilDue,
  formatWeddingTaskPriority,
  formatWeddingTaskSort,
  formatWeddingTaskStatus,
  priorityTone,
  sortWeddingTasks,
  statusTone,
  tasksByDueMonth,
  weddingTaskProgress,
} from "@/features/wedding-task/lib/labels";
import { cn } from "@/lib/utils";

type WeddingTaskManagerProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  clients: Client[];
  vendors: Vendor[];
  canWrite: boolean;
};

type EditorState = {
  mode: "create" | "edit";
  task: Partial<WeddingProjectTask> | null;
};

const VIEWS: Array<{ id: WeddingTaskView; label: string }> = [
  { id: "list", label: uiZh.wtViewList },
  { id: "kanban", label: uiZh.wtViewKanban },
  { id: "calendar", label: uiZh.wtViewCalendar },
  { id: "progress", label: uiZh.wtViewProgress },
];

function emptyTask(project: Project): Partial<WeddingProjectTask> {
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "normal",
    due_date: "",
    start_date: "",
    assignee_label: "",
    coordinator_label: "",
    package_label: project.package_name ?? "",
    client_id: project.client_id ?? null,
    vendor_id: null,
    reminder_minutes: null,
    internal_notes: "",
    tags: [],
    attachments: [],
    comments: [],
  };
}

function reminderLabel(minutes: number | null | undefined): string {
  if (minutes == null) return uiZh.emDash;
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

export function WeddingTaskManager({
  workspaceId,
  companyId,
  project,
  clients,
  vendors,
  canWrite,
}: WeddingTaskManagerProps) {
  const [tasks, setTasks] = useState<WeddingProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<WeddingTaskView>("list");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sort, setSort] = useState<WeddingTaskSort>("due_date");
  const [showArchived, setShowArchived] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [pending, startTransition] = useTransition();
  const scope = useMemo(
    () => ({ workspaceId, companyId, projectId: project.id }),
    [workspaceId, companyId, project.id],
  );

  const refresh = useCallback(async () => {
    const result = await loadWeddingTasksAction({
      ...scope,
      includeArchived: showArchived,
    });
    if (!result.ok) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    setTasks(result.data.tasks);
    setLoading(false);
  }, [scope, showArchived]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = tasks.filter((task) => {
      if (!showArchived && task.archived_at) return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) {
        return false;
      }
      if (!q) return true;
      const hay = [
        task.title,
        task.description ?? "",
        task.assignee_label ?? "",
        task.coordinator_label ?? "",
        task.package_label ?? "",
        task.internal_notes ?? "",
        ...task.tags,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    return sortWeddingTasks(rows, sort);
  }, [tasks, query, statusFilter, priorityFilter, sort, showArchived]);

  const progress = weddingTaskProgress(tasks);
  const clientName = (id: string | null) =>
    clients.find((c) => c.id === id)?.display_name ||
    clients.find((c) => c.id === id)?.name ||
    uiZh.emDash;
  const vendorName = (id: string | null) =>
    vendors.find((v) => v.id === id)?.name ?? uiZh.emDash;

  function openCreate() {
    setCommentDraft("");
    setAttachmentName("");
    setAttachmentUrl("");
    setEditor({ mode: "create", task: emptyTask(project) });
  }

  function openEdit(task: WeddingProjectTask) {
    setCommentDraft("");
    setAttachmentName("");
    setAttachmentUrl("");
    setEditor({ mode: "edit", task: { ...task } });
  }

  function saveEditor() {
    if (!editor?.task?.title?.trim()) {
      toast.error(uiZh.taskManager);
      return;
    }
    const draft = editor.task;
    startTransition(async () => {
      if (editor.mode === "create") {
        const result = await createWeddingTaskAction({
          ...scope,
          title: draft.title!.trim(),
          description: draft.description ?? null,
          status: draft.status ?? "todo",
          priority: draft.priority ?? "normal",
          dueDate: draft.due_date || null,
          startDate: draft.start_date || null,
          reminderMinutes: draft.reminder_minutes ?? null,
          assigneeLabel: draft.assignee_label ?? null,
          clientId: draft.client_id ?? null,
          vendorId: draft.vendor_id ?? null,
          coordinatorLabel: draft.coordinator_label ?? null,
          packageLabel: draft.package_label ?? null,
          tags: draft.tags ?? [],
          internalNotes: draft.internal_notes ?? null,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(uiZh.wtTaskCreated);
      } else if (draft.id) {
        const result = await updateWeddingTaskAction({
          ...scope,
          taskId: draft.id,
          title: draft.title!.trim(),
          description: draft.description ?? null,
          status: draft.status ?? "todo",
          priority: draft.priority ?? "normal",
          dueDate: draft.due_date || null,
          startDate: draft.start_date || null,
          reminderMinutes: draft.reminder_minutes ?? null,
          assigneeLabel: draft.assignee_label ?? null,
          clientId: draft.client_id ?? null,
          vendorId: draft.vendor_id ?? null,
          coordinatorLabel: draft.coordinator_label ?? null,
          packageLabel: draft.package_label ?? null,
          tags: draft.tags ?? [],
          attachments: draft.attachments ?? [],
          comments: draft.comments ?? [],
          internalNotes: draft.internal_notes ?? null,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(uiZh.wtTaskSaved);
      }
      setEditor(null);
      await refresh();
    });
  }

  function runItemAction(
    action: "complete" | "duplicate" | "archive" | "restore" | "delete",
    taskId: string,
  ) {
    startTransition(async () => {
      let result;
      if (action === "complete") {
        result = await completeWeddingTaskAction({ ...scope, taskId });
      } else if (action === "duplicate") {
        result = await duplicateWeddingTaskAction({ ...scope, taskId });
      } else if (action === "archive") {
        result = await archiveWeddingTaskAction({ ...scope, taskId });
      } else if (action === "restore") {
        result = await restoreWeddingTaskAction({ ...scope, taskId });
      } else {
        result = await deleteWeddingTaskAction({ ...scope, taskId });
      }
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (action === "complete") toast.success(uiZh.wtTaskCompleted);
      if (action === "duplicate") toast.success(uiZh.wtTaskDuplicated);
      if (action === "archive") toast.success(uiZh.wtTaskArchived);
      if (action === "delete") toast.success(uiZh.wtTaskDeleted);
      if (editor?.task?.id === taskId && action === "delete") setEditor(null);
      await refresh();
    });
  }

  function runBulk(action: "complete" | "archive" | "delete") {
    if (selected.size === 0) return;
    startTransition(async () => {
      const result = await bulkWeddingTasksAction({
        ...scope,
        taskIds: [...selected],
        action,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSelected(new Set());
      await refresh();
    });
  }

  function submitComment() {
    if (!editor?.task?.id || !commentDraft.trim()) return;
    startTransition(async () => {
      const result = await addWeddingTaskCommentAction({
        ...scope,
        taskId: editor.task!.id!,
        body: commentDraft.trim(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setCommentDraft("");
      setEditor({ mode: "edit", task: result.data.task });
      await refresh();
    });
  }

  function submitAttachment() {
    if (!editor?.task?.id || !attachmentName.trim()) return;
    startTransition(async () => {
      const result = await addWeddingTaskAttachmentAction({
        ...scope,
        taskId: editor.task!.id!,
        name: attachmentName.trim(),
        url: attachmentUrl.trim() || null,
        mimeType: null,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setAttachmentName("");
      setAttachmentUrl("");
      setEditor({ mode: "edit", task: result.data.task });
      await refresh();
    });
  }

  function moveKanban(task: WeddingProjectTask, status: WeddingTaskStatus) {
    if (!canWrite || task.status === status) return;
    startTransition(async () => {
      const result = await updateWeddingTaskAction({
        ...scope,
        taskId: task.id,
        title: task.title,
        description: task.description,
        status,
        priority: task.priority,
        dueDate: task.due_date,
        startDate: task.start_date,
        reminderMinutes: task.reminder_minutes,
        assigneeLabel: task.assignee_label,
        clientId: task.client_id,
        vendorId: task.vendor_id,
        coordinatorLabel: task.coordinator_label,
        packageLabel: task.package_label,
        tags: task.tags,
        attachments: task.attachments,
        comments: task.comments,
        internalNotes: task.internal_notes,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      await refresh();
    });
  }

  const calendarMap = useMemo(
    () =>
      tasksByDueMonth(filtered, calendarCursor.year, calendarCursor.month),
    [filtered, calendarCursor],
  );

  const calendarDays = useMemo(() => {
    const first = new Date(calendarCursor.year, calendarCursor.month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(
      calendarCursor.year,
      calendarCursor.month + 1,
      0,
    ).getDate();
    const cells: Array<{ day: number | null; tasks: WeddingProjectTask[] }> =
      [];
    for (let i = 0; i < startPad; i += 1) cells.push({ day: null, tasks: [] });
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({ day: d, tasks: calendarMap.get(d) ?? [] });
    }
    return cells;
  }, [calendarCursor, calendarMap]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-medium tracking-tight text-white/90">
            {uiZh.taskManager}
          </h2>
          <p className="text-sm text-white/45">
            {uiZh.wtProgressLabel} {progress.percent}% · {progress.completed}/
            {progress.total}
            {progress.overdue > 0
              ? ` · ${uiZh.wtOverdue} ${progress.overdue}`
              : ""}
          </p>
          <div className="mt-2 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400/80 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((row) => (
            <Button
              key={row.id}
              type="button"
              size="sm"
              variant={view === row.id ? "default" : "outline"}
              onClick={() => setView(row.id)}
            >
              {row.label}
            </Button>
          ))}
          {canWrite ? (
            <Button type="button" size="sm" onClick={openCreate}>
              {uiZh.wtAddTask}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uiZh.wtSearch}
          className="sm:max-w-xs"
        />
        <select
          className="h-9 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white/80"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">{uiZh.wtFilterStatus}: {uiZh.wtAll}</option>
          {WEDDING_TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatWeddingTaskStatus(status)}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white/80"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">{uiZh.wtFilterPriority}: {uiZh.wtAll}</option>
          {WEDDING_TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {formatWeddingTaskPriority(priority)}
            </option>
          ))}
        </select>
        <select
          className="h-9 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white/80"
          value={sort}
          onChange={(e) => setSort(e.target.value as WeddingTaskSort)}
        >
          {WEDDING_TASK_SORTS.map((key) => (
            <option key={key} value={key}>
              {uiZh.wtSortBy}: {formatWeddingTaskSort(key)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-white/50">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          {uiZh.wtShowArchived}
        </label>
      </div>

      {canWrite && selected.size > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
          <span className="text-xs text-white/50">
            {uiZh.wtBulkActions} ({selected.size})
          </span>
          <Button size="sm" variant="outline" onClick={() => runBulk("complete")}>
            {uiZh.wtComplete}
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulk("archive")}>
            {uiZh.wtArchive}
          </Button>
          <Button size="sm" variant="outline" onClick={() => runBulk("delete")}>
            {uiZh.delete}
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/8 px-4 py-10 text-center text-sm text-white/40">
          …
        </div>
      ) : filtered.length === 0 && view !== "calendar" && view !== "progress" ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center">
          <p className="text-sm text-white/70">{uiZh.wtEmpty}</p>
          <p className="mt-1 text-xs text-white/40">{uiZh.wtEmptyHint}</p>
          {canWrite ? (
            <Button className="mt-4" size="sm" onClick={openCreate}>
              {uiZh.wtAddTask}
            </Button>
          ) : null}
        </div>
      ) : null}

      {view === "list" && filtered.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-white/8">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-xs text-white/45">
              <tr>
                {canWrite ? (
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={
                        filtered.length > 0 &&
                        filtered.every((t) => selected.has(t.id))
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected(new Set(filtered.map((t) => t.id)));
                        } else {
                          setSelected(new Set());
                        }
                      }}
                      aria-label={uiZh.wtSelectAll}
                    />
                  </th>
                ) : null}
                <th className="px-3 py-2 font-medium">{uiZh.tlActivity}</th>
                <th className="px-3 py-2 font-medium">{uiZh.wtFilterStatus}</th>
                <th className="px-3 py-2 font-medium">{uiZh.wtPriority}</th>
                <th className="px-3 py-2 font-medium">{uiZh.wtDueDate}</th>
                <th className="px-3 py-2 font-medium">{uiZh.wtAssignee}</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => {
                const days = daysUntilDue(task.due_date);
                return (
                  <tr
                    key={task.id}
                    className={cn(
                      "border-t border-white/6 hover:bg-white/[0.02]",
                      task.archived_at && "opacity-50",
                    )}
                  >
                    {canWrite ? (
                      <td className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={selected.has(task.id)}
                          onChange={(e) => {
                            const next = new Set(selected);
                            if (e.target.checked) next.add(task.id);
                            else next.delete(task.id);
                            setSelected(next);
                          }}
                        />
                      </td>
                    ) : null}
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        className="text-left font-medium text-white/85 hover:text-white"
                        onClick={() => openEdit(task)}
                      >
                        {task.title}
                      </button>
                      {task.description ? (
                        <p className="mt-0.5 line-clamp-1 text-xs text-white/35">
                          {task.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-0.5 text-xs",
                          statusTone(task.status),
                        )}
                      >
                        {formatWeddingTaskStatus(task.status)}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-xs",
                        priorityTone(task.priority),
                      )}
                    >
                      {formatWeddingTaskPriority(task.priority)}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-white/55">
                      {task.due_date ?? uiZh.wtNoDueDate}
                      {days != null && task.status !== "completed" ? (
                        <span className="ml-1 text-white/35">
                          ({uiZh.wtDaysLeft(days)})
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-white/55">
                      {task.assignee_label || uiZh.emDash}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap justify-end gap-1">
                        {canWrite && task.status !== "completed" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => runItemAction("complete", task.id)}
                          >
                            {uiZh.wtComplete}
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(task)}
                        >
                          {uiZh.edit}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {view === "kanban" ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {WEDDING_TASK_KANBAN_COLUMNS.map((column) => {
            const columnTasks = filtered.filter((t) => t.status === column);
            return (
              <div
                key={column}
                className="min-h-48 rounded-2xl border border-white/8 bg-white/[0.02] p-3"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-white/50">
                    {formatWeddingTaskStatus(column)}
                  </h3>
                  <span className="text-xs text-white/30">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      className="w-full rounded-xl border border-white/8 bg-black/20 p-3 text-left transition hover:border-white/15"
                      onClick={() => openEdit(task)}
                      onDragOver={(e) => e.preventDefault()}
                      draggable={canWrite}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/task-id", task.id);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/task-id");
                        const dragged = tasks.find((t) => t.id === id);
                        if (dragged) moveKanban(dragged, column);
                      }}
                    >
                      <p className="text-sm font-medium text-white/85">
                        {task.title}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/40">
                        <span className={priorityTone(task.priority)}>
                          {formatWeddingTaskPriority(task.priority)}
                        </span>
                        {task.due_date ? <span>{task.due_date}</span> : null}
                        {task.assignee_label ? (
                          <span>{task.assignee_label}</span>
                        ) : null}
                      </div>
                    </button>
                  ))}
                  {canWrite ? (
                    <div
                      className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-white/25"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const id = e.dataTransfer.getData("text/task-id");
                        const dragged = tasks.find((t) => t.id === id);
                        if (dragged) moveKanban(dragged, column);
                      }}
                    >
                      Drop
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {view === "calendar" ? (
        <div className="space-y-3 rounded-2xl border border-white/8 p-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCalendarCursor((prev) => {
                  const d = new Date(prev.year, prev.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
            >
              ‹
            </Button>
            <p className="text-sm text-white/70">
              {calendarCursor.year}-{String(calendarCursor.month + 1).padStart(2, "0")}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setCalendarCursor((prev) => {
                  const d = new Date(prev.year, prev.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })
              }
            >
              ›
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-white/35">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, index) => (
              <div
                key={index}
                className={cn(
                  "min-h-20 rounded-lg border border-white/6 p-1.5",
                  cell.day ? "bg-white/[0.02]" : "bg-transparent",
                )}
              >
                {cell.day ? (
                  <>
                    <p className="text-[11px] text-white/40">{cell.day}</p>
                    <div className="mt-1 space-y-1">
                      {cell.tasks.slice(0, 3).map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className="block w-full truncate rounded bg-white/8 px-1 py-0.5 text-left text-[10px] text-white/70 hover:bg-white/12"
                          onClick={() => openEdit(task)}
                        >
                          {task.title}
                        </button>
                      ))}
                      {cell.tasks.length > 3 ? (
                        <p className="text-[10px] text-white/30">
                          +{cell.tasks.length - 3}
                        </p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view === "progress" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: uiZh.wtProgressLabel,
              value: `${progress.percent}%`,
            },
            {
              label: uiZh.wtStatusCompleted,
              value: String(progress.completed),
            },
            {
              label: uiZh.wtOverdue,
              value: String(progress.overdue),
            },
            {
              label: uiZh.wtDueToday,
              value: String(progress.dueToday),
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-5"
            >
              <p className="text-xs text-white/40">{card.label}</p>
              <p className="mt-2 text-2xl font-medium text-white/85">
                {card.value}
              </p>
            </div>
          ))}
          <div className="md:col-span-2 xl:col-span-4 rounded-2xl border border-white/8 p-4">
            <h3 className="mb-3 text-sm text-white/70">{uiZh.wtFilterStatus}</h3>
            <div className="space-y-2">
              {WEDDING_TASK_STATUSES.map((status) => {
                const count = tasks.filter(
                  (t) => !t.archived_at && t.status === status,
                ).length;
                const pct =
                  progress.total === 0
                    ? 0
                    : Math.round((count / Math.max(progress.total, 1)) * 100);
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex justify-between text-xs text-white/50">
                      <span>{formatWeddingTaskStatus(status)}</span>
                      <span>
                        {count} · {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-white/40"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {editor?.task ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center">
          <div className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#171513] p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-medium text-white/90">
                {editor.mode === "create" ? uiZh.wtAddTask : editor.task.title}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditor(null)}
              >
                {uiZh.cancel}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{uiZh.tlActivity}</Label>
                <Input
                  value={editor.task.title ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: { ...editor.task, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{uiZh.description}</Label>
                <Textarea
                  value={editor.task.description ?? ""}
                  disabled={!canWrite}
                  rows={3}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: { ...editor.task, description: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtFilterStatus}</Label>
                <select
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                  value={editor.task.status ?? "todo"}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: {
                        ...editor.task,
                        status: e.target.value as WeddingTaskStatus,
                      },
                    })
                  }
                >
                  {WEDDING_TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatWeddingTaskStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtPriority}</Label>
                <select
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                  value={editor.task.priority ?? "normal"}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: {
                        ...editor.task,
                        priority: e.target
                          .value as WeddingProjectTask["priority"],
                      },
                    })
                  }
                >
                  {WEDDING_TASK_PRIORITIES.map((priority) => (
                    <option key={priority} value={priority}>
                      {formatWeddingTaskPriority(priority)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtStartDate}</Label>
                <Input
                  type="date"
                  value={editor.task.start_date ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: { ...editor.task, start_date: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtDueDate}</Label>
                <Input
                  type="date"
                  value={editor.task.due_date ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: { ...editor.task, due_date: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtAssignee}</Label>
                <Input
                  value={editor.task.assignee_label ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: { ...editor.task, assignee_label: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtCoordinator}</Label>
                <Input
                  value={editor.task.coordinator_label ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: {
                        ...editor.task,
                        coordinator_label: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.client}</Label>
                <select
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                  value={editor.task.client_id ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: {
                        ...editor.task,
                        client_id: e.target.value || null,
                      },
                    })
                  }
                >
                  <option value="">{uiZh.noClient}</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.display_name || client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.tlVendor}</Label>
                <select
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                  value={editor.task.vendor_id ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: {
                        ...editor.task,
                        vendor_id: e.target.value || null,
                      },
                    })
                  }
                >
                  <option value="">{uiZh.emDash}</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtPackage}</Label>
                <Input
                  value={editor.task.package_label ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: { ...editor.task, package_label: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wtReminder}</Label>
                <select
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                  value={editor.task.reminder_minutes ?? ""}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: {
                        ...editor.task,
                        reminder_minutes: e.target.value
                          ? Number(e.target.value)
                          : null,
                      },
                    })
                  }
                >
                  <option value="">{uiZh.emDash}</option>
                  {WEDDING_TASK_REMINDERS.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {reminderLabel(minutes)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{uiZh.wtInternalNotes}</Label>
                <Textarea
                  value={editor.task.internal_notes ?? ""}
                  disabled={!canWrite}
                  rows={3}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      task: { ...editor.task, internal_notes: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            {editor.mode === "edit" && editor.task.id ? (
              <div className="mt-5 space-y-4 border-t border-white/8 pt-4">
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                    {uiZh.wtComments}
                  </h4>
                  <div className="mb-2 max-h-40 space-y-2 overflow-y-auto">
                    {(editor.task.comments ?? []).length === 0 ? (
                      <p className="text-xs text-white/30">{uiZh.emDash}</p>
                    ) : (
                      (editor.task.comments ?? []).map((comment) => (
                        <div
                          key={comment.id}
                          className="rounded-lg border border-white/6 px-3 py-2"
                        >
                          <p className="text-xs text-white/70">{comment.body}</p>
                          <p className="mt-1 text-[10px] text-white/30">
                            {comment.authorLabel} ·{" "}
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  {canWrite ? (
                    <div className="flex gap-2">
                      <Input
                        value={commentDraft}
                        placeholder={uiZh.wtCommentPlaceholder}
                        onChange={(e) => setCommentDraft(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={pending || !commentDraft.trim()}
                        onClick={submitComment}
                      >
                        {uiZh.wtAddComment}
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                    {uiZh.wtAttachments}
                  </h4>
                  <div className="mb-2 space-y-1">
                    {(editor.task.attachments ?? []).map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-lg border border-white/6 px-3 py-2 text-xs text-white/65"
                      >
                        <span>{file.name}</span>
                        {file.url ? (
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-300 hover:underline"
                          >
                            URL
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  {canWrite ? (
                    <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <Input
                        value={attachmentName}
                        placeholder={uiZh.wtAttachmentName}
                        onChange={(e) => setAttachmentName(e.target.value)}
                      />
                      <Input
                        value={attachmentUrl}
                        placeholder={uiZh.wtAttachmentUrl}
                        onChange={(e) => setAttachmentUrl(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={pending || !attachmentName.trim()}
                        onClick={submitAttachment}
                      >
                        {uiZh.wtAddAttachment}
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
                    {uiZh.wtActivityLog}
                  </h4>
                  <div className="max-h-36 space-y-1.5 overflow-y-auto">
                    {(editor.task.activity_log ?? []).map((row) => (
                      <p key={row.id} className="text-[11px] text-white/40">
                        {new Date(row.createdAt).toLocaleString()} ·{" "}
                        {row.message}
                      </p>
                    ))}
                  </div>
                </div>

                {editor.task.client_id || editor.task.vendor_id ? (
                  <p className="text-[11px] text-white/35">
                    {uiZh.client}: {clientName(editor.task.client_id ?? null)} ·{" "}
                    {uiZh.tlVendor}: {vendorName(editor.task.vendor_id ?? null)}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-white/8 pt-4">
              <div className="flex flex-wrap gap-2">
                {canWrite && editor.mode === "edit" && editor.task.id ? (
                  <>
                    {editor.task.status !== "completed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          runItemAction("complete", editor.task!.id!)
                        }
                      >
                        {uiZh.wtComplete}
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        runItemAction("duplicate", editor.task!.id!)
                      }
                    >
                      {uiZh.wtDuplicate}
                    </Button>
                    {editor.task.archived_at ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          runItemAction("restore", editor.task!.id!)
                        }
                      >
                        {uiZh.wtRestore}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending}
                        onClick={() =>
                          runItemAction("archive", editor.task!.id!)
                        }
                      >
                        {uiZh.wtArchive}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        runItemAction("delete", editor.task!.id!)
                      }
                    >
                      {uiZh.delete}
                    </Button>
                  </>
                ) : null}
              </div>
              {canWrite ? (
                <Button size="sm" disabled={pending} onClick={saveEditor}>
                  {uiZh.save}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
