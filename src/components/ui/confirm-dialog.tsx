"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uiZh } from "@/config/ui-zh";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  pending?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
};

/**
 * Minimal confirm gate for destructive/lifecycle CRM actions (MVP Phase 3).
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending = false,
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-white/55">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-white/[0.06] bg-transparent">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {uiZh.cancel}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
