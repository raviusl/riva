"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectAction } from "@/core/actions/project-actions";
import { PROJECT_TYPES, type Project } from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import { uiZh } from "@/config/ui-zh";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string().min(1, uiZh.projectNameRequired).max(160),
  projectType: z.enum(PROJECT_TYPES).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type EditProjectFormProps = {
  project: Project;
};

export function EditProjectForm({ project }: EditProjectFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId: project.workspace_id,
      companyId: project.company_id,
      projectId: project.id,
      name: project.name,
      projectType: project.project_type ?? "other",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await updateProjectAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            projectId: values.projectId,
            name: values.name,
            projectType: values.projectType,
            status: project.status === "archived" ? "planning" : project.status,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.projectUpdated);
          router.push("/dashboard/projects");
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />
      <input type="hidden" {...form.register("projectId")} />

      <div className="space-y-2">
        <Label htmlFor="edit-project-name">{uiZh.projectName}</Label>
        <Input
          id="edit-project-name"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("name")}
        />
        {form.formState.errors.name ? (
          <p className="text-xs text-red-400">
            {form.formState.errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-type">{uiZh.type}</Label>
        <select
          id="edit-project-type"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("projectType")}
        >
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type} className="bg-[#121214]">
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? uiZh.saving : uiZh.saveChanges}
      </Button>
    </form>
  );
}
