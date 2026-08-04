"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";
import {
  archiveWeddingTimelineItemAction,
  bulkWeddingTimelineAction,
  createWeddingTimelineItemAction,
  deleteWeddingTimelineItemAction,
  duplicateWeddingTimelineItemAction,
  loadWeddingTimelineAction,
  moveWeddingTimelineItemAction,
  reorderWeddingTimelineAction,
  shiftWeddingTimelineItemAction,
  updateWeddingTimelineItemAction,
} from "@/core/actions/wedding-timeline-actions";
import type { Project, Vendor } from "@/core/types";
import {
  WEDDING_TIMELINE_PRIORITIES,
  WEDDING_TIMELINE_REMINDERS,
  WEDDING_TIMELINE_STATUSES,
  type WeddingTimelineView,
} from "@/core/wedding-timeline/constants";
import type { WeddingTimelineItem } from "@/core/wedding-timeline/types";
import {
  formatDuration,
  formatTimeDisplay,
  normalizeTime,
} from "@/core/wedding-timeline/time";
import {
  categoryOptions,
  countdownFromWeddingDate,
  formatTimelineCategory,
  formatTimelinePriority,
  formatTimelineStatus,
  timelineProgress,
} from "@/features/wedding-timeline/lib/labels";
import { cn } from "@/lib/utils";

type WeddingTimelineBuilderProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  vendors: Vendor[];
  canWrite: boolean;
  coupleName?: string | null;
};

type EditorState = {
  mode: "create" | "edit";
  item: Partial<WeddingTimelineItem> | null;
};

const VIEWS: Array<{ id: WeddingTimelineView; label: string; soon?: boolean }> =
  [
    { id: "timeline", label: uiZh.tlViewTimeline },
    { id: "table", label: uiZh.tlViewTable },
    { id: "list", label: uiZh.tlViewList },
    { id: "wedding_day", label: uiZh.tlViewWeddingDay },
    { id: "print", label: uiZh.tlViewPrint },
    { id: "calendar", label: uiZh.tlViewCalendar, soon: true },
    { id: "gantt", label: uiZh.tlViewGantt, soon: true },
  ];

function emptyItem(): Partial<WeddingTimelineItem> {
  return {
    title: "",
    start_time: "",
    end_time: "",
    description: "",
    category: "others",
    location: "",
    status: "not_started",
    priority: "normal",
    pic_label: "",
    coordinator_label: "",
    crew: "",
    vendor_id: null,
    reminder_minutes: null,
    internal_notes: "",
    checklist: [],
  };
}

