import Link from "next/link";

import { uiZh } from "@/config/ui-zh";
import { CreateWorkspaceForm } from "@/features/workspace/components/create-workspace-form";

export default function NewWorkspacePage() {
  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <div>
        <Link
          href="/dashboard/workspaces"
          className="text-xs text-white/40 hover:text-white/70"
        >
          {uiZh.backToList(uiZh.workspaces)}
        </Link>
        <h1 className="mt-3 text-xl text-white">{uiZh.createWorkspace}</h1>
        <p className="mt-2 text-sm text-white/45">{uiZh.createWorkspaceHint}</p>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
