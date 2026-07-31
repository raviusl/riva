"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  TaskForm,
  type TaskAssigneeOption,
} from "@/components/tasks/task-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uiZh } from "@/config/ui-zh";
import type { Project } from "@/core/types";

type TaskCreateDialogProps = {
  workspaceId: string;
  companyId: string;
  projects: Pick<Project, "id" | "name">[];
  assignees: TaskAssigneeOption[];
  canAssign: boolean;
  defaultProjectId?: string;
};

export function TaskCreateDialog({
  workspaceId,
  companyId,
  projects,
  assignees,
  canAssign,
  defaultProjectId,
}: TaskCreateDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {uiZh.newTask}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">{uiZh.createTask}</DialogTitle>
            <DialogDescription className="text-white/45">
              {uiZh.createTaskDesc}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            workspaceId={workspaceId}
            companyId={companyId}
            projects={projects}
            assignees={assignees}
            canAssign={canAssign}
            defaultProjectId={defaultProjectId}
            onCancel={() => setOpen(false)}
            onSuccess={(taskId) => {
              setOpen(false);
              router.push(`/dashboard/tasks/${taskId}`);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