export function WeddingTimelineBuilder({
  workspaceId,
  companyId,
  project,
  vendors,
  canWrite,
  coupleName,
}: WeddingTimelineBuilderProps) {
  const [items, setItems] = useState<WeddingTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<WeddingTimelineView>("timeline");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [dayIndex, setDayIndex] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const scope = { workspaceId, companyId, projectId: project.id };

  const refresh = useCallback(async () => {
    const result = await loadWeddingTimelineAction(scope);
    if (!result.ok) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    setItems(result.data.items);
    setLoading(false);
  }, [workspaceId, companyId, project.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      const hay = [
        item.title,
        item.description ?? "",
        item.location ?? "",
        item.pic_label ?? "",
        item.coordinator_label ?? "",
        item.crew ?? "",
        formatTimelineCategory(item.category),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, statusFilter, categoryFilter]);

  const progress = timelineProgress(items);
  const weddingDate = project.wedding_date || project.event_date;
  const vendorName = (id: string | null) =>
    vendors.find((v) => v.id === id)?.name ?? uiZh.emDash;

  function openCreate() {
    setEditor({ mode: "create", item: emptyItem() });
  }

  function openEdit(item: WeddingTimelineItem) {
    setEditor({ mode: "edit", item: { ...item } });
  }

  function saveEditor() {
    if (!editor?.item?.title?.trim()) {
      toast.error(uiZh.tlActivity);
      return;
    }
    const draft = editor.item;
    startTransition(async () => {
      if (editor.mode === "create") {
        const result = await createWeddingTimelineItemAction({
          ...scope,
          title: draft.title!.trim(),
          description: draft.description ?? null,
          startTime: normalizeTime(draft.start_time) ,
          endTime: normalizeTime(draft.end_time),
          category: draft.category ?? null,
          location: draft.location ?? null,
          status: draft.status ?? "not_started",
          priority: draft.priority ?? "normal",
          reminderMinutes: draft.reminder_minutes ?? null,
          picLabel: draft.pic_label ?? null,
          vendorId: draft.vendor_id ?? null,
          coordinatorLabel: draft.coordinator_label ?? null,
          crew: draft.crew ?? null,
          internalNotes: draft.internal_notes ?? null,
          checklist: draft.checklist ?? [],
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(uiZh.tlItemCreated);
      } else if (draft.id) {
        const result = await updateWeddingTimelineItemAction({
          ...scope,
          itemId: draft.id,
          title: draft.title!.trim(),
          description: draft.description ?? null,
          startTime: normalizeTime(draft.start_time),
          endTime: normalizeTime(draft.end_time),
          category: draft.category ?? null,
          location: draft.location ?? null,
          status: draft.status ?? "not_started",
          priority: draft.priority ?? "normal",
          reminderMinutes: draft.reminder_minutes ?? null,
          picLabel: draft.pic_label ?? null,
          vendorId: draft.vendor_id ?? null,
          coordinatorLabel: draft.coordinator_label ?? null,
          crew: draft.crew ?? null,
          internalNotes: draft.internal_notes ?? null,
          checklist: draft.checklist ?? [],
          assignments: draft.assignments ?? [],
          attachments: draft.attachments ?? [],
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(uiZh.tlItemSaved);
      }
      setEditor(null);
      await refresh();
    });
  }

  function runItemAction(
    action: "duplicate" | "archive" | "delete" | "up" | "down",
    itemId: string,
  ) {
    startTransition(async () => {
      let result;
      if (action === "duplicate") {
        result = await duplicateWeddingTimelineItemAction({
          ...scope,
          itemId,
        });
      } else if (action === "archive") {
        result = await archiveWeddingTimelineItemAction({ ...scope, itemId });
      } else if (action === "delete") {
        result = await deleteWeddingTimelineItemAction({ ...scope, itemId });
      } else {
        result = await moveWeddingTimelineItemAction({
          ...scope,
          itemId,
          direction: action,
        });
      }
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (action === "delete") toast.success(uiZh.tlItemDeleted);
      await refresh();
    });
  }

  function onDropReorder(targetId: string) {
    if (!dragId || dragId === targetId || !canWrite) {
      setDragId(null);
      return;
    }
    const ordered = [...items];
    const from = ordered.findIndex((row) => row.id === dragId);
    const to = ordered.findIndex((row) => row.id === targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved!);
    setItems(ordered);
    setDragId(null);
    startTransition(async () => {
      const result = await reorderWeddingTimelineAction({
        ...scope,
        orderedIds: ordered.map((row) => row.id),
      });
      if (!result.ok) {
        toast.error(result.error);
        await refresh();
        return;
      }
      setItems(result.data.items);
    });
  }

  function shiftStart(item: WeddingTimelineItem, newStart: string) {
    const mode = window.confirm(
      `${uiZh.tlShiftFollowing}?\n\nOK = ${uiZh.tlShiftFollowing}\nCancel = ${uiZh.tlItemOnly}`,
    )
      ? "shift_following"
      : "item_only";
    startTransition(async () => {
      const result = await shiftWeddingTimelineItemAction({
        ...scope,
        itemId: item.id,
        newStartTime: newStart,
        mode,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setItems(result.data.items);
    });
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulk(action: "archive" | "delete" | "status", status?: string) {
    if (selected.size === 0) return;
    startTransition(async () => {
      const result = await bulkWeddingTimelineAction({
        ...scope,
        itemIds: Array.from(selected),
        action,
        status: status as WeddingTimelineItem["status"] | undefined,
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setSelected(new Set());
      await refresh();
    });
  }

  const dayItems = filtered;
  const current = dayItems[dayIndex] ?? null;
  const next = dayItems[dayIndex + 1] ?? null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.08] px-5 py-10 text-sm text-white/45">
        {uiZh.loading}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/35">
              {uiZh.timelineBuilder}
            </p>
            <h2 className="mt-1 text-xl font-medium tracking-tight text-white">
              {coupleName || project.name}
            </h2>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
              <span>
                {uiZh.weddingDate}: {weddingDate || uiZh.emDash}
              </span>
              <span>
                {uiZh.countdown}: {countdownFromWeddingDate(weddingDate)}
              </span>
              <span>
                {uiZh.venue}: {project.venue || uiZh.emDash}
              </span>
              <span>
                {uiZh.weddingSession}: {project.session || uiZh.emDash}
              </span>
              <span>
                {uiZh.status}: {project.status}
              </span>
              <span>
                {uiZh.tlProgress}: {progress}%
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-white/50"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canWrite ? (
              <Button type="button" onClick={openCreate} disabled={pending}>
                {uiZh.tlAddItem}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.message(uiZh.tlComingSoonAction)}
            >
              {uiZh.tlImport}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const payload = JSON.stringify(items, null, 2);
                void navigator.clipboard.writeText(payload);
                toast.success(uiZh.tlExport);
              }}
            >
              {uiZh.tlExport}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setView("print");
                window.print();
              }}
            >
              {uiZh.tlGeneratePdf}
            </Button>
          </div>
        </div>
      </section>

      {/* Views + filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1.5">
          {VIEWS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              disabled={tab.soon}
              onClick={() => setView(tab.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition",
                view === tab.id
                  ? "bg-white text-black"
                  : "border border-white/10 text-white/55 hover:text-white/80",
                tab.soon && "opacity-40",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={uiZh.tlSearch}
            className="h-9 max-w-xs border-white/[0.08] bg-white/[0.03]"
          />
          <select
            className="h-9 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white/80"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">{uiZh.filterAllStatuses}</option>
            {WEDDING_TIMELINE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatTimelineStatus(status)}
              </option>
            ))}
          </select>
          <select
            className="h-9 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-sm text-white/80"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">{uiZh.filterAllTypes}</option>
            {categoryOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {selected.size > 0 && canWrite ? (
            <div className="flex flex-wrap gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => bulk("status", "completed")}
              >
                {uiZh.tlComplete}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => bulk("archive")}
              >
                {uiZh.archive}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => bulk("delete")}
              >
                {uiZh.delete}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.1] px-5 py-12 text-center">
          <p className="text-sm text-white/70">{uiZh.tlEmpty}</p>
          <p className="mt-2 text-xs text-white/40">{uiZh.tlEmptyHint}</p>
          {canWrite ? (
            <Button type="button" className="mt-5" onClick={openCreate}>
              {uiZh.tlAddItem}
            </Button>
          ) : null}
        </div>
      ) : null}

      {/* Timeline / List / Table */}
      {filtered.length > 0 &&
      (view === "timeline" || view === "list" || view === "table") ? (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-white/[0.08]",
            view === "table" && "overflow-x-auto",
          )}
        >
          {view === "table" ? (
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-white/[0.08] text-[11px] uppercase tracking-[0.08em] text-white/40">
                <tr>
                  <th className="px-3 py-3" />
                  <th className="px-3 py-3">{uiZh.tlStartTime}</th>
                  <th className="px-3 py-3">{uiZh.tlEndTime}</th>
                  <th className="px-3 py-3">{uiZh.tlDuration}</th>
                  <th className="px-3 py-3">{uiZh.tlActivity}</th>
                  <th className="px-3 py-3">{uiZh.tlCategory}</th>
                  <th className="px-3 py-3">{uiZh.tlLocation}</th>
                  <th className="px-3 py-3">{uiZh.tlPic}</th>
                  <th className="px-3 py-3">{uiZh.status}</th>
                  <th className="px-3 py-3">{uiZh.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    view="table"
                    canWrite={canWrite}
                    selected={selected.has(item.id)}
                    vendorLabel={vendorName(item.vendor_id)}
                    onSelect={() => toggleSelect(item.id)}
                    onEdit={() => openEdit(item)}
                    onAction={runItemAction}
                    onDragStart={() => setDragId(item.id)}
                    onDrop={() => onDropReorder(item.id)}
                    onShiftStart={(value) => shiftStart(item, value)}
                  />
                ))}
              </tbody>
            </table>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {filtered.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  view={view}
                  canWrite={canWrite}
                  selected={selected.has(item.id)}
                  vendorLabel={vendorName(item.vendor_id)}
                  onSelect={() => toggleSelect(item.id)}
                  onEdit={() => openEdit(item)}
                  onAction={runItemAction}
                  onDragStart={() => setDragId(item.id)}
                  onDrop={() => onDropReorder(item.id)}
                  onShiftStart={(value) => shiftStart(item, value)}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}

      {/* Wedding Day Mode */}
      {view === "wedding_day" && current ? (
        <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 sm:p-8">
          <div className="flex items-center justify-between text-xs text-white/45">
            <span>
              {new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span>
              {dayIndex + 1} / {dayItems.length}
            </span>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/20 p-6 sm:p-10">
            <p className="text-xs uppercase tracking-[0.16em] text-white/40">
              {uiZh.tlCurrentActivity}
            </p>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {current.title}
            </h3>
            <p className="mt-3 text-lg text-white/60">
              {formatTimeDisplay(current.start_time)} –{" "}
              {formatTimeDisplay(current.end_time)}
              {" · "}
              {formatDuration(current.start_time, current.end_time)}
            </p>
            <div className="mt-6 grid gap-3 text-sm text-white/70 sm:grid-cols-2">
              <p>
                {uiZh.tlLocation}: {current.location || uiZh.emDash}
              </p>
              <p>
                {uiZh.tlPic}: {current.pic_label || uiZh.emDash}
              </p>
              <p>
                {uiZh.tlVendor}: {vendorName(current.vendor_id)}
              </p>
              <p>
                {uiZh.tlCoordinator}:{" "}
                {current.coordinator_label || uiZh.emDash}
              </p>
            </div>
            {current.description ? (
              <p className="mt-5 whitespace-pre-wrap text-sm text-white/55">
                {current.description}
              </p>
            ) : null}
            {current.internal_notes ? (
              <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-100/80">
                {current.internal_notes}
              </p>
            ) : null}
          </div>
          {next ? (
            <div className="rounded-2xl border border-white/[0.08] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-white/35">
                {uiZh.tlNextActivity}
              </p>
              <p className="mt-1 text-base text-white/80">
                {formatTimeDisplay(next.start_time)} · {next.title}
              </p>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Button
              type="button"
              variant="outline"
              className="h-14 text-base"
              disabled={dayIndex === 0}
              onClick={() => setDayIndex((v) => Math.max(0, v - 1))}
            >
              {uiZh.tlPrevious}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-14 text-base"
              disabled={dayIndex >= dayItems.length - 1}
              onClick={() =>
                setDayIndex((v) => Math.min(dayItems.length - 1, v + 1))
              }
            >
              {uiZh.tlNext}
            </Button>
            {canWrite ? (
              <>
                <Button
                  type="button"
                  className="h-14 text-base"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await updateWeddingTimelineItemAction({
                        ...scope,
                        itemId: current.id,
                        title: current.title,
                        status: "completed",
                        startTime: current.start_time,
                        endTime: current.end_time,
                        description: current.description,
                        category: current.category,
                        location: current.location,
                        priority: current.priority,
                        reminderMinutes: current.reminder_minutes,
                        picLabel: current.pic_label,
                        vendorId: current.vendor_id,
                        coordinatorLabel: current.coordinator_label,
                        crew: current.crew,
                        internalNotes: current.internal_notes,
                        checklist: current.checklist,
                        assignments: current.assignments,
                        attachments: current.attachments,
                      });
                      await refresh();
                      setDayIndex((v) =>
                        Math.min(dayItems.length - 1, v + 1),
                      );
                    });
                  }}
                >
                  {uiZh.tlComplete}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 text-base"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      await updateWeddingTimelineItemAction({
                        ...scope,
                        itemId: current.id,
                        title: current.title,
                        status: "delayed",
                        startTime: current.start_time,
                        endTime: current.end_time,
                        description: current.description,
                        category: current.category,
                        location: current.location,
                        priority: current.priority,
                        reminderMinutes: current.reminder_minutes,
                        picLabel: current.pic_label,
                        vendorId: current.vendor_id,
                        coordinatorLabel: current.coordinator_label,
                        crew: current.crew,
                        internalNotes: current.internal_notes,
                        checklist: current.checklist,
                        assignments: current.assignments,
                        attachments: current.attachments,
                      });
                      await refresh();
                    });
                  }}
                >
                  {uiZh.tlDelay}
                </Button>
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Print Preview */}
      {view === "print" && filtered.length > 0 ? (
        <section className="print-timeline space-y-4 rounded-2xl border border-white/[0.08] bg-white px-6 py-6 text-black">
          <div className="border-b border-black/10 pb-4">
            <p className="text-xs uppercase tracking-[0.14em] text-black/45">
              {uiZh.tlPrintMaster}
            </p>
            <h3 className="mt-1 text-2xl font-semibold">
              {coupleName || project.name}
            </h3>
            <p className="mt-1 text-sm text-black/55">
              {[weddingDate, project.venue, project.session]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/20 text-left text-xs uppercase tracking-wide text-black/50">
                <th className="py-2 pr-3">{uiZh.tlStartTime}</th>
                <th className="py-2 pr-3">{uiZh.tlEndTime}</th>
                <th className="py-2 pr-3">{uiZh.tlActivity}</th>
                <th className="py-2 pr-3">{uiZh.tlLocation}</th>
                <th className="py-2">{uiZh.tlPic}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-black/5">
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {formatTimeDisplay(item.start_time)}
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">
                    {formatTimeDisplay(item.end_time)}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="font-medium">{item.title}</div>
                    {item.description ? (
                      <div className="mt-0.5 text-xs text-black/55">
                        {item.description}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2.5 pr-3">{item.location || "—"}</td>
                  <td className="py-2.5">{item.pic_label || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="pt-2 text-[10px] text-black/40">
            {uiZh.tlPrintCoordinator} · {uiZh.tlPrintMc} · {uiZh.tlPrintVendor}{" "}
            — {uiZh.tlComingSoonAction}
          </p>
        </section>
      ) : null}

      {/* Editor dialog */}
      {editor ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-white/10 bg-[#121214] p-5 shadow-2xl">
            <h3 className="text-lg font-medium text-white">
              {editor.mode === "create" ? uiZh.tlAddItem : uiZh.edit}
            </h3>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label>{uiZh.tlActivity}</Label>
                <Input
                  value={editor.item?.title ?? ""}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      item: { ...editor.item, title: e.target.value },
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{uiZh.tlStartTime}</Label>
                  <Input
                    type="time"
                    value={(editor.item?.start_time ?? "").slice(0, 5)}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: { ...editor.item, start_time: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{uiZh.tlEndTime}</Label>
                  <Input
                    type="time"
                    value={(editor.item?.end_time ?? "").slice(0, 5)}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: { ...editor.item, end_time: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.description}</Label>
                <Textarea
                  value={editor.item?.description ?? ""}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      item: { ...editor.item, description: e.target.value },
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{uiZh.tlCategory}</Label>
                  <select
                    className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-sm"
                    value={editor.item?.category ?? "others"}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: { ...editor.item, category: e.target.value },
                      })
                    }
                  >
                    {categoryOptions().map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{uiZh.tlLocation}</Label>
                  <Input
                    value={editor.item?.location ?? ""}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: { ...editor.item, location: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{uiZh.status}</Label>
                  <select
                    className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-sm"
                    value={editor.item?.status ?? "not_started"}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: {
                          ...editor.item,
                          status: e.target
                            .value as WeddingTimelineItem["status"],
                        },
                      })
                    }
                  >
                    {WEDDING_TIMELINE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {formatTimelineStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{uiZh.tlPriority}</Label>
                  <select
                    className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-sm"
                    value={editor.item?.priority ?? "normal"}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: {
                          ...editor.item,
                          priority: e.target
                            .value as WeddingTimelineItem["priority"],
                        },
                      })
                    }
                  >
                    {WEDDING_TIMELINE_PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {formatTimelinePriority(priority)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{uiZh.tlPic}</Label>
                  <Input
                    value={editor.item?.pic_label ?? ""}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: { ...editor.item, pic_label: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{uiZh.tlCoordinator}</Label>
                  <Input
                    value={editor.item?.coordinator_label ?? ""}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: {
                          ...editor.item,
                          coordinator_label: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{uiZh.tlVendor}</Label>
                  <select
                    className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-sm"
                    value={editor.item?.vendor_id ?? ""}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: {
                          ...editor.item,
                          vendor_id: e.target.value || null,
                        },
                      })
                    }
                  >
                    <option value="">{uiZh.none}</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{uiZh.tlReminder}</Label>
                  <select
                    className="h-9 w-full rounded-md border border-white/10 bg-white/5 px-2 text-sm"
                    value={editor.item?.reminder_minutes ?? ""}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        item: {
                          ...editor.item,
                          reminder_minutes: e.target.value
                            ? Number(e.target.value)
                            : null,
                        },
                      })
                    }
                  >
                    <option value="">{uiZh.none}</option>
                    {WEDDING_TIMELINE_REMINDERS.map((mins) => (
                      <option key={mins} value={mins}>
                        {mins} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.tlCrew}</Label>
                <Input
                  value={editor.item?.crew ?? ""}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      item: { ...editor.item, crew: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.tlInternalNotes}</Label>
                <Textarea
                  value={editor.item?.internal_notes ?? ""}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      item: { ...editor.item, internal_notes: e.target.value },
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.tlChecklist}</Label>
                <Textarea
                  placeholder={"Band arrived\nSound check\nBride ready"}
                  value={(editor.item?.checklist ?? [])
                    .map((row) => row.label)
                    .join("\n")}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      item: {
                        ...editor.item,
                        checklist: e.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .map((label) => ({
                            id: crypto.randomUUID(),
                            label,
                            done: false,
                          })),
                      },
                    })
                  }
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditor(null)}
              >
                {uiZh.cancel}
              </Button>
              <Button type="button" onClick={saveEditor} disabled={pending}>
                {uiZh.save}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ItemRowProps = {
  item: WeddingTimelineItem;
  view: "timeline" | "list" | "table";
  canWrite: boolean;
  selected: boolean;
  vendorLabel: string;
  onSelect: () => void;
  onEdit: () => void;
  onAction: (
    action: "duplicate" | "archive" | "delete" | "up" | "down",
    itemId: string,
  ) => void;
  onDragStart: () => void;
  onDrop: () => void;
  onShiftStart: (value: string) => void;
};

