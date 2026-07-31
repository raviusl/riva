"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { createInvitationAction } from "@/features/auth/actions/invitation-actions";
import {
  InviteUserFields,
  notifyInvitationDelivery,
  useInviteUserForm,
  useResetInviteFormOnOpen,
} from "@/features/auth/components/invite-user-fields";

export function InviteUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useInviteUserForm();
  useResetInviteFormOnOpen(open, form);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-white/10 bg-[#121214] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">{uiZh.inviteUser}</DialogTitle>
          <DialogDescription className="text-white/45">
            {uiZh.inviteUserDesc}
          </DialogDescription>
        </DialogHeader>

        <form
          id="invite-user-dialog-form"
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await createInvitationAction(values);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              notifyInvitationDelivery(result.data);
              onOpenChange(false);
              router.refresh();
            });
          })}
        >
          <InviteUserFields form={form} idPrefix="dialog-invite" />
        </form>

        <DialogFooter className="border-white/10 bg-transparent sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-transparent text-white hover:bg-white/5"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            {uiZh.cancel}
          </Button>
          <Button
            type="submit"
            form="invite-user-dialog-form"
            disabled={pending}
            className="bg-white text-black hover:bg-white/90"
          >
            {pending ? uiZh.sending : uiZh.sendInvitation}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
