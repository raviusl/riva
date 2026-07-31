"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import {
  formatTaskPriority,
  TASK_FOUNDATION_PRIORITIES,
} from "@/components/tasks/task-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uiZh } from "@/config/ui-zh";
import { createTaskAction } from "@/core/actions/task-actions";
import type { Project } from "@/core/types";

const taskFormSchema = z
  .object({
    title: z.string().trim().min(1, uiZh.taskNameRequired).max(200),
    projectId: z.string().uuid(uiZh.selectAProject),
    assigneeId: z.string().uuid().optional().or(z.literal("")),
    priority: z.enum(TASK_FOUNDATION_PRIORITIES),
    dueDate: z.string().optional().or(z.literal("")),
    description: z.string().trim().max(5000).optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    if (values.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(values.dueDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: uiZh.dateFormatHint,
      });
    }
  });

export type TaskFormValues = z.infer<typeof taskFormSchema>;

export type TaskAssigneeOption = {
  userId: string;
  fullName: string;
};

type TaskFormProps = {
  workspaceId: string;
  companyId: string;
  projects: Pick<Project, "id" | "name">[];
  assignees: TaskAssigneeOption[];
  canAssign: boolean;
  defaultProjectId?: string;
  onSuccess?: (taskId: string) => void;
  onCancel?: () => void;
};

const selectClassName =
  "h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-white outline-none transition focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/10 disabled:opacity-40";

export function TaskForm({
  workspaceId,
  companyId,
  projects,
  assignees,
  canAssign,
  defaultProjectId = "",
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      projectId: defaultProjectId || "",
      assigneeId: "",
      priority: "normal",
      dueDate: "",
      description: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createTaskAction({
            workspaceId,
            companyId,
            title: values.title,
            description: values.description || null,
            priority: values.priority,
            status: "todo",
            dueDate: values.dueDate || null,
            relatedProjectId: values.projectId,
            assigneeId:
              canAssign && values.assigneeId ? values.assigneeId : null,
          });

          if (!result.ok) {
            toast.error(result.error);
            return;
          }

          toast.success(uiZh.taskCreated);
          form.reset();
          if (onSuccess) {
            onSuccess(result.data.task.id);
          } else {
            router.push(`/dashboard/tasks/${result.data.task.id}`);
          }
          router.refresh();
        });
      })}
    >
      <div className="space-y-2">
        <Label htmlFor="task-name">{uiZh.taskName}</Label>
        <Input
          id="task-name"
          placeholder={uiZh.taskName}
          disabled={pending}
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-red-300/90">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-project">{uiZh.projects}</Label>
        <select
          id="task-project"
          className={selectClassName}
          disabled={pending || projects.length === 0}
          {...form.register("projectId")}
        >
          <option value="" className="bg-[#121214]">
            {uiZh.selectProject}
          </option>
          {projects.map((project) => (
            <option
              key={project.id}
              value={project.id}
              className="bg-[#121214]"
            >
              {project.name}
            </option>
          ))}
        </select>
        {form.formState.errors.projectId ? (
          <p className="text-xs text-red-300/90">
            {form.formState.errors.projectId.message}
          </p>
        ) : null}
        {projects.length === 0 ? (
          <p className="text-xs text-white/40">
            {uiZh.createProjectBeforeTasks}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-assignee">{uiZh.assignee}</Label>
        <select
          id="task-assignee"
          className={selectClassName}
          disabled={pending || !canAssign}
          {...form.register("assigneeId")}
        >
          <option value="" className="bg-[#121214]">
            {uiZh.unassigned}
          </option>
          {assignees.map((member) => (
            <option
              key={member.userId}
              value={member.userId}
              className="bg-[#121214]"
            >
              {member.fullName}
            </option>
          ))}
        </select>
        {!canAssign ? (
          <p className="text-xs text-white/40">
            {uiZh.noAssignPermission}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-priority">{uiZh.priority}</Label>
          <select
            id="task-priority"
            className={selectClassName}
            disabled={pending}
            {...form.register("priority")}
          >
            {TASK_FOUNDATION_PRIORITIES.map((priority) => (
              <option
                key={priority}
                value={priority}
                className="bg-[#121214]"
              >
                {formatTaskPriority(priority)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-due">{uiZh.dueDate}</Label>
          <Input
            id="task-due"
            type="date"
            disabled={pending}
            {...form.register("dueDate")}
          />
          {form.formState.errors.dueDate ? (
            <p className="text-xs text-red-300/90">
              {form.formState.errors.dueDate.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">{uiZh.description}</Label>
        <Textarea
          id="task-description"
          placeholder={uiZh.optionalDescription}
          disabled={pending}
          {...form.register("description")}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onCancel}
          >
            {uiZh.cancel}
          </Button>
        ) : null}
        <Button type="submit" disabled={pending || projects.length === 0}>
          {pending ? uiZh.creating : uiZh.createTask}
        </Button>
      </div>
    </form>
  );
}