function ItemRow({
  item,
  view,
  canWrite,
  selected,
  vendorLabel,
  onSelect,
  onEdit,
  onAction,
  onDragStart,
  onDrop,
  onShiftStart,
}: ItemRowProps) {
  if (view === "table") {
    return (
      <tr
        className="border-b border-white/[0.05] text-white/75"
        draggable={canWrite}
        onDragStart={onDragStart}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
      >
        <td className="px-3 py-3">
          <input type="checkbox" checked={selected} onChange={onSelect} />
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {canWrite ? (
            <input
              type="time"
              className="rounded border border-white/10 bg-transparent px-1 text-sm"
              value={(item.start_time ?? "").slice(0, 5)}
              onChange={(e) => {
                if (e.target.value) onShiftStart(e.target.value);
              }}
            />
          ) : (
            formatTimeDisplay(item.start_time)
          )}
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {formatTimeDisplay(item.end_time)}
        </td>
        <td className="px-3 py-3 whitespace-nowrap">
          {formatDuration(item.start_time, item.end_time)}
        </td>
        <td className="px-3 py-3">
          <button type="button" className="text-left hover:underline" onClick={onEdit}>
            {item.title}
          </button>
        </td>
        <td className="px-3 py-3">{formatTimelineCategory(item.category)}</td>
        <td className="px-3 py-3">{item.location || uiZh.emDash}</td>
        <td className="px-3 py-3">{item.pic_label || uiZh.emDash}</td>
        <td className="px-3 py-3">{formatTimelineStatus(item.status)}</td>
        <td className="px-3 py-3">
          {canWrite ? (
            <div className="flex gap-1 text-xs">
              <button type="button" onClick={() => onAction("up", item.id)}>
                ↑
              </button>
              <button type="button" onClick={() => onAction("down", item.id)}>
                ↓
              </button>
              <button type="button" onClick={() => onAction("duplicate", item.id)}>
                {uiZh.tlDuplicate}
              </button>
              <button type="button" onClick={() => onAction("archive", item.id)}>
                {uiZh.archive}
              </button>
              <button type="button" onClick={() => onAction("delete", item.id)}>
                {uiZh.delete}
              </button>
            </div>
          ) : null}
        </td>
      </tr>
    );
  }

  return (
    <li
      className={cn(
        "flex gap-3 px-4 py-4 transition hover:bg-white/[0.02]",
        view === "timeline" && "items-stretch",
      )}
      draggable={canWrite}
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <input
        type="checkbox"
        className="mt-1"
        checked={selected}
        onChange={onSelect}
      />
      {view === "timeline" ? (
        <div className="flex w-16 shrink-0 flex-col items-center">
          <span className="text-sm font-medium text-white/85">
            {formatTimeDisplay(item.start_time)}
          </span>
          <span className="mt-1 h-full w-px bg-white/15" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="text-left text-sm font-medium text-white/90 hover:underline"
          >
            {item.title}
          </button>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/45">
            {formatTimelineStatus(item.status)}
          </span>
        </div>
        <p className="mt-1 text-xs text-white/45">
          {[
            view === "list"
              ? `${formatTimeDisplay(item.start_time)} – ${formatTimeDisplay(item.end_time)}`
              : formatDuration(item.start_time, item.end_time),
            formatTimelineCategory(item.category),
            item.location,
            item.pic_label,
            vendorLabel !== uiZh.emDash ? vendorLabel : null,
            formatTimelinePriority(item.priority),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {item.description ? (
          <p className="mt-2 line-clamp-2 text-xs text-white/40">
            {item.description}
          </p>
        ) : null}
        {item.checklist.length > 0 ? (
          <ul className="mt-2 space-y-0.5 text-xs text-white/40">
            {item.checklist.slice(0, 4).map((row) => (
              <li key={row.id}>
                {row.done ? "✓" : "○"} {row.label}
              </li>
            ))}
          </ul>
        ) : null}
        {canWrite ? (
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/40">
            <button type="button" onClick={() => onAction("up", item.id)}>
              {uiZh.tlMoveUp}
            </button>
            <button type="button" onClick={() => onAction("down", item.id)}>
              {uiZh.tlMoveDown}
            </button>
            <button type="button" onClick={() => onAction("duplicate", item.id)}>
              {uiZh.tlDuplicate}
            </button>
            <button type="button" onClick={() => onAction("archive", item.id)}>
              {uiZh.archive}
            </button>
            <button type="button" onClick={() => onAction("delete", item.id)}>
              {uiZh.delete}
            </button>
          </div>
        ) : null}
      </div>
    </li>
  );
}
