"use client";

import Link from "next/link";

import { ModuleEmptyState } from "@/components/layout/module-empty-state";
import { WorkspaceEntityLink } from "@/components/layout/workspace-entity-link";
import { buttonVariants } from "@/components/ui/button";
import type { Client, Project } from "@/core/types";
import { buildWorkspaceOverviewHref } from "@/lib/workspace/cross-navigation";
import { cn } from "@/lib/utils";
import { uiZh } from "@/config/ui-zh";

type ProjectWorkspaceClientsPanelProps = {
  project: Project;
  clients: Client[];
  canWriteClient: boolean;
  canReadClient: boolean;
};

function statusLabel(status: string) {
  if (status === "follow_up") return uiZh.followUp;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function clientTypeLabel(type: Client["client_type"]) {
  if (!type) return uiZh.unspecified;
  if (type === "corporate") return uiZh.corporateClient;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function ProjectWorkspaceClientsPanel({
  project,
  clients,
  canWriteClient,
  canReadClient,
}: ProjectWorkspaceClientsPanelProps) {
  if (!canReadClient) {
    return (
      <ModuleEmptyState
        title={uiZh.clientsUnavailable}
        description={uiZh.clientsUnavailableDesc}
      />
    );
  }

  const visibleClients = clients.filter((client) => client.status !== "archived");

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-medium text-white">
            Linked clients ({visibleClients.length})
          </h2>
          <p className="mt-1 text-xs text-white/45">
            Clients attached to this project
          </p>
        </div>
        {canWriteClient && project.status !== "archived" ? (
          <Link
            href={`/dashboard/clients/new?projectId=${project.id}`}
            className="inline-flex w-fit rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/[0.05]"
          >
            Add client
          </Link>
        ) : null}
      </div>

      {visibleClients.length === 0 ? (
        <ModuleEmptyState
          title={uiZh.noClientsLinked}
          description={uiZh.noClientsLinkedDesc}
          actionHref={
            canWriteClient && project.status !== "archived"
              ? `/dashboard/clients/new?projectId=${project.id}`
              : undefined
          }
          actionLabel={canWriteClient ? uiZh.addClient : undefined}
        />
      ) : (
        <ul className="space-y-3">
          {visibleClients.map((client) => (
            <li
              key={client.id}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <WorkspaceEntityLink
                    kind="client"
                    id={client.id}
                    className="truncate text-sm font-medium"
                  >
                    {client.name}
                  </WorkspaceEntityLink>
                  <p className="mt-1 truncate text-xs text-white/45">
                    {clientTypeLabel(client.client_type)} ·{" "}
                    {statusLabel(client.status)}
                    {client.email ? ` · ${client.email}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={buildWorkspaceOverviewHref("client", client.id)}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    Open
                  </Link>
                  {canWriteClient && client.status !== "archived" ? (
                    <Link
                      href={`/dashboard/clients/${client.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Edit
                    </Link>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
