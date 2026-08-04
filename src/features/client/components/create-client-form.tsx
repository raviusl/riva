"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { formatClientStatus } from "@/components/crm/client-notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientAction } from "@/core/actions/client-actions";
import {
  CLIENT_TYPES,
  type ClientStatus,
  type ClientType,
  type Project,
} from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { uiZh } from "@/config/ui-zh";

const CREATE_CLIENT_STATUSES = [
  "inquiry",
  "follow_up",
  "confirmed",
  "completed",
  "cancelled",
] as const satisfies readonly ClientStatus[];

const createClientFormSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  ownerId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, uiZh.clientNameRequired).max(160),
  brideName: z.string().max(160).optional(),
  groomName: z.string().max(160).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(40).optional(),
  weddingDate: z.string().optional(),
  venue: z.string().max(300).optional(),
  clientType: z.enum(CLIENT_TYPES),
  status: z.enum(CREATE_CLIENT_STATUSES),
  followUpAt: z.string().optional(),
  notes: z.string().max(4000).optional(),
});

function clientTypeLabel(type: ClientType): string {
  switch (type) {
    case "wedding":
      return uiZh.weddingMode;
    case "corporate":
      return uiZh.corporateClient;
    case "private":
      return "Private";
    case "others":
      return "Others";
  }
}

type FormValues = z.infer<typeof createClientFormSchema>;

export type ClientOwnerOption = {
  userId: string;
  fullName: string;
};

type CreateClientFormProps = {
  workspaceId: string;
  companyId: string;
  projects: Project[];
  owners: ClientOwnerOption[];
  defaultProjectId?: string;
  defaultOwnerId?: string;
  returnTo?: string;
};

export function CreateClientForm({
  workspaceId,
  companyId,
  projects,
  owners,
  defaultProjectId = "",
  defaultOwnerId = "",
  returnTo = "/dashboard/clients",
}: CreateClientFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(createClientFormSchema),
    defaultValues: {
      workspaceId,
      companyId,
      projectId: defaultProjectId,
      ownerId: defaultOwnerId,
      name: "",
      brideName: "",
      groomName: "",
      email: "",
      phone: "",
      whatsapp: "",
      weddingDate: "",
      venue: "",
      clientType: "wedding",
      status: "inquiry",
      followUpAt: "",
      notes: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createClientAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            projectId: values.projectId || null,
            ownerId: values.ownerId || null,
            leadOwnerId: values.ownerId || null,
            name: values.name,
            brideName: values.brideName || null,
            groomName: values.groomName || null,
            email: values.email || null,
            phone: values.phone || null,
            whatsapp: values.whatsapp || null,
            weddingDate: values.weddingDate || null,
            venue: values.venue || null,
            clientType: values.clientType,
            status: values.status,
            followUpAt: values.followUpAt || null,
            notes: values.notes || null,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.clientCreated);
          const destination =
            returnTo !== "/dashboard/clients"
              ? returnTo
              : buildWorkspaceOverviewHref("client", result.data.clientId);
          router.push(destination);
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />

      <div className="space-y-2">
        <Label htmlFor="client-name">{uiZh.name}</Label>
        <Input
          id="client-name"
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="bride-name">{uiZh.brideName}</Label>
          <Input
            id="bride-name"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("brideName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groom-name">{uiZh.groomName}</Label>
          <Input
            id="groom-name"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("groomName")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-type">{uiZh.type}</Label>
          <select
            id="client-type"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("clientType")}
          >
            {CLIENT_TYPES.map((type) => (
              <option key={type} value={type} className="bg-[#121214]">
                {clientTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-status">{uiZh.status}</Label>
          <select
            id="client-status"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("status")}
          >
            {CREATE_CLIENT_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[#121214]">
                {formatClientStatus(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="wedding-date">{uiZh.weddingDate}</Label>
          <Input
            id="wedding-date"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("weddingDate")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="venue">{uiZh.venue}</Label>
          <Input
            id="venue"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("venue")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-email">{uiZh.email}</Label>
          <Input
            id="client-email"
            type="email"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-phone">{uiZh.phone}</Label>
          <Input
            id="client-phone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-whatsapp">{uiZh.whatsapp}</Label>
        <Input
          id="client-whatsapp"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("whatsapp")}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="client-owner">{uiZh.assignedOwner}</Label>
          <select
            id="client-owner"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("ownerId")}
          >
            <option value="" className="bg-[#121214]">
              Unassigned
            </option>
            {owners.map((owner) => (
              <option
                key={owner.userId}
                value={owner.userId}
                className="bg-[#121214]"
              >
                {owner.fullName}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="client-follow-up">{uiZh.followUpDate}</Label>
          <Input
            id="client-follow-up"
            type="date"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("followUpAt")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-project">{uiZh.relatedProjectOptional}</Label>
        <select
          id="client-project"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("projectId")}
        >
          <option value="" className="bg-[#121214]">
            No project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id} className="bg-[#121214]">
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="client-notes">{uiZh.notes}</Label>
        <textarea
          id="client-notes"
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
          disabled={pending}
          {...form.register("notes")}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="bg-white text-black hover:bg-white/90"
      >
        {pending ? uiZh.creating : uiZh.createClient}
      </Button>
    </form>
  );
}
