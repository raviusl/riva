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
};

export function QuotationSummary({
  amount,
  tax,
  discount,
  currency,
}: QuotationSummaryProps) {
  return (
    <div className="grid gap-2 text-sm text-white/70 sm:grid-cols-3">
      <div>
        <p className="text-xs text-white/40">{uiZh.tax}</p>
        <p className="mt-1 text-white">{formatFinanceMoney(tax, currency)}</p>
      </div>
      <div>
        <p className="text-xs text-white/40">Discount</p>
        <p className="mt-1 text-white">
          {formatFinanceMoney(discount, currency)}
        </p>
      </div>
      <div>
        <p className="text-xs text-white/40">{uiZh.total}</p>
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
};

type QuotationLineItemsEditorProps = {
  items: LineItemDraft[];
  onChange: (items: LineItemDraft[]) => void;
  disabled?: boolean;
};

export function QuotationLineItemsEditor({
  items,
  onChange,
  disabled = false,
}: QuotationLineItemsEditorProps) {
  function updateAt(index: number, patch: Partial<LineItemDraft>) {
    onChange(
      items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeAt(index: number) {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([
      ...items,
      {
        key: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        discount: 0,
      },
    ]);
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
          {uiZh.addLineItem}
        </Button>
      </div>
      {items.map((item, index) => (
        <div
          key={item.key}
          className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
        >
          <div className="space-y-1.5">
            <Label className="text-xs text-white/45">{uiZh.description}</Label>
            <Input
              className={authFieldClassName}
              value={item.description}
              disabled={disabled}
              onChange={(event) =>
                updateAt(index, { description: event.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
            <div className="space-y-1.5">
              <Label className="text-xs text-white/45">Discount</Label>
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
          </div>
          {items.length > 1 ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeAt(index)}
              className="text-xs text-white/40 hover:text-white/70"
            >
              {uiZh.removeLineItem}
            </button>
          ) : null}
        </div>
      ))}
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
            {item.quantity} × {formatFinanceMoney(item.unitPrice, currency)}
            {item.tax > 0
              ? ` · tax ${formatFinanceMoney(item.tax, currency)}`
              : ""}
            {item.discount > 0
              ? ` · discount ${formatFinanceMoney(item.discount, currency)}`
              : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}
