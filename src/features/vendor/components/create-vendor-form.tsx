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
import { uiZh } from "@/config/ui-zh";
import { createVendorAction } from "@/core/actions/vendor-actions";
import {
  VENDOR_CATEGORIES,
  type Project,
} from "@/core/types";
import { authFieldClassName } from "@/features/auth/lib/auth-ui";
import { vendorCategoryLabel } from "@/features/vendor/lib/vendor-context";
import type { VendorOwnerOption } from "@/features/vendor/lib/vendor-owners";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";

const formSchema = z.object({
  workspaceId: z.string().uuid(),
  companyId: z.string().uuid(),
  projectId: z.string().uuid().optional().or(z.literal("")),
  ownerId: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(1, uiZh.vendorNameRequired).max(160),
  companyName: z.string().max(160).optional(),
  contactPerson: z.string().max(160).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional(),
  website: z.string().max(300).optional(),
  address: z.string().max(500).optional(),
  category: z.enum(VENDOR_CATEGORIES),
  status: z.enum(["active", "inactive"] as const),
  notes: z.string().max(4000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type CreateVendorFormProps = {
  workspaceId: string;
  companyId: string;
  projects: Project[];
  owners: VendorOwnerOption[];
  defaultProjectId?: string;
  defaultOwnerId?: string;
  returnTo?: string;
};

export function CreateVendorForm({
  workspaceId,
  companyId,
  projects,
  owners,
  defaultProjectId = "",
  defaultOwnerId = "",
  returnTo = "/dashboard/vendors",
}: CreateVendorFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workspaceId,
      companyId,
      projectId: defaultProjectId,
      ownerId: defaultOwnerId,
      name: "",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      address: "",
      category: "others",
      status: "active",
      notes: "",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createVendorAction({
            workspaceId: values.workspaceId,
            companyId: values.companyId,
            projectId: values.projectId || null,
            ownerId: values.ownerId || null,
            name: values.name,
            companyName: values.companyName || null,
            contactPerson: values.contactPerson || null,
            email: values.email || null,
            phone: values.phone || null,
            website: values.website || null,
            address: values.address || null,
            category: values.category,
            status: values.status,
            notes: values.notes || null,
          });
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(uiZh.vendorCreated);
          const destination =
            returnTo !== "/dashboard/vendors"
              ? returnTo
              : buildWorkspaceOverviewHref("vendor", result.data.vendorId);
          router.push(destination);
          router.refresh();
        });
      })}
    >
      <input type="hidden" {...form.register("workspaceId")} />
      <input type="hidden" {...form.register("companyId")} />

      <div className="space-y-2">
        <Label htmlFor="vendor-name">{uiZh.name}</Label>
        <Input
          id="vendor-name"
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
          <Label htmlFor="vendor-company-name">{uiZh.companyName}</Label>
          <Input
            id="vendor-company-name"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("companyName")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor-contact">{uiZh.contactPerson}</Label>
          <Input
            id="vendor-contact"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("contactPerson")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendor-category">{uiZh.category}</Label>
          <select
            id="vendor-category"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("category")}
          >
            {VENDOR_CATEGORIES.map((category) => (
              <option key={category} value={category} className="bg-[#121214]">
                {vendorCategoryLabel(category)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor-status">{uiZh.status}</Label>
          <select
            id="vendor-status"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("status")}
          >
            <option value="active" className="bg-[#121214]">
              {uiZh.active}
            </option>
            <option value="inactive" className="bg-[#121214]">
              {uiZh.inactive}
            </option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendor-email">{uiZh.email}</Label>
          <Input
            id="vendor-email"
            type="email"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor-phone">{uiZh.phone}</Label>
          <Input
            id="vendor-phone"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("phone")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="vendor-website">{uiZh.website}</Label>
          <Input
            id="vendor-website"
            className={authFieldClassName}
            disabled={pending}
            {...form.register("website")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vendor-owner">{uiZh.assignedOwner}</Label>
          <select
            id="vendor-owner"
            className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
            disabled={pending}
            {...form.register("ownerId")}
          >
            <option value="" className="bg-[#121214]">
              {uiZh.unassigned}
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendor-address">{uiZh.address}</Label>
        <Input
          id="vendor-address"
          className={authFieldClassName}
          disabled={pending}
          {...form.register("address")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendor-project">{uiZh.relatedProjectOptional}</Label>
        <select
          id="vendor-project"
          className="h-8 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 text-sm text-white"
          disabled={pending}
          {...form.register("projectId")}
        >
          <option value="" className="bg-[#121214]">
            {uiZh.noProject}
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id} className="bg-[#121214]">
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vendor-notes">{uiZh.notes}</Label>
        <textarea
          id="vendor-notes"
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
        {pending ? uiZh.creating : uiZh.createVendor}
      </Button>
    </form>
  );
}
