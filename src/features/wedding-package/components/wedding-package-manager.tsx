"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";
import {
  archiveWeddingPackageAction,
  createWeddingPackageAction,
  deleteWeddingPackageAction,
  duplicateWeddingPackageAction,
  loadWeddingPackagesAction,
  restoreWeddingPackageAction,
  updateWeddingPackageAction,
} from "@/core/actions/wedding-package-actions";
import type { Project, Vendor } from "@/core/types";
import {
  WEDDING_PACKAGE_CURRENCIES,
  WEDDING_PACKAGE_STATUSES,
  type WeddingPackageStatus,
} from "@/core/wedding-package/constants";
import type { WeddingProjectPackageWithItems } from "@/core/wedding-package/types";
import { summarizeWeddingPackages } from "@/core/wedding-package/value";
import {
  formatMoney,
  formatPackageStatus,
  packageLineTotal,
  packageStatusTone,
  packageValue,
} from "@/features/wedding-package/lib/labels";
import { cn } from "@/lib/utils";

type WeddingPackageManagerProps = {
  workspaceId: string;
  companyId: string;
  project: Project;
  vendors: Vendor[];
  canWrite: boolean;
};

type DraftItem = {
  key: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unitOfMeasure: string;
  category: string;
  vendorId: string;
  isIncluded: boolean;
};

type EditorState = {
  mode: "create" | "edit";
  packageId?: string;
  name: string;
  description: string;
  currency: string;
  status: WeddingPackageStatus;
  notes: string;
  items: DraftItem[];
};

function newItemDraft(): DraftItem {
  return {
    key: crypto.randomUUID(),
    title: "",
    description: "",
    quantity: 1,
    unitPrice: 0,
    unitOfMeasure: "",
    category: "",
    vendorId: "",
    isIncluded: true,
  };
}

function emptyEditor(project: Project): EditorState {
  return {
    mode: "create",
    name: project.package_name?.trim() || "",
    description: "",
    currency: "MYR",
    status: "draft",
    notes: "",
    items: [newItemDraft()],
  };
}

function fromPackage(pkg: WeddingProjectPackageWithItems): EditorState {
  return {
    mode: "edit",
    packageId: pkg.id,
    name: pkg.name,
    description: pkg.description ?? "",
    currency: pkg.currency,
    status: pkg.status,
    notes: pkg.notes ?? "",
    items:
      pkg.items.length > 0
        ? pkg.items.map((item) => ({
            key: item.id,
            title: item.title,
            description: item.description ?? "",
            quantity: item.quantity,
            unitPrice: item.unit_price,
            unitOfMeasure: item.unit_of_measure ?? "",
            category: item.category ?? "",
            vendorId: item.vendor_id ?? "",
            isIncluded: item.is_included,
          }))
        : [newItemDraft()],
  };
}

