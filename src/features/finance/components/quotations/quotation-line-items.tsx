"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uiZh } from "@/config/ui-zh";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import {
  formatFinanceMoney,
  quotationStatusLabel,
} from "@/features/finance/lib/finance-labels";
import type { QuotationStatus } from "@/core/finance";

type QuotationStatusBadgeProps = {
  status: QuotationStatus;
};

export function QuotationStatusBadge({ status }: QuotationStatusBadgeProps) {
  return (
    <span className="rounded-full border border-white/15 px-2.5 py-1 text-xs text-white/70">
      {quotationStatusLabel(status)}
    </span>
  );
}

type QuotationSummaryProps = {
  amount: number;
  tax: number;
  discount: number;
  currency: string;
  subtotal?: number;
  deposit?: number | null;
  balance?: number | null;
};

export function QuotationSummary({
  amount,
  tax,
  discount,
  currency,
  subtotal,
  deposit,
  balance,
}: QuotationSummaryProps) {
  return (
    <div className="grid gap-2 text-sm text-white/70 sm:grid-cols-3">
      {subtotal !== undefined ? (
        <div>
          <p className="text-xs text-white/40">{uiZh.subtotal}</p>
          <p className="mt-1 text-white">
            {formatFinanceMoney(subtotal, currency)}
          </p>
        </div>
      ) : null}
      <div>
        <p className="text-xs text-white/40">{uiZh.tax}</p>
        <p className="mt-1 text-white">{formatFinanceMoney(tax, currency)}</p>
      </div>
      <div>
        <p className="text-xs text-white/40">{uiZh.discount}</p>
        <p className="mt-1 text-white">
          {formatFinanceMoney(discount, currency)}
        </p>
      </div>
      {deposit != null && deposit > 0 ? (
        <div>
          <p className="text-xs text-white/40">{uiZh.deposit}</p>
          <p className="mt-1 text-white">
            {formatFinanceMoney(deposit, currency)}
          </p>
        </div>
      ) : null}
      {balance != null ? (
        <div>
          <p className="text-xs text-white/40">{uiZh.balanceDue}</p>
          <p className="mt-1 text-white">
            {formatFinanceMoney(balance, currency)}
          </p>
        </div>
      ) : null}
      <div>
        <p className="text-xs text-white/40">{uiZh.grandTotal}</p>
        <p className="mt-1 text-white">
          {formatFinanceMoney(amount, currency)}
        </p>
      </div>
    </div>
  );
}

export type LineItemDraft = {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  discount: number;
  itemKind?: "line" | "package" | "charge" | "discount";
  unitOfMeasure?: string | null;
  notes?: string | null;
};

export function blankLineItem(
  kind: LineItemDraft["itemKind"] = "line",
): LineItemDraft {
  return {
    key: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    discount: 0,
    itemKind: kind,
    unitOfMeasure: "Lot",
    notes: null,
  };
}

type QuotationLineItemsEditorProps = {
  items: LineItemDraft[];
  onChange: (items: LineItemDraft[]) => void;
  disabled?: boolean;
  allowEmpty?: boolean;
  addLabel?: string;
};

