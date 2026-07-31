"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProjectForm } from "@/components/projects/project-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uiZh } from "@/config/ui-zh";
import type { Client } from "@/core/types";

type ProjectCreateDialogProps = {
  workspaceId: string;
  companyId: string;
  clients: Client[];
};

export function ProjectCreateDialog({
  workspaceId,
  companyId,
  clients,
}: ProjectCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {uiZh.newProject}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{uiZh.createProject}</DialogTitle>
            <DialogDescription className="text-white/45">
              {uiZh.createProjectDesc}
            </DialogDescription>
          </DialogHeader>
          <ProjectForm
            workspaceId={workspaceId}
            companyId={companyId}
            clients={clients}
            onCancel={() => setOpen(false)}
            onSuccess={(projectId) => {
              setOpen(false);
              router.push(`/dashboard/projects/${projectId}`);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