export function WeddingPackageManager({
  workspaceId,
  companyId,
  project,
  vendors,
  canWrite,
}: WeddingPackageManagerProps) {
  const [packages, setPackages] = useState<WeddingProjectPackageWithItems[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [pending, startTransition] = useTransition();
  const scope = useMemo(
    () => ({ workspaceId, companyId, projectId: project.id }),
    [workspaceId, companyId, project.id],
  );

  const refresh = useCallback(async () => {
    const result = await loadWeddingPackagesAction({
      ...scope,
      includeArchived: showArchived,
    });
    if (!result.ok) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    setPackages(result.data.packages);
    setLoading(false);
  }, [scope, showArchived]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return packages.filter((pkg) => {
      if (!showArchived && pkg.archived_at) return false;
      if (statusFilter !== "all" && pkg.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        pkg.name,
        pkg.description ?? "",
        pkg.notes ?? "",
        ...pkg.items.map((item) => item.title),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [packages, query, statusFilter, showArchived]);

  const summary = useMemo(
    () => summarizeWeddingPackages(packages),
    [packages],
  );

  const draftTotal = useMemo(() => {
    if (!editor) return 0;
    return editor.items
      .filter((item) => item.isIncluded && item.title.trim())
      .reduce(
        (sum, item) => sum + packageLineTotal(item.quantity, item.unitPrice),
        0,
      );
  }, [editor]);

  function openCreate() {
    setEditor(emptyEditor(project));
  }

  function openEdit(pkg: WeddingProjectPackageWithItems) {
    setEditor(fromPackage(pkg));
  }

  function saveEditor() {
    if (!editor?.name.trim()) {
      toast.error(uiZh.wpNameRequired);
      return;
    }
    const items = editor.items
      .filter((item) => item.title.trim())
      .map((item, index) => ({
        title: item.title.trim(),
        description: item.description.trim() || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitOfMeasure: item.unitOfMeasure.trim() || null,
        category: item.category.trim() || null,
        vendorId: item.vendorId || null,
        isIncluded: item.isIncluded,
        position: index,
      }));

    startTransition(async () => {
      if (editor.mode === "create") {
        const result = await createWeddingPackageAction({
          ...scope,
          name: editor.name.trim(),
          description: editor.description.trim() || null,
          currency: editor.currency as (typeof WEDDING_PACKAGE_CURRENCIES)[number],
          status: editor.status,
          notes: editor.notes.trim() || null,
          items,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(uiZh.wpCreated);
      } else if (editor.packageId) {
        const result = await updateWeddingPackageAction({
          ...scope,
          packageId: editor.packageId,
          name: editor.name.trim(),
          description: editor.description.trim() || null,
          currency: editor.currency as (typeof WEDDING_PACKAGE_CURRENCIES)[number],
          status: editor.status,
          notes: editor.notes.trim() || null,
          items,
        });
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success(uiZh.wpSaved);
      }
      setEditor(null);
      await refresh();
    });
  }

  function runAction(
    action: "duplicate" | "archive" | "restore" | "delete",
    packageId: string,
  ) {
    startTransition(async () => {
      let result;
      if (action === "duplicate") {
        result = await duplicateWeddingPackageAction({ ...scope, packageId });
      } else if (action === "archive") {
        result = await archiveWeddingPackageAction({ ...scope, packageId });
      } else if (action === "restore") {
        result = await restoreWeddingPackageAction({ ...scope, packageId });
      } else {
        result = await deleteWeddingPackageAction({ ...scope, packageId });
      }
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (action === "delete") toast.success(uiZh.wpDeleted);
      if (action === "duplicate") toast.success(uiZh.wpDuplicated);
      if (action === "archive") toast.success(uiZh.wpArchived);
      if (editor?.packageId === packageId && action === "delete") {
        setEditor(null);
      }
      await refresh();
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-medium tracking-tight text-white/90">
            {uiZh.wpManager}
          </h2>
          <p className="text-sm text-white/45">
            {uiZh.wpSummaryHint} · {summary.packageCount} {uiZh.wpPackages} ·{" "}
            {summary.itemCount} {uiZh.wpItems}
          </p>
        </div>
        {canWrite ? (
          <Button type="button" size="sm" onClick={openCreate}>
            {uiZh.wpAddPackage}
          </Button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: uiZh.wpPackageCount,
            value: String(summary.packageCount),
          },
          {
            label: uiZh.wpItemCount,
            value: String(summary.itemCount),
          },
          {
            label: uiZh.wpTotalValue,
            value: formatMoney(summary.totalValue, summary.currency),
          },
          {
            label: uiZh.wpConfirmedValue,
            value: formatMoney(summary.confirmedValue, summary.currency),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-4"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/35">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-medium text-white/85">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={uiZh.wpSearch}
          className="sm:max-w-xs"
        />
        <select
          className="h-9 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white/80"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">
            {uiZh.status}: {uiZh.wtAll}
          </option>
          {WEDDING_PACKAGE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatPackageStatus(status)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs text-white/50">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          {uiZh.wpShowArchived}
        </label>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/8 px-4 py-10 text-center text-sm text-white/40">
          …
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center">
          <p className="text-sm text-white/70">{uiZh.wpEmpty}</p>
          <p className="mt-1 text-xs text-white/40">{uiZh.wpEmptyHint}</p>
          {canWrite ? (
            <Button className="mt-4" size="sm" onClick={openCreate}>
              {uiZh.wpAddPackage}
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pkg) => {
            const value = packageValue(pkg);
            return (
              <div
                key={pkg.id}
                className={cn(
                  "rounded-2xl border border-white/8 bg-white/[0.02] p-4 sm:p-5",
                  pkg.archived_at && "opacity-55",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="text-left text-base font-medium text-white/90 hover:text-white"
                        onClick={() => openEdit(pkg)}
                      >
                        {pkg.name}
                      </button>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px]",
                          packageStatusTone(pkg.status),
                        )}
                      >
                        {formatPackageStatus(pkg.status)}
                      </span>
                    </div>
                    {pkg.description ? (
                      <p className="line-clamp-2 text-sm text-white/45">
                        {pkg.description}
                      </p>
                    ) : null}
                    <p className="text-xs text-white/40">
                      {pkg.items.length} {uiZh.wpItems} ·{" "}
                      {formatMoney(value, pkg.currency)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEdit(pkg)}
                    >
                      {uiZh.edit}
                    </Button>
                    {canWrite ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() => runAction("duplicate", pkg.id)}
                        >
                          {uiZh.wtDuplicate}
                        </Button>
                        {pkg.archived_at ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => runAction("restore", pkg.id)}
                          >
                            {uiZh.wtRestore}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={pending}
                            onClick={() => runAction("archive", pkg.id)}
                          >
                            {uiZh.wtArchive}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={pending}
                          onClick={() => runAction("delete", pkg.id)}
                        >
                          {uiZh.delete}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>

                {pkg.items.length > 0 ? (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-white/6">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-white/[0.03] text-[11px] text-white/40">
                        <tr>
                          <th className="px-3 py-2 font-medium">
                            {uiZh.wpItemTitle}
                          </th>
                          <th className="px-3 py-2 font-medium">
                            {uiZh.wpQty}
                          </th>
                          <th className="px-3 py-2 font-medium">
                            {uiZh.wpUnitPrice}
                          </th>
                          <th className="px-3 py-2 font-medium">
                            {uiZh.wpLineTotal}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pkg.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-white/6 text-white/70"
                          >
                            <td className="px-3 py-2">
                              <span
                                className={cn(
                                  !item.is_included && "text-white/35 line-through",
                                )}
                              >
                                {item.title}
                              </span>
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {item.quantity}
                              {item.unit_of_measure
                                ? ` ${item.unit_of_measure}`
                                : ""}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatMoney(item.unit_price, pkg.currency)}
                            </td>
                            <td className="px-3 py-2 tabular-nums">
                              {formatMoney(
                                packageLineTotal(
                                  item.quantity,
                                  item.unit_price,
                                ),
                                pkg.currency,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {editor ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center">
          <div className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#171513] p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h3 className="text-base font-medium text-white/90">
                {editor.mode === "create"
                  ? uiZh.wpAddPackage
                  : uiZh.wpEditPackage}
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
                <Label>{uiZh.wpName}</Label>
                <Input
                  value={editor.name}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({ ...editor, name: e.target.value })
                  }
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{uiZh.description}</Label>
                <Textarea
                  rows={3}
                  value={editor.description}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({ ...editor, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.status}</Label>
                <select
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                  value={editor.status}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({
                      ...editor,
                      status: e.target.value as WeddingPackageStatus,
                    })
                  }
                >
                  {WEDDING_PACKAGE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {formatPackageStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{uiZh.wpCurrency}</Label>
                <select
                  className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                  value={editor.currency}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({ ...editor, currency: e.target.value })
                  }
                >
                  {WEDDING_PACKAGE_CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label>{uiZh.wpNotes}</Label>
                <Textarea
                  rows={2}
                  value={editor.notes}
                  disabled={!canWrite}
                  onChange={(e) =>
                    setEditor({ ...editor, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-white/8 pt-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-medium uppercase tracking-wide text-white/40">
                  {uiZh.wpItems}
                </h4>
                {canWrite ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditor({
                        ...editor,
                        items: [...editor.items, newItemDraft()],
                      })
                    }
                  >
                    {uiZh.wpAddItem}
                  </Button>
                ) : null}
              </div>

              <div className="space-y-3">
                {editor.items.map((item, index) => (
                  <div
                    key={item.key}
                    className="rounded-xl border border-white/8 bg-black/20 p-3"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="sm:col-span-2 space-y-1">
                        <Label>{uiZh.wpItemTitle}</Label>
                        <Input
                          value={item.title}
                          disabled={!canWrite}
                          onChange={(e) => {
                            const items = [...editor.items];
                            items[index] = {
                              ...item,
                              title: e.target.value,
                            };
                            setEditor({ ...editor, items });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{uiZh.wpQty}</Label>
                        <Input
                          type="number"
                          min={0.0001}
                          step="any"
                          value={item.quantity}
                          disabled={!canWrite}
                          onChange={(e) => {
                            const items = [...editor.items];
                            items[index] = {
                              ...item,
                              quantity: Number(e.target.value) || 0,
                            };
                            setEditor({ ...editor, items });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{uiZh.wpUnitPrice}</Label>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          disabled={!canWrite}
                          onChange={(e) => {
                            const items = [...editor.items];
                            items[index] = {
                              ...item,
                              unitPrice: Number(e.target.value) || 0,
                            };
                            setEditor({ ...editor, items });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{uiZh.wpUnit}</Label>
                        <Input
                          value={item.unitOfMeasure}
                          disabled={!canWrite}
                          onChange={(e) => {
                            const items = [...editor.items];
                            items[index] = {
                              ...item,
                              unitOfMeasure: e.target.value,
                            };
                            setEditor({ ...editor, items });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{uiZh.tlVendor}</Label>
                        <select
                          className="h-9 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-sm"
                          value={item.vendorId}
                          disabled={!canWrite}
                          onChange={(e) => {
                            const items = [...editor.items];
                            items[index] = {
                              ...item,
                              vendorId: e.target.value,
                            };
                            setEditor({ ...editor, items });
                          }}
                        >
                          <option value="">{uiZh.emDash}</option>
                          {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.id}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-xs text-white/50">
                          <input
                            type="checkbox"
                            checked={item.isIncluded}
                            disabled={!canWrite}
                            onChange={(e) => {
                              const items = [...editor.items];
                              items[index] = {
                                ...item,
                                isIncluded: e.target.checked,
                              };
                              setEditor({ ...editor, items });
                            }}
                          />
                          {uiZh.wpIncluded}
                        </label>
                        <p className="text-xs text-white/45">
                          {uiZh.wpLineTotal}:{" "}
                          {formatMoney(
                            packageLineTotal(item.quantity, item.unitPrice),
                            editor.currency,
                          )}
                        </p>
                        {canWrite && editor.items.length > 1 ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setEditor({
                                ...editor,
                                items: editor.items.filter(
                                  (_, i) => i !== index,
                                ),
                              })
                            }
                          >
                            {uiZh.wpRemoveItem}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-right text-sm text-white/70">
                {uiZh.wpTotalValue}: {formatMoney(draftTotal, editor.currency)}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-white/8 pt-4">
              <div className="flex flex-wrap gap-2">
                {canWrite &&
                editor.mode === "edit" &&
                editor.packageId ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        runAction("duplicate", editor.packageId!)
                      }
                    >
                      {uiZh.wtDuplicate}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() => runAction("delete", editor.packageId!)}
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