export function QuotationLineItemsEditor({
  items,
  onChange,
  disabled = false,
  allowEmpty = false,
  addLabel,
}: QuotationLineItemsEditorProps) {
  function updateAt(index: number, patch: Partial<LineItemDraft>) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeAt(index: number) {
    if (!allowEmpty && items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  }

  function duplicateAt(index: number) {
    const source = items[index];
    if (!source) return;
    const copy: LineItemDraft = {
      ...source,
      key: crypto.randomUUID(),
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onChange(next);
  }

  function moveAt(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [row] = next.splice(index, 1);
    next.splice(target, 0, row);
    onChange(next);
  }

  function addRow() {
    onChange([...items, blankLineItem(items[0]?.itemKind ?? "line")]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white/70">{uiZh.lineItems}</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={addRow}
          className="text-xs text-white/60 hover:text-white"
        >
          {addLabel ?? uiZh.addLineItem}
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-white/40">{uiZh.noLineItemsYet}</p>
      ) : null}
      {items.map((item, index) => {
        const lineAmount =
          Math.max(0, item.quantity * item.unitPrice - item.discount) +
          item.tax;
        return (
          <div
            key={item.key}
            className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-white/40">
                {uiZh.item} {index + 1}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled || index === 0}
                  onClick={() => moveAt(index, -1)}
                  className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
                >
                  {uiZh.moveUp}
                </button>
                <button
                  type="button"
                  disabled={disabled || index === items.length - 1}
                  onClick={() => moveAt(index, 1)}
                  className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
                >
                  {uiZh.moveDown}
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => duplicateAt(index)}
                  className="text-xs text-white/40 hover:text-white/70"
                >
                  {uiZh.duplicate}
                </button>
                <button
                  type="button"
                  disabled={
                    disabled || (!allowEmpty && items.length <= 1)
                  }
                  onClick={() => removeAt(index)}
                  className="text-xs text-white/40 hover:text-white/70 disabled:opacity-30"
                >
                  {uiZh.removeLineItem}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/45">{uiZh.description}</Label>
              <textarea
                className={`${authFieldClassName} min-h-16`}
                value={item.description}
                disabled={disabled}
                onChange={(event) =>
                  updateAt(index, { description: event.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-white/45">{uiZh.quantity}</Label>
                <Input
                  type="number"
                  min={0.01}
                  step="0.01"
                  className={authFieldClassName}
                  value={item.quantity}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(index, {
                      quantity: Number(event.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/45">{uiZh.unit}</Label>
                <Input
                  className={authFieldClassName}
                  value={item.unitOfMeasure ?? ""}
                  disabled={disabled}
                  placeholder="Lot"
                  onChange={(event) =>
                    updateAt(index, { unitOfMeasure: event.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/45">{uiZh.unitPrice}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className={authFieldClassName}
                  value={item.unitPrice}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(index, {
                      unitPrice: Number(event.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/45">{uiZh.discount}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className={authFieldClassName}
                  value={item.discount}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(index, {
                      discount: Number(event.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-white/45">{uiZh.tax}</Label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className={authFieldClassName}
                  value={item.tax}
                  disabled={disabled}
                  onChange={(event) =>
                    updateAt(index, { tax: Number(event.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/45">
              <span>{uiZh.amount}</span>
              <span className="text-white/80">
                {lineAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/45">{uiZh.lineNotes}</Label>
              <textarea
                className={`${authFieldClassName} min-h-14`}
                value={item.notes ?? ""}
                disabled={disabled}
                placeholder={uiZh.lineNotesPlaceholder}
                onChange={(event) =>
                  updateAt(index, { notes: event.target.value })
                }
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

type QuotationLineItemsTableProps = {
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    tax: number;
    discount: number;
    amount: number;
    unitOfMeasure?: string | null;
    notes?: string | null;
  }>;
  currency: string;
};

export function QuotationLineItemsTable({
  items,
  currency,
}: QuotationLineItemsTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-white/45">{uiZh.atLeastOneLineItem}</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-white">{item.description}</p>
            <p className="text-sm text-white/80">
              {formatFinanceMoney(item.amount, currency)}
            </p>
          </div>
          <p className="mt-1 text-xs text-white/45">
            {item.quantity}
            {item.unitOfMeasure ? ` ${item.unitOfMeasure}` : ""} ×{" "}
            {formatFinanceMoney(item.unitPrice, currency)}
            {item.tax > 0
              ? ` · tax ${formatFinanceMoney(item.tax, currency)}`
              : ""}
            {item.discount > 0
              ? ` · discount ${formatFinanceMoney(item.discount, currency)}`
              : ""}
          </p>
          {item.notes ? (
            <p className="mt-2 whitespace-pre-wrap text-xs text-white/40">
              {item.notes}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
