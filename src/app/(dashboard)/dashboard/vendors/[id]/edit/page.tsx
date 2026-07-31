import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { uiZh } from "@/config/ui-zh";
import { requireDashboardContext } from "@/core/auth/context";
import { listProjectsByCompany } from "@/core/project/project";
import { getVendorById } from "@/core/vendor/vendor";
import { EditVendorForm } from "@/features/vendor/components/edit-vendor-form";
import { listVendorOwnerOptions } from "@/features/vendor/lib/vendor-owners";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditVendorPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireDashboardContext();

  if (!context.permissions.has("vendor.write")) {
    redirect("/dashboard/vendors");
  }

  let vendor;
  try {
    vendor = await getVendorById(
      id,
      context.workspace.id,
      context.company.id,
    );
  } catch {
    notFound();
  }

  if (vendor.status === "archived") {
    redirect(`/dashboard/vendors/${vendor.id}`);
  }

  const [projects, owners] = await Promise.all([
    listProjectsByCompany(context.workspace.id, context.company.id),
    listVendorOwnerOptions(context.workspace.id, context.company.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-8">
      <div>
        <Link
          href={`/dashboard/vendors/${vendor.id}`}
          className="text-xs text-white/40 hover:text-white/70"
        >
          ← {vendor.name}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.editVendor}</h1>
        <p className="mt-2 text-sm text-white/45">{vendor.name}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <EditVendorForm
          vendor={vendor}
          projects={projects}
          owners={owners}
        />
      </div>
    </div>
  );
}
