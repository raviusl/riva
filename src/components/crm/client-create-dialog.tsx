"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ClientForm } from "@/components/crm/client-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uiZh } from "@/config/ui-zh";

type ClientCreateDialogProps = {
  workspaceId: string;
  companyId: string;
};

export function ClientCreateDialog({
  workspaceId,
  companyId,
}: ClientCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
        <Button
        type="button"
        onClick={() => setOpen(true)}
      >
        {uiZh.newClient}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{uiZh.createClient}</DialogTitle>
            <DialogDescription className="text-white/45">
              {uiZh.createClientDesc}
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            workspaceId={workspaceId}
            companyId={companyId}
            onCancel={() => setOpen(false)}
            onSuccess={(clientId) => {
              setOpen(false);
              router.push(`/dashboard/clients/${clientId}`);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
